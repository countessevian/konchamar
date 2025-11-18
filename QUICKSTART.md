# Konchamar Resort - Quick Start Guide

Get your luxury resort booking system running in minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` with at minimum these values:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/konchamar
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=konchamar
ENCRYPTION_KEY=any-32-character-string-here-ok
JWT_SECRET=any-secret-string-here
```

### Step 3: Start Databases

**MongoDB** (if using local):
```bash
mongod
```

**PostgreSQL** (if using local):
```bash
# Create database
psql -U postgres
CREATE DATABASE konchamar;
\q
```

### Step 4: Initialize Data
```bash
node server/scripts/initializeData.js
```

### Step 5: Start the Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

## 🎨 You Should See:

- Beautiful hero video with "Escape to Exclusive Serenity"
- Navigation bar with booking button
- Accommodation cards (Rooms, Suites, Villas, Event Hall)
- Gallery with filtering
- Contact form
- Working booking modal

## ⚡ Testing Without Payment Setup

The website works fully without payment integrations! You can:
- Browse accommodations
- Check availability
- Fill booking form
- See booking summary

The system will simulate successful bookings in development mode.

## 💳 Add Payments Later (Optional)

### Stripe (Test Mode)
1. Sign up: https://dashboard.stripe.com/register
2. Get test keys: https://dashboard.stripe.com/apikeys
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   ```

**Test Card**: 4242 4242 4242 4242 (any future date, any CVV)

### SendGrid (Email Confirmations)
1. Sign up: https://signup.sendgrid.com/
2. Create API key: https://app.sendgrid.com/settings/api_keys
3. Verify sender email: https://app.sendgrid.com/settings/sender_auth
4. Add to `.env`:
   ```env
   SENDGRID_API_KEY=SG....
   FROM_EMAIL=reservations@konchamar.com
   ```

### Coinbase Commerce (Bitcoin)
1. Sign up: https://commerce.coinbase.com/signup
2. Get API key: https://commerce.coinbase.com/dashboard/settings
3. Add to `.env`:
   ```env
   COINBASE_COMMERCE_API_KEY=...
   ```

## 📱 Features to Test

### 1. Browse Accommodations
- Scroll through Room, Suite, Villa, Event Hall
- Hover over cards for animations
- Check pricing and amenities

### 2. Make a Test Booking
- Click "Book Now" button
- Select dates (today to tomorrow)
- Choose accommodation (e.g., "Garden View Room")
- Select guests (1-2 for room)
- Click "Check Availability"
- Add optional extras (Spa, Surf Lesson, etc.)
- See price calculation with tax and fees
- Fill guest details
- Choose payment method
- Submit booking

### 3. Explore Gallery
- Filter by: All, Rooms, Dining, Beach, Activities
- Click images for lightbox view
- Use arrow keys to navigate

### 4. Contact Form
- Fill name, email, message
- Submit to test (emails require SendGrid)

### 5. Mobile Testing
- Resize browser window
- Test hamburger menu
- Check responsive layout

## 🛠️ Customization

### Change Pricing
Edit `.env`:
```env
ROOM_PRICE=150      # Change from 100 to 150
SUITE_PRICE=300     # Change from 200 to 300
SPA_PACKAGE=200     # Change from 150 to 200
```

Restart server: `npm run dev`

### Change Availability
Edit `.env`:
```env
ROOMS_AVAILABLE=10   # Change from 4 to 10
SUITES_AVAILABLE=5   # Change from 2 to 5
```

Re-run: `node server/scripts/initializeData.js`

### Update Content
Edit `public/index.html`:
- Line 137: Change tagline "Escape to Exclusive Serenity"
- Line 164: Update resort description
- Line 245+: Modify accommodation descriptions
- Line 620+: Update contact information

### Update Styling
Edit `public/css/style.css`:
- Line 11-18: Color palette
- Customize fonts, animations, layouts

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Port 3000 Already in Use
Change port in `.env`:
```env
PORT=3001
```

### Images Not Loading
Ensure all images were copied:
```bash
ls public/images/
# Should see konchamar-logo.jpeg, konchamar-cover.jpeg, and many IMG_*.JPG files
```

## 📊 Project Stats

- **Frontend**: 1 HTML file, 1 CSS file (900+ lines), 1 JS file (500+ lines)
- **Backend**: 5 models, 2 route files, 2 utility files
- **Total Lines of Code**: ~3,500
- **Dependencies**: 20 npm packages
- **Database Tables**: 5 (MongoDB) + 4 (PostgreSQL)

## 🎯 Next Steps

1. **Add Real Payment Keys** - Get Stripe/Coinbase accounts
2. **Set Up Email** - Configure SendGrid for confirmations
3. **Deploy to Production** - Use AWS, DigitalOcean, or Vercel
4. **Custom Domain** - Point konchamar.com to your server
5. **SSL Certificate** - Enable HTTPS with Let's Encrypt
6. **Monitor & Maintain** - Set up error logging and backups

## 📚 Resources

- **Full Documentation**: See README.md
- **AI Development Guide**: See CLAUDE.md
- **API Endpoints**: README.md#api-endpoints
- **Deployment Guide**: README.md#deployment

## 💡 Tips

- Use `npm run dev` for development (auto-reload with nodemon)
- Use `npm start` for production (stable, no auto-reload)
- Check server logs for errors and booking activity
- Test booking flow end-to-end before going live
- Use Stripe test mode until ready for real payments

## 🎉 You're Ready!

Your Konchamar Resort website is now running. Start accepting bookings and managing your luxury beachfront resort with ease!

**Questions?** Check README.md or contact support.

---

**Enjoy building an amazing booking experience! 🏖️**
