const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, // Will be encrypted
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }],
    role: {
        type: String,
        enum: ['guest', 'admin'],
        default: 'guest'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Encrypt email before saving
userSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        this.email = crypto.AES.encrypt(
            this.email,
            encryptionKey
        ).toString();
    }
    next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('passwordHash')) {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
};

// Method to get decrypted email
userSchema.methods.getDecryptedEmail = function() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const decrypted = crypto.AES.decrypt(
        this.email,
        encryptionKey
    );
    return decrypted.toString(crypto.enc.Utf8);
};

module.exports = mongoose.model('User', userSchema);
