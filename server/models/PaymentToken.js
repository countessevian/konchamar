const mongoose = require('mongoose');
const crypto = require('crypto-js');

const paymentTokenSchema = new mongoose.Schema({
    reservationId: {
        type: String,
        required: true,
        unique: true
    },
    // Credit card payment details (encrypted)
    stripeToken: {
        type: String // Encrypted
    },
    cardLast4: {
        type: String // Last 4 digits for display (not encrypted)
    },
    cardBrand: {
        type: String // visa, mastercard, etc. (not encrypted)
    },
    cardExpiry: {
        type: String // Encrypted MM/YY
    },

    // Cryptocurrency payment details
    cryptoAddress: {
        type: String // The wallet address payment was sent to
    },
    cryptoNetwork: {
        type: String // btc_mainnet, eth_mainnet, etc.
    },
    cryptoAmount: {
        type: String // Amount in crypto (as string for precision)
    },
    cryptoSymbol: {
        type: String // BTC, ETH, USDT
    },

    // Legacy fields (for backward compatibility)
    btcAddress: {
        type: String
    },
    btcAmount: {
        type: Number
    }
}, {
    timestamps: true
});

// Encrypt sensitive payment data before saving
paymentTokenSchema.pre('save', function(next) {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    // Encrypt Stripe token
    if (this.isModified('stripeToken') && this.stripeToken) {
        this.stripeToken = crypto.AES.encrypt(
            this.stripeToken,
            encryptionKey
        ).toString();
    }

    // Encrypt card expiry
    if (this.isModified('cardExpiry') && this.cardExpiry) {
        this.cardExpiry = crypto.AES.encrypt(
            this.cardExpiry,
            encryptionKey
        ).toString();
    }

    next();
});

module.exports = mongoose.model('PaymentToken', paymentTokenSchema);
