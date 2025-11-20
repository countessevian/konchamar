# Pricing Consistency Summary

## Overview

All prices across the system are now consistent and sourced from the `.env` file as the single source of truth.

## Price Sources

### 1. **.env File** (Single Source of Truth)
```env
# Accommodation Prices
ROOM_PRICE=80
SUITE_PRICE=200
VILLA_PRICE=650
EVENT_HALL_PRICE=1300

# Add-on Prices
SPA_PACKAGE=150
SURF_LESSON=50
AIRPORT_TRANSFER=75
CATERING_PER_PERSON=30
```

### 2. **Database** (MongoDB)
- Accommodations are initialized with prices from `.env`
- Run `node server/scripts/initializeData.js` to sync database with .env prices

### 3. **Backend API** (`/api/pricing`)
- Returns pricing configuration from `.env`
- Serves as the central pricing endpoint for the frontend

### 4. **Frontend**
- **Static HTML**: Updated to display correct prices from .env
- **JavaScript**: Fetches prices from `/api/pricing` endpoint
- **Fallback**: Uses hardcoded values matching .env if API fails

## Current Pricing

### Accommodations

| Type       | Price    | Period |
|------------|----------|--------|
| Room       | $80      | /night |
| Suite      | $200     | /night |
| Villa      | $650     | /night |
| Event Hall | $1,300   | /day   |

### Add-ons

| Add-on            | Price | Details                    |
|-------------------|-------|----------------------------|
| Spa Package       | $150  | Flat rate                  |
| Surf Lesson       | $50   | Flat rate                  |
| Airport Transfer  | $75   | Flat rate                  |
| Gourmet Catering  | $30   | Per person per day (night) |

## How Pricing Works

### 1. **Page Load**
```javascript
// Frontend loads pricing from API
await loadPricing(); // Fetches /api/pricing
await loadAccommodations(); // Fetches /api/accommodations (includes prices)
```

### 2. **Display on Page**
- Static prices in HTML sections match .env values
- Booking modal dynamically shows prices from API

### 3. **Booking Calculation**
- Uses prices from accommodations API for room rates
- Uses pricing API for add-on calculations
- Catering is calculated as: `$30 × guests × nights`

## Files Updated

### Backend
- ✅ `server/server.js` - Added `/api/pricing` endpoint
- ✅ `server/scripts/initializeData.js` - Uses .env prices

### Frontend
- ✅ `public/index.html` - Updated hardcoded prices to match .env
  - Room: $100 → $80
  - Villa: $500 → $650
  - Event Hall: $1,000 → $1,300
- ✅ `public/js/main.js` - Added pricing API integration
  - `loadPricing()` function
  - `getAddonPrice()` uses API prices
  - Fallback prices updated to match .env

## Maintaining Price Consistency

To change prices:

### 1. Update .env file
```env
ROOM_PRICE=100  # Change from 80 to 100
```

### 2. Restart server
```bash
npm start
```

### 3. (Optional) Update database
```bash
# If you want to update existing accommodations in database
node server/scripts/initializeData.js
```

The frontend will automatically pick up new prices from the `/api/pricing` endpoint without any code changes.

## Verification

To verify all prices are consistent:

1. **Check .env**: `cat .env | grep PRICE`
2. **Check API**: `curl http://localhost:3000/api/pricing`
3. **Check Database**: MongoDB accommodations collection
4. **Check Frontend**: Inspect Network tab for `/api/pricing` response

## API Response Example

```json
{
  "success": true,
  "data": {
    "accommodations": {
      "room": 80,
      "suite": 200,
      "villa": 650,
      "event_hall": 1300
    },
    "addons": {
      "spa": 150,
      "surf": 50,
      "transfer": 75,
      "catering": 30
    },
    "rules": {
      "taxRate": 0.13,
      "resortFeeRate": 0.05
    }
  }
}
```

## Notes

- All prices are in USD
- Tax rate: 13% VAT
- Resort fee: 5%
- Prices are fetched dynamically on page load
- Static HTML displays are updated to match for SEO/initial display
- Catering is the only per-person, per-day pricing
