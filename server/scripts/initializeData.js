require('dotenv').config();
const mongoose = require('mongoose');
const Accommodation = require('../models/Accommodation');
const Availability = require('../models/Availability');
const { syncAccommodationToPostgres, syncAvailabilityToPostgres } = require('../utils/dbSync');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function initializeData() {
    try {
        console.log('🚀 Starting data initialization...');

        // Clear existing data (optional - comment out in production)
        await Accommodation.deleteMany({});
        await Availability.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create accommodations
        const accommodations = [
            {
                type: 'room',
                name: 'Garden View Room',
                description: 'Serene retreat with lush garden views, premium linens, and modern amenities. Perfect for couples seeking tranquility.',
                capacity: 2,
                basePrice: parseFloat(process.env.ROOM_PRICE) || 100,
                amenities: ['King-size bed', 'Private balcony', 'Air conditioning', 'WiFi', 'Mini-fridge', 'Coffee maker'],
                images: ['/images/IMG_1052.JPG', '/images/IMG_1053.JPG'],
                isActive: true
            },
            {
                type: 'suite',
                name: 'Oceanfront Suite',
                description: 'Wake up to panoramic ocean views. Spacious suite with separate living area, luxury bathroom, and direct beach access.',
                capacity: 4,
                basePrice: parseFloat(process.env.SUITE_PRICE) || 200,
                amenities: ['Ocean view balcony', 'Marble bathroom', 'Living area', 'King bed + sofa bed', 'Premium toiletries', 'Beach access'],
                images: ['/images/IMG_1064.JPG', '/images/IMG_1065.JPG'],
                isActive: true
            },
            {
                type: 'villa',
                name: 'Private Pool Villa',
                description: 'Ultimate luxury with your own infinity pool, outdoor shower, and expansive terrace. The pinnacle of exclusive living.',
                capacity: 8,
                basePrice: parseFloat(process.env.VILLA_PRICE) || 500,
                amenities: ['Private infinity pool', 'Master bedroom + guest room', 'Full kitchen', 'Outdoor shower', 'BBQ area', 'Ocean views'],
                images: ['/images/IMG_1068.JPG', '/images/IMG_1070.JPG'],
                isActive: true
            },
            {
                type: 'event_hall',
                name: 'Beachfront Event Hall',
                description: 'Host unforgettable celebrations in our sophisticated event space with stunning ocean views. Perfect for weddings and corporate events.',
                capacity: 50,
                basePrice: parseFloat(process.env.EVENT_HALL_PRICE) || 1000,
                amenities: ['Ocean views', 'Audio/visual equipment', 'Catering options', 'Full-day rental', 'Setup service', 'Outdoor terrace'],
                images: ['/images/IMG_1091.JPG', '/images/IMG_1072.JPG'],
                isActive: true
            }
        ];

        const createdAccommodations = await Accommodation.insertMany(accommodations);
        console.log(`✅ Created ${createdAccommodations.length} accommodations`);

        // Sync accommodations to PostgreSQL (optional - skip if PostgreSQL not available)
        try {
            for (const accommodation of createdAccommodations) {
                await syncAccommodationToPostgres(accommodation);
            }
            console.log('✅ Synced accommodations to PostgreSQL');
        } catch (error) {
            console.log('⚠️  PostgreSQL not available - skipping sync (MongoDB only mode)');
        }

        // Initialize availability for the next 12 months
        const availabilityRecords = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const availabilityConfig = {
            room: parseInt(process.env.ROOMS_AVAILABLE) || 4,
            suite: parseInt(process.env.SUITES_AVAILABLE) || 2,
            villa: parseInt(process.env.VILLAS_AVAILABLE) || 1,
            event_hall: parseInt(process.env.EVENT_HALL_AVAILABLE) || 1
        };

        for (const accommodation of createdAccommodations) {
            for (let i = 0; i < 365; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);

                availabilityRecords.push({
                    accommodationId: accommodation._id,
                    date: date,
                    available: availabilityConfig[accommodation.type],
                    status: 'available'
                });
            }
        }

        const createdAvailability = await Availability.insertMany(availabilityRecords);
        console.log(`✅ Created ${createdAvailability.length} availability records (12 months)`);

        // Sync sample availability to PostgreSQL (optional - skip if PostgreSQL not available)
        try {
            let syncCount = 0;
            for (let i = 0; i < createdAvailability.length; i += 7) {
                await syncAvailabilityToPostgres(createdAvailability[i]);
                syncCount++;
            }
            console.log(`✅ Synced ${syncCount} availability records to PostgreSQL (sample)`);
        } catch (error) {
            console.log('⚠️  PostgreSQL not available - skipping availability sync');
        }

        console.log('\n✨ Data initialization completed successfully!\n');

        // Display summary
        console.log('📊 Summary:');
        console.log(`   - Accommodations: ${createdAccommodations.length}`);
        console.log(`   - Availability records: ${createdAvailability.length}`);
        console.log(`   - Date range: ${today.toLocaleDateString()} to ${new Date(today.getTime() + 364 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`);

        console.log('🏖️  Your Konchamar Resort is ready to accept bookings!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization error:', error);
        process.exit(1);
    }
}

// Run initialization
initializeData();
