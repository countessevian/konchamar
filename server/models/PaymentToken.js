const mongoose = require('mongoose');
const crypto = require('crypto-js');

const paymentTokenSchema = new mongoose.Schema({
    reservationId: {
        type: String,
        required: true,
        unique: true
    },
    stripeToken: {
        type: String // Encrypted
    },
    btcAddress: {
        type: String
    },
    btcAmount: {
        type: Number
    }
}, {
    timestamps: true
});

// Encrypt Stripe token before saving
paymentTokenSchema.pre('save', function(next) {
    if (this.isModified('stripeToken') && this.stripeToken) {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        this.stripeToken = crypto.AES.encrypt(
            this.stripeToken,
            encryptionKey
        ).toString();
    }
    next();
});

module.exports = mongoose.model('PaymentToken', paymentTokenSchema);
