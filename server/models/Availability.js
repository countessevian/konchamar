const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    accommodationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accommodation',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    available: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'blocked'],
        default: 'available'
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
availabilitySchema.index({ accommodationId: 1, date: 1 }, { unique: true });
availabilitySchema.index({ date: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
