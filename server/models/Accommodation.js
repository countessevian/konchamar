const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['room', 'suite', 'villa', 'event_hall']
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Accommodation', accommodationSchema);
