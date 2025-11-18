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
        const { reservationId, stripeToken } = req.body;

        if (!reservationId || !stripeToken) {
            return res.status(400).json({
                success: false,
                message: 'Reservation ID and Stripe token are required'
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

        // Create Stripe charge
        const charge = await stripe.charges.create({
            amount: Math.round(reservation.pricing.total * 100), // Amount in cents
            currency: 'usd',
            source: stripeToken,
            description: `Konchamar Resort - ${reservation.accommodationId.name}`,
            metadata: {
                reservationId: reservation.reservationId,
                checkIn: reservation.dates.checkIn.toISOString(),
                checkOut: reservation.dates.checkOut.toISOString()
            }
        });

        if (charge.status === 'succeeded') {
            // Update reservation
            reservation.paymentStatus = 'completed';
            reservation.paymentRef = charge.id;
            await reservation.save();

            // Store payment token (encrypted)
            await PaymentToken.create({
                reservationId: reservation.reservationId,
                stripeToken: charge.id
            });

            // Sync to PostgreSQL
            await syncToPostgres(reservation);

            // Send confirmation email
            const decryptedEmail = reservation.getDecryptedEmail();
            await sendConfirmationEmail(reservation, decryptedEmail);

            res.json({
                success: true,
                reservationId: reservation.reservationId,
                message: 'Payment processed successfully',
                confirmationSent: true
            });
        } else {
            // Payment failed
            reservation.paymentStatus = 'failed';
            await reservation.save();

            res.status(400).json({
                success: false,
                message: 'Payment failed. Please try again.'
            });
        }

    } catch (error) {
        console.error('Credit card payment error:', error);

        // Handle Stripe errors
        if (error.type === 'StripeCardError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ success: false, message: 'Payment processing error' });
    }
});

// Generate Bitcoin payment
router.post('/bitcoin', async (req, res) => {
    try {
        const { reservationId } = req.body;

        if (!reservationId) {
            return res.status(400).json({ success: false, message: 'Reservation ID required' });
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

        // Get Bitcoin wallet address from environment
        const btcWalletAddress = process.env.BTC_WALLET_ADDRESS || 'Not configured';

        // Generate QR code for the Bitcoin address
        const btcUri = `bitcoin:${btcWalletAddress}?amount=${(reservation.pricing.total / 50000).toFixed(8)}&label=Konchamar Resort`;
        const qrCodeDataUrl = await QRCode.toDataURL(btcUri);

        // Update payment reference with pending status
        reservation.paymentStatus = 'pending_bitcoin';
        reservation.paymentRef = `BTC-${reservationId}`;
        await reservation.save();

        // Store Bitcoin payment details
        await PaymentToken.create({
            reservationId: reservation.reservationId,
            btcAddress: btcWalletAddress,
            btcAmount: (reservation.pricing.total / 50000).toFixed(8) // Rough BTC conversion
        });

        res.json({
            success: true,
            address: btcWalletAddress,
            amount_btc: (reservation.pricing.total / 50000).toFixed(8), // Approximate conversion
            amount_usd: reservation.pricing.total,
            qrCode: qrCodeDataUrl,
            message: 'Please send the exact BTC amount to the address above. Contact us after payment with your transaction ID.',
            contactEmail: process.env.ADMIN_EMAIL || 'admin@konchamar.online',
            contactPhone: '+1 314-2023148'
        });

    } catch (error) {
        console.error('Bitcoin payment error:', error);
        res.status(500).json({ success: false, message: 'Bitcoin payment generation error' });
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
