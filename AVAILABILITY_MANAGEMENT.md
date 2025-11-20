# Availability Management Guide

## Overview

This guide explains how to manage accommodation availability in the Konchamar Resort booking system. The system is designed to always maintain availability at 70% of the maximum capacity defined in the `.env` file.

## Configuration

### Step 1: Set Maximum Availability in .env

Edit the `.env` file in the root directory and set the maximum number of units for each accommodation type:

```env
# Initial Availability
ROOMS_AVAILABLE=8
SUITES_AVAILABLE=2
VILLAS_AVAILABLE=1
EVENT_HALL_AVAILABLE=1
```

### Step 2: Update Database to 70%

After changing any availability values in `.env`, run the update script to set all availability records to 70% of the new maximum:

```bash
node server/scripts/updateAvailabilityTo70Percent.js
```

## How It Works

### Total Capacity Distribution

The script uses a sophisticated distribution algorithm:

1. **Reads maximum availability** from `.env` (max units per day)
2. **Calculates total capacity** = max_per_day × number_of_days
3. **Calculates 70% target** = total capacity × 0.7
4. **Randomly distributes** the 70% target across all days
   - Each day can have 0 to max_per_day units
   - The sum across all days equals exactly 70% of total capacity

### Example

If you set `ROOMS_AVAILABLE=8` and there are 43 days until December 31st:

- **Total capacity** = 8 rooms/day × 43 days = **344 room-days**
- **70% target** = 344 × 0.7 = **241 room-days**
- **Distribution**: These 241 units are randomly distributed across 43 days
  - Day 1: might have 3 rooms available
  - Day 2: might have 7 rooms available
  - Day 3: might have 0 rooms available (fully booked)
  - ... and so on
  - **Total across all 43 days = 241 room-days (exactly 70%)**

### Current Configuration

Based on your current `.env` settings and 43 days remaining:

| Accommodation | Max/Day | Days | Total Capacity | 70% Target | Distribution |
|---------------|---------|------|----------------|------------|--------------|
| Rooms         | 8       | 43   | 344 room-days  | 241 units  | Random 0-8/day |
| Suites        | 2       | 43   | 86 suite-days  | 60 units   | Random 0-2/day |
| Villas        | 1       | 43   | 43 villa-days  | 30 units   | Random 0-1/day |
| Event Hall    | 1       | 43   | 43 hall-days   | 30 units   | Random 0-1/day |

## When to Run the Update Script

Run the `updateAvailabilityTo70Percent.js` script whenever you:

1. **Change availability in .env** - To reflect new capacity
2. **Need to reset availability** - To restore to 70% after manual adjustments
3. **Add new date ranges** - After initializing new availability periods

## Script Output

When you run the script, you'll see:

```
✅ Connected to MongoDB
🚀 Starting availability update to 70%...
📄 Reading availability values from .env file...

📊 .env Configuration (Max Availability):
   - ROOMS_AVAILABLE: 8
   - SUITES_AVAILABLE: 2
   - VILLAS_AVAILABLE: 1
   - EVENT_HALL_AVAILABLE: 1

🎯 Target Availability (70% of Max):
   - Rooms: 8 × 70% = 6
   - Suites: 2 × 70% = 1
   - Villas: 1 × 70% = 1
   - Event Hall: 1 × 70% = 1

📅 Updating availability from 11/19/2025 to 12/31/2025
📆 Total days in range: 43

Processing Garden View Room (room)...
  Max per day: 8
  Total capacity (43 days × 8): 344 units
  Target 70% total: 241 units
  ✓ Updated 43 records
  ✓ Total units distributed: 241 (70.1%)

Processing Oceanfront Suite (suite)...
  Max per day: 2
  Total capacity (43 days × 2): 86 units
  Target 70% total: 60 units
  ✓ Updated 43 records
  ✓ Total units distributed: 60 (69.8%)

...

✅ Successfully updated 172 availability records
```

## Important Notes

### Database Persistence

- Availability values are stored in MongoDB
- Changes made by the script are **permanent** until you run it again
- Bookings will decrement the available count

### Booking Behavior

When guests book:
- The available count decreases by 1 for each date in the booking range
- Example: If 6 rooms are available and someone books 1 room for 3 nights, availability becomes 5 for those 3 days

### Date Range

The script updates availability from **today** through **December 31st** of the current year. To extend beyond that, you'll need to:
1. Run the initialization script to create records for future dates
2. Run the 70% update script again

## Troubleshooting

### Script Fails to Connect

If you see connection errors:
- Verify `MONGODB_URI` in `.env` is correct
- Check your internet connection (if using MongoDB Atlas)
- Ensure MongoDB service is running (if using local MongoDB)

### Unexpected Availability Values

If availability doesn't match expectations:
- Check the `.env` file values
- Verify the script completed successfully (look for "✅ Successfully updated")
- Check for any bookings that may have decremented availability

### Distribution Algorithm

The script uses a random distribution algorithm that ensures:

1. **Exact 70% total**: The sum of all days equals exactly 70% of total capacity
2. **Realistic variation**: Different days have different availability (0 to max)
3. **Constraints respected**: No day exceeds the maximum per-day limit from `.env`

**Example distribution for 8 rooms across 5 days (target 28 total = 70% of 40):**
- Day 1: 7 rooms
- Day 2: 3 rooms
- Day 3: 8 rooms
- Day 4: 5 rooms
- Day 5: 5 rooms
- **Total: 28 rooms (exactly 70%)**

Each time you run the script, you get a different random distribution, but the total always equals 70%.

## Quick Reference Commands

```bash
# Update availability to 70% of .env values
node server/scripts/updateAvailabilityTo70Percent.js

# Initialize fresh data (if needed)
node server/scripts/initializeData.js

# Start the server
npm start
```

## Support

For issues or questions about availability management, refer to:
- Main documentation: `CLAUDE.md`
- Server code: `server/server.js`
- Database models: `server/models/`
