/**
 * Update Availability to 70% Script
 *
 * This script reads the max availability values from .env file and distributes
 * the TOTAL availability across all days such that the sum equals 70% of total capacity.
 *
 * How it works:
 *   - Calculates total capacity = max_per_day × number_of_days
 *   - Calculates target = 70% of total capacity
 *   - Randomly distributes the target across all days (0 to max_per_day per day)
 *
 * Usage:
 *   1. Update the availability values in .env file:
 *      - ROOMS_AVAILABLE
 *      - SUITES_AVAILABLE
 *      - VILLAS_AVAILABLE
 *      - EVENT_HALL_AVAILABLE
 *
 *   2. Run this script:
 *      node server/scripts/updateAvailabilityTo70Percent.js
 *
 *   3. The script will automatically:
 *      - Read the max values from .env
 *      - Calculate 70% of total capacity across all days
 *      - Randomly distribute availability across days
 *      - Ensure sum of all days = 70% of total capacity
 *
 * Example:
 *   If ROOMS_AVAILABLE=8 and there are 43 days until Dec 31st:
 *   - Total capacity = 8 × 43 = 344 room-days
 *   - Target 70% = 241 room-days
 *   - These 241 units are randomly distributed across the 43 days
 *     (each day can have 0-8 rooms, but total across all days = 241)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Accommodation = require('../models/Accommodation');
const Availability = require('../models/Availability');

async function updateAvailabilityTo70Percent() {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    try {
        console.log('🚀 Starting availability update to 70%...');
        console.log('📄 Reading availability values from .env file...\n');

        // Get max availability from environment (.env file)
        const availabilityConfig = {
            room: parseInt(process.env.ROOMS_AVAILABLE) || 4,
            suite: parseInt(process.env.SUITES_AVAILABLE) || 2,
            villa: parseInt(process.env.VILLAS_AVAILABLE) || 1,
            event_hall: parseInt(process.env.EVENT_HALL_AVAILABLE) || 1
        };

        // Calculate 70% of each type (rounded)
        const seventyPercentConfig = {
            room: Math.round(availabilityConfig.room * 0.7),
            suite: Math.round(availabilityConfig.suite * 0.7),
            villa: Math.round(availabilityConfig.villa * 0.7),
            event_hall: Math.round(availabilityConfig.event_hall * 0.7)
        };

        console.log('📊 .env Configuration (Max Availability):');
        console.log(`   - ROOMS_AVAILABLE: ${availabilityConfig.room}`);
        console.log(`   - SUITES_AVAILABLE: ${availabilityConfig.suite}`);
        console.log(`   - VILLAS_AVAILABLE: ${availabilityConfig.villa}`);
        console.log(`   - EVENT_HALL_AVAILABLE: ${availabilityConfig.event_hall}\n`);

        console.log('🎯 Target Availability (70% of Max):');
        console.log(`   - Rooms: ${availabilityConfig.room} × 70% = ${seventyPercentConfig.room}`);
        console.log(`   - Suites: ${availabilityConfig.suite} × 70% = ${seventyPercentConfig.suite}`);
        console.log(`   - Villas: ${availabilityConfig.villa} × 70% = ${seventyPercentConfig.villa}`);
        console.log(`   - Event Hall: ${availabilityConfig.event_hall} × 70% = ${seventyPercentConfig.event_hall}\n`);

        // Get all accommodations
        const accommodations = await Accommodation.find();

        // Calculate date range (today to December 31st of current year)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31st
        endOfYear.setHours(23, 59, 59, 999);

        // Calculate total days in range
        const totalDays = Math.ceil((endOfYear - today) / (1000 * 60 * 60 * 24));

        console.log(`📅 Updating availability from ${today.toLocaleDateString()} to ${endOfYear.toLocaleDateString()}`);
        console.log(`📆 Total days in range: ${totalDays}\n`);

        let updateCount = 0;
        let totalRecords = 0;

        for (const accommodation of accommodations) {
            const maxPerDay = availabilityConfig[accommodation.type];

            // Calculate total capacity across all days
            const totalCapacity = maxPerDay * totalDays;

            // Calculate 70% of total capacity
            const targetTotalAvailable = Math.round(totalCapacity * 0.7);

            console.log(`Processing ${accommodation.name} (${accommodation.type})...`);
            console.log(`  Max per day: ${maxPerDay}`);
            console.log(`  Total capacity (${totalDays} days × ${maxPerDay}): ${totalCapacity} units`);
            console.log(`  Target 70% total: ${targetTotalAvailable} units`);

            // Get all availability records for this accommodation in the date range
            const availabilityRecords = await Availability.find({
                accommodationId: accommodation._id,
                date: {
                    $gte: today,
                    $lte: endOfYear
                }
            }).sort({ date: 1 });

            if (availabilityRecords.length === 0) {
                console.log(`  ⚠️  No availability records found\n`);
                continue;
            }

            // Distribute the target total randomly across all days
            let remainingUnits = targetTotalAvailable;
            const distributions = [];

            for (let i = 0; i < availabilityRecords.length; i++) {
                const daysLeft = availabilityRecords.length - i;

                if (daysLeft === 1) {
                    // Last day gets all remaining units (but capped at max)
                    distributions.push(Math.min(remainingUnits, maxPerDay));
                } else {
                    // Random distribution ensuring we don't exceed max per day
                    // and leave enough for remaining days
                    const maxForThisDay = Math.min(maxPerDay, remainingUnits);
                    const minForThisDay = Math.max(0, remainingUnits - (maxPerDay * (daysLeft - 1)));

                    const randomAvailable = Math.floor(Math.random() * (maxForThisDay - minForThisDay + 1)) + minForThisDay;
                    distributions.push(randomAvailable);
                    remainingUnits -= randomAvailable;
                }
            }

            // Update each record with the distributed values
            for (let i = 0; i < availabilityRecords.length; i++) {
                const record = availabilityRecords[i];
                record.available = distributions[i];
                record.status = distributions[i] > 0 ? 'available' : 'booked';
                await record.save();
                updateCount++;
            }

            totalRecords += availabilityRecords.length;

            // Calculate actual total
            const actualTotal = distributions.reduce((sum, val) => sum + val, 0);
            console.log(`  ✓ Updated ${availabilityRecords.length} records`);
            console.log(`  ✓ Total units distributed: ${actualTotal} (${((actualTotal / totalCapacity) * 100).toFixed(1)}%)\n`);
        }

        console.log(`\n✅ Successfully updated ${updateCount} availability records`);
        console.log(`📊 Total records processed: ${totalRecords}`);
        console.log('\n✨ Availability update completed successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Update error:', error);
        process.exit(1);
    }
}

// Run update
updateAvailabilityTo70Percent();
