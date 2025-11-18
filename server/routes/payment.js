const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Commerce = require('coinbase-commerce-node');
const Reservation = require('../models/Reservation');
const PaymentToken = require('../models/PaymentToken');
const { sendConfirmationEmail } = require('../utils/email');
const { syncToPostgres } = require('../utils/dbSync');

const Client = Commerce.Client;
Client.init(process.env.COINBASE_COMMERCE_API_KEY);
const Charge = Commerce.resources.Charge;

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

        // Create Coinbase Commerce charge
        const chargeData = {
            name: `Konchamar Resort - ${reservation.accommodationId.name}`,
            description: `Reservation ${reservation.reservationId}`,
            local_price: {
                amount: reservation.pricing.total.toFixed(2),
                currency: 'USD'
            },
            pricing_type: 'fixed_price',
            metadata: {
                reservationId: reservation.reservationId,
                checkIn: reservation.dates.checkIn.toISOString(),
                checkOut: reservation.dates.checkOut.toISOString()
            }
        };

        const charge = await Charge.create(chargeData);

        // Store Bitcoin payment details
        await PaymentToken.create({
            reservationId: reservation.reservationId,
            btcAddress: charge.addresses.bitcoin,
            btcAmount: charge.pricing.bitcoin.amount
        });

        // Update payment reference
        reservation.paymentRef = charge.id;
        await reservation.save();

        res.json({
            success: true,
            address: charge.addresses.bitcoin,
            amount_btc: charge.pricing.bitcoin.amount,
            amount_usd: reservation.pricing.total,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=bitcoin:${charge.addresses.bitcoin}?amount=${charge.pricing.bitcoin.amount}`,
            hostedUrl: charge.hosted_url,
            expiresAt: charge.expires_at
        });

    } catch (error) {
        console.error('Bitcoin payment error:', error);
        res.status(500).json({ success: false, message: 'Bitcoin payment generation error' });
    }
});

// Coinbase Commerce webhook
router.post('/webhooks/coinbase', async (req, res) => {
    try {
        const rawBody = req.rawBody; // Need raw body for signature verification
        const signature = req.headers['x-cc-webhook-signature'];

        // Verify webhook signature
        const Webhook = Commerce.Webhook;
        try {
            const event = Webhook.verifyEventBody(
                rawBody,
                signature,
                process.env.COINBASE_WEBHOOK_SECRET
            );

            if (event.type === 'charge:confirmed') {
                const chargeId = event.data.id;
                const reservationId = event.data.metadata.reservationId;

                // Find and update reservation
                const reservation = await Reservation.findOne({ reservationId });

                if (reservation) {
                    reservation.paymentStatus = 'completed';
                    reservation.paymentRef = chargeId;
                    await reservation.save();

                    // Sync to PostgreSQL
                    await syncToPostgres(reservation);

                    // Send confirmation email
                    const decryptedEmail = reservation.getDecryptedEmail();
                    await sendConfirmationEmail(reservation, decryptedEmail);

                    console.log(`Bitcoin payment confirmed for reservation ${reservationId}`);
                }
            }

            res.status(200).send('Webhook received');
        } catch (error) {
            console.error('Webhook verification failed:', error);
            res.status(400).send('Webhook verification failed');
        }
    } catch (error) {
        console.error('Coinbase webhook error:', error);
        res.status(500).send('Webhook processing error');
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
