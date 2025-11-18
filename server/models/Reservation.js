const mongoose = require('mongoose');
const crypto = require('crypto-js');

const reservationSchema = new mongoose.Schema({
    reservationId: {
        type: String,
        required: true,
        unique: true
    },
    accommodationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accommodation',
        required: true
    },
    guestDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true }, // Will be encrypted
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    dates: {
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        nights: { type: Number, required: true }
    },
    guests: {
        type: Number,
        required: true
    },
    addOns: [{
        name: String,
        price: Number
    }],
    pricing: {
        subtotal: { type: Number, required: true },
        tax: { type: Number, required: true },
        resortFee: { type: Number, required: true },
        total: { type: Number, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bitcoin'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentRef: {
        type: String
    },
    specialRequests: {
        type: String
    },
    holdExpiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Encrypt sensitive data before saving
reservationSchema.pre('save', function(next) {
    if (this.isModified('guestDetails.email')) {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        this.guestDetails.email = crypto.AES.encrypt(
            this.guestDetails.email,
            encryptionKey
        ).toString();
    }
    next();
});

// Decrypt email when retrieving
reservationSchema.methods.getDecryptedEmail = function() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const decrypted = crypto.AES.decrypt(
        this.guestDetails.email,
        encryptionKey
    );
    return decrypted.toString(crypto.enc.Utf8);
};

// Index for efficient queries
reservationSchema.index({ reservationId: 1 });
reservationSchema.index({ 'dates.checkIn': 1, 'dates.checkOut': 1 });
reservationSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
