require('dotenv').config();
const mongoose = require('mongoose');
const Accommodation = require('../models/Accommodation');
const Availability = require('../models/Availability');
const { syncAccommodationToPostgres, syncAvailabilityToPostgres } = require('../utils/dbSync');

async function initializeData() {
    // Connect to MongoDB with proper wait
    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    try {
        console.log('🚀 Starting data initialization...');

        // Check if data already exists
        const existingAccommodations = await Accommodation.countDocuments();
        if (existingAccommodations > 0) {
            console.log('⚠️  Data already exists. Updating availability with random values...');

            // Update existing availability with random values
            const accommodations = await Accommodation.find();
            const availabilityConfig = {
                room: parseInt(process.env.ROOMS_AVAILABLE) || 4,
                suite: parseInt(process.env.SUITES_AVAILABLE) || 2,
                villa: parseInt(process.env.VILLAS_AVAILABLE) || 1,
                event_hall: parseInt(process.env.EVENT_HALL_AVAILABLE) || 1
            };

            let updateCount = 0;
            for (const accommodation of accommodations) {
                const maxAvailable = availabilityConfig[accommodation.type];

                // Get all future availability records for this accommodation
                const availabilityRecords = await Availability.find({
                    accommodationId: accommodation._id,
                    date: { $gte: new Date() }
                });

                // Update each record with a random value
                for (const record of availabilityRecords) {
                    const randomAvailable = Math.floor(Math.random() * (maxAvailable + 1));
                    record.available = randomAvailable;
                    record.status = randomAvailable > 0 ? 'available' : 'booked';
                    await record.save();
                    updateCount++;
                }
            }

            console.log(`✅ Updated ${updateCount} availability records with random values`);
            console.log('\n✨ Availability update completed successfully!\n');
            process.exit(0);
        }

        // Original initialization code continues if no data exists
        console.log('No existing data found. Creating fresh data...');

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

                // Random availability from 0 to max (from .env)
                const maxAvailable = availabilityConfig[accommodation.type];
                const randomAvailable = Math.floor(Math.random() * (maxAvailable + 1)); // 0 to max inclusive

                availabilityRecords.push({
                    accommodationId: accommodation._id,
                    date: date,
                    available: randomAvailable,
                    status: randomAvailable > 0 ? 'available' : 'booked'
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
