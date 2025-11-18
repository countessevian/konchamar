const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Reservation = require('../models/Reservation');
const Availability = require('../models/Availability');
const Accommodation = require('../models/Accommodation');
const PaymentToken = require('../models/PaymentToken');
const { postgresPool } = require('../config/database');

// Check availability
router.post('/availability/check', [
    body('checkIn').isISO8601().toDate(),
    body('checkOut').isISO8601().toDate(),
    body('accommodationType').isIn(['room', 'suite', 'villa', 'event_hall'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { checkIn, checkOut, accommodationType } = req.body;

        // Find accommodation
        const accommodation = await Accommodation.findOne({ type: accommodationType, isActive: true });
        if (!accommodation) {
            return res.status(404).json({ success: false, message: 'Accommodation not found' });
        }

        // Generate date range
        const dates = [];
        const currentDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        while (currentDate < endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Check availability for each date
        const availabilityChecks = await Promise.all(
            dates.map(date =>
                Availability.findOne({
                    accommodationId: accommodation._id,
                    date: {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lt: new Date(date.setHours(23, 59, 59, 999))
                    }
                })
            )
        );

        const isAvailable = availabilityChecks.every(check => check && check.available > 0);

        if (isAvailable) {
            res.json({
                success: true,
                available: true,
                message: 'Accommodation is available for selected dates'
            });
        } else {
            // Find alternative dates (next 7 days)
            const suggestedDates = await findAlternativeDates(accommodation._id, checkIn, 7);

            res.json({
                success: true,
                available: false,
                message: 'Selected dates are not available',
                suggestedDates
            });
        }
    } catch (error) {
        console.error('Availability check error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create booking
router.post('/create', [
    body('accommodationId').isMongoId(),
    body('checkIn').isISO8601().toDate(),
    body('checkOut').isISO8601().toDate(),
    body('guests').isInt({ min: 1, max: 50 }),
    body('guestDetails.name').trim().notEmpty(),
    body('guestDetails.email').isEmail(),
    body('guestDetails.phone').trim().notEmpty(),
    body('guestDetails.address').trim().notEmpty(),
    body('paymentMethod').isIn(['credit_card', 'bitcoin'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const {
            accommodationId,
            checkIn,
            checkOut,
            guests,
            guestDetails,
            addOns,
            paymentMethod,
            specialRequests
        } = req.body;

        // Validate accommodation exists
        const accommodation = await Accommodation.findById(accommodationId);
        if (!accommodation) {
            return res.status(404).json({ success: false, message: 'Accommodation not found' });
        }

        // Validate guest capacity
        if (guests > accommodation.capacity) {
            return res.status(400).json({
                success: false,
                message: `Maximum capacity is ${accommodation.capacity} guests`
            });
        }

        // Calculate pricing
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const subtotal = accommodation.basePrice * nights;

        let addOnsTotal = 0;
        const processedAddOns = [];

        if (addOns && addOns.length > 0) {
            const addonPrices = {
                spa: parseFloat(process.env.SPA_PACKAGE),
                surf: parseFloat(process.env.SURF_LESSON),
                transfer: parseFloat(process.env.AIRPORT_TRANSFER),
                catering: parseFloat(process.env.CATERING_PER_PERSON) * guests
            };

            addOns.forEach(addon => {
                if (addonPrices[addon]) {
                    addOnsTotal += addonPrices[addon];
                    processedAddOns.push({
                        name: addon,
                        price: addonPrices[addon]
                    });
                }
            });
        }

        const tax = (subtotal + addOnsTotal) * parseFloat(process.env.TAX_RATE);
        const resortFee = (subtotal + addOnsTotal) * parseFloat(process.env.RESORT_FEE_RATE);
        const total = subtotal + addOnsTotal + tax + resortFee;

        // Generate reservation ID
        const reservationId = `KONCH-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Set hold expiry
        const holdDuration = parseInt(process.env.HOLD_DURATION_MINUTES) || 15;
        const holdExpiresAt = new Date(Date.now() + holdDuration * 60 * 1000);

        // Create reservation
        const reservation = new Reservation({
            reservationId,
            accommodationId,
            guestDetails,
            dates: {
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                nights
            },
            guests,
            addOns: processedAddOns,
            pricing: {
                subtotal,
                tax,
                resortFee,
                total
            },
            paymentMethod,
            paymentStatus: 'pending',
            specialRequests,
            holdExpiresAt
        });

        await reservation.save();

        // Temporarily reduce availability
        const dates = [];
        const currentDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        while (currentDate < endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        await Promise.all(
            dates.map(date =>
                Availability.findOneAndUpdate(
                    {
                        accommodationId,
                        date: {
                            $gte: new Date(date.setHours(0, 0, 0, 0)),
                            $lt: new Date(date.setHours(23, 59, 59, 999))
                        }
                    },
                    { $inc: { available: -1 } }
                )
            )
        );

        // Schedule hold expiry (in production, use a job queue like Bull)
        setTimeout(async () => {
            const currentReservation = await Reservation.findOne({ reservationId });
            if (currentReservation && currentReservation.paymentStatus === 'pending') {
                // Release hold
                await releaseAvailabilityHold(accommodationId, checkIn, checkOut);
                await Reservation.findOneAndDelete({ reservationId });
                console.log(`Hold expired for reservation ${reservationId}`);
            }
        }, holdDuration * 60 * 1000);

        res.json({
            success: true,
            reservationId,
            total,
            holdExpiresAt,
            message: 'Reservation created successfully. Complete payment within 15 minutes.'
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get booking details
router.get('/:reservationId', async (req, res) => {
    try {
        const reservation = await Reservation.findOne({
            reservationId: req.params.reservationId
        }).populate('accommodationId');

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        // Decrypt email for display
        const decryptedEmail = reservation.getDecryptedEmail();

        res.json({
            success: true,
            reservation: {
                ...reservation.toObject(),
                guestDetails: {
                    ...reservation.guestDetails,
                    email: decryptedEmail
                }
            }
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Helper function to find alternative dates
async function findAlternativeDates(accommodationId, startDate, daysToCheck) {
    const alternatives = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < daysToCheck; i++) {
        currentDate.setDate(currentDate.getDate() + 1);
        const availability = await Availability.findOne({
            accommodationId,
            date: {
                $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
                $lt: new Date(currentDate.setHours(23, 59, 59, 999))
            }
        });

        if (availability && availability.available > 0) {
            alternatives.push(new Date(currentDate));
            if (alternatives.length >= 3) break;
        }
    }

    return alternatives;
}

// Helper function to release availability hold
async function releaseAvailabilityHold(accommodationId, checkIn, checkOut) {
    const dates = [];
    const currentDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    while (currentDate < endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    await Promise.all(
        dates.map(date =>
            Availability.findOneAndUpdate(
                {
                    accommodationId,
                    date: {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lt: new Date(date.setHours(23, 59, 59, 999))
                    }
                },
                { $inc: { available: 1 } }
            )
        )
    );
}

module.exports = router;
