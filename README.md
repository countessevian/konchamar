# Konchamar Beach Resort Website

A luxury beachfront resort booking system with secure payment processing (Stripe & Bitcoin), dual database architecture (MongoDB + PostgreSQL), and automated email confirmations.

## Features

- **Luxury UI/UX**: Responsive design with animations, parallax effects, and mobile optimization
- **Booking System**: Real-time availability checking with 15-minute reservation holds
- **Dual Payments**: Stripe (credit cards) and Coinbase Commerce (Bitcoin)
- **Dual Databases**: MongoDB (primary) with PostgreSQL redundancy
- **Email Notifications**: Automated confirmations with PDF vouchers via SendGrid
- **Security**: PCI-compliant, encrypted sensitive data, rate limiting, HTTPS
- **Accommodations**: Rooms, Suites, Villas, and Event Hall
- **Add-ons**: Spa packages, surf lessons, airport transfers, catering

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Flatpickr (date picker)
- AOS (scroll animations)
- Font Awesome (icons)
- Google Fonts (Playfair Display, Montserrat)

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- PostgreSQL with node-postgres
- Stripe API
- Coinbase Commerce API
- SendGrid API
- PDFKit (voucher generation)

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- MongoDB (local or Atlas account)
- PostgreSQL (local or cloud instance)
- Stripe account (test keys for development)
- Coinbase Commerce account
- SendGrid account

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd konchamar
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Server
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/konchamar
# Or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/konchamar

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=konchamar

# Security
ENCRYPTION_KEY=generate-a-32-character-random-key-here
JWT_SECRET=your-jwt-secret-key-change-this

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Coinbase Commerce (get from https://commerce.coinbase.com/dashboard/settings)
COINBASE_COMMERCE_API_KEY=your_coinbase_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# SendGrid (get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=reservations@konchamar.com
ADMIN_EMAIL=admin@konchamar.com

# Pricing (USD)
ROOM_PRICE=100
SUITE_PRICE=200
VILLA_PRICE=500
EVENT_HALL_PRICE=1000

# Add-ons
SPA_PACKAGE=150
SURF_LESSON=50
AIRPORT_TRANSFER=75
CATERING_PER_PERSON=30

# Availability
ROOMS_AVAILABLE=4
SUITES_AVAILABLE=2
VILLAS_AVAILABLE=1
EVENT_HALL_AVAILABLE=1
```

### 4. Set up databases

**MongoDB:**
- If using local MongoDB, ensure it's running: `mongod`
- If using MongoDB Atlas, create a cluster and get the connection string

**PostgreSQL:**
```bash
# Create database
psql -U postgres
CREATE DATABASE konchamar;
\q
```

The PostgreSQL tables will be auto-created when you start the server.

### 5. Initialize data

Populate the database with accommodations and availability:

```bash
node server/scripts/initializeData.js
```

This will create:
- 4 accommodation types (Room, Suite, Villa, Event Hall)
- 365 days of availability for each accommodation
- Sync initial data to PostgreSQL

## Running the Application

### Development mode (with auto-reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
konchamar/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── style.css      # Luxury styling
│   ├── js/
│   │   └── main.js        # Frontend JavaScript
│   └── images/            # Media assets (logo, photos, video)
│
├── server/                # Backend files
│   ├── config/
│   │   └── database.js    # MongoDB & PostgreSQL setup
│   ├── models/            # Mongoose schemas
│   │   ├── Accommodation.js
│   │   ├── Availability.js
│   │   ├── Reservation.js
│   │   ├── PaymentToken.js
│   │   └── User.js
│   ├── routes/            # API endpoints
│   │   ├── booking.js     # Booking & availability
│   │   └── payment.js     # Stripe & Bitcoin processing
│   ├── utils/             # Helper functions
│   │   ├── email.js       # SendGrid integration
│   │   └── dbSync.js      # PostgreSQL sync
│   ├── scripts/
│   │   └── initializeData.js  # Database initialization
│   └── server.js          # Main server file
│
├── .env.example           # Environment template
├── package.json
├── CLAUDE.md              # AI development guide
└── README.md              # This file
```

## API Endpoints

### Public Endpoints

#### Accommodations
```
GET /api/accommodations
Returns all available accommodation types
```

#### Check Availability
```
POST /api/booking/availability/check
Body: { checkIn, checkOut, accommodationType }
Returns availability status and alternative dates if unavailable
```

#### Create Booking
```
POST /api/booking/create
Body: {
  accommodationId, checkIn, checkOut, guests,
  guestDetails: { name, email, phone, address },
  addOns, paymentMethod, specialRequests
}
Returns reservationId and payment details
```

#### Get Booking
```
GET /api/booking/:reservationId
Returns reservation details
```

#### Process Credit Card Payment
```
POST /api/payment/credit-card
Body: { reservationId, stripeToken }
Processes payment and sends confirmation email
```

#### Generate Bitcoin Payment
```
POST /api/payment/bitcoin
Body: { reservationId }
Returns Bitcoin address, QR code, and payment amount
```

#### Contact Form
```
POST /api/contact
Body: { name, email, phone, message }
Sends inquiry to admin email
```

#### Health Check
```
GET /api/health
Returns server status
```

### Webhooks

```
POST /api/payment/webhooks/stripe
Stripe payment notifications

POST /api/payment/webhooks/coinbase
Coinbase Commerce payment confirmations
```

## Payment Integration

### Stripe Setup

1. Create a Stripe account: https://dashboard.stripe.com/register
2. Get API keys from https://dashboard.stripe.com/apikeys
3. Add keys to `.env` file
4. For webhooks (production):
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.com/api/payment/webhooks/stripe`
   - Select events: `charge.succeeded`, `charge.failed`
   - Copy webhook secret to `.env`

### Coinbase Commerce Setup

1. Create account: https://commerce.coinbase.com/signup
2. Get API key from https://commerce.coinbase.com/dashboard/settings
3. Add to `.env` file
4. For webhooks:
   - Add endpoint: `https://your-domain.com/api/payment/webhooks/coinbase`
   - Copy webhook secret to `.env`

### SendGrid Setup

1. Create account: https://signup.sendgrid.com/
2. Create API key: https://app.sendgrid.com/settings/api_keys
3. Verify sender email: https://app.sendgrid.com/settings/sender_auth
4. Add API key to `.env`

## Testing Payments

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

Use any future expiry date, any 3-digit CVV, and any billing ZIP code.

### Bitcoin Testing

Use Coinbase Commerce sandbox mode for testing without real transactions.

## Booking Flow

1. **User selects dates & accommodation** → Frontend validates input
2. **Check availability** → API queries MongoDB availability collection
3. **If available** → Creates pending reservation with 15-min hold
4. **User enters details & selects payment** → Form validation
5. **Process payment**:
   - **Credit Card**: Stripe tokenizes card → Backend charges → Updates reservation
   - **Bitcoin**: Generates payment address → User pays → Webhook confirms → Updates reservation
6. **On payment success**:
   - Update reservation status to "completed"
   - Finalize availability (remove hold)
   - Sync to PostgreSQL
   - Generate PDF voucher
   - Send confirmation email with voucher
7. **If hold expires** (15 min): Auto-release reservation & availability

## Security Features

- **HTTPS Only**: All traffic encrypted (configure SSL in production)
- **Encrypted Data**: Guest emails and payment tokens encrypted with AES-256
- **PCI Compliance**: Stripe handles card tokenization (no raw card data stored)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator sanitizes all inputs
- **Helmet.js**: Security headers (CSP, XSS protection)
- **CORS**: Configured for production domain
- **JWT Authentication**: For user accounts (optional feature)

## Deployment

### Prerequisites
- SSL certificate (Let's Encrypt or Cloudflare)
- MongoDB Atlas account (or self-hosted)
- PostgreSQL instance (AWS RDS, DigitalOcean, etc.)
- Server (AWS EC2, DigitalOcean Droplet, Vercel, etc.)

### Steps

1. **Set up production databases**
   - MongoDB Atlas: https://www.mongodb.com/cloud/atlas
   - PostgreSQL: AWS RDS, DigitalOcean, or self-hosted

2. **Configure environment variables**
   ```bash
   NODE_ENV=production
   BASE_URL=https://konchamar.com
   # Add production database URIs and API keys
   ```

3. **Enable HTTPS**
   - Use Let's Encrypt for free SSL: `certbot --nginx`
   - Or use Cloudflare for SSL/CDN

4. **Deploy to server**
   ```bash
   # Example for Ubuntu server
   git clone <repo-url>
   cd konchamar
   npm install --production
   node server/scripts/initializeData.js
   pm2 start server/server.js --name konchamar
   pm2 save
   pm2 startup
   ```

5. **Set up reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name konchamar.com www.konchamar.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name konchamar.com www.konchamar.com;

       ssl_certificate /etc/letsencrypt/live/konchamar.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/konchamar.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Configure webhooks**
   - Update Stripe webhook URL to production domain
   - Update Coinbase Commerce webhook URL
   - Test webhook delivery

7. **Set up monitoring**
   - Use PM2 for process management: `pm2 monit`
   - Set up error logging (Sentry, LogRocket)
   - Configure uptime monitoring (UptimeRobot)

## Maintenance

### Daily Backups
```bash
# MongoDB
mongodump --uri="mongodb://localhost:27017/konchamar" --out=/backups/mongodb/$(date +%Y%m%d)

# PostgreSQL
pg_dump -U postgres konchamar > /backups/postgres/konchamar_$(date +%Y%m%d).sql
```

### Database Sync Check
Monitor sync status between MongoDB and PostgreSQL. Check logs for any sync errors.

### Update Availability
The initialization script creates 12 months of availability. To extend:

```javascript
// Modify server/scripts/initializeData.js
// Change 365 to desired number of days
for (let i = 0; i < 365; i++) { ... }
```

## Troubleshooting

### Database Connection Issues

**MongoDB**:
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check connection
mongosh mongodb://localhost:27017/konchamar
```

**PostgreSQL**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d konchamar
```

### Payment Processing Errors

- **Stripe**: Check API keys are correct (test vs live keys)
- **Bitcoin**: Ensure Coinbase Commerce API key is active
- Check webhooks are receiving events (Stripe/Coinbase dashboards)

### Email Not Sending

- Verify SendGrid API key is correct
- Check sender email is verified in SendGrid
- Check spam folder for test emails
- Review SendGrid activity logs

### Hold Expiration Not Working

The current implementation uses `setTimeout` which resets on server restart. For production, use a job queue like Bull with Redis, or cron jobs to check expired holds.

## Contributing

1. Follow the existing code style
2. Test all changes thoroughly
3. Update documentation for new features
4. Ensure security best practices

## License

ISC - See LICENSE file for details

## Support

For issues or questions:
- Email: admin@konchamar.com
- Phone: +503 2345-6789
- WhatsApp: +503 7890-1234

## Acknowledgments

- Built following luxury resort industry standards
- Payment integrations: Stripe & Coinbase Commerce
- Email service: SendGrid
- Database: MongoDB & PostgreSQL
- Hosting suggestions: AWS, DigitalOcean, Vercel

---

**Made with ❤️ for Konchamar Resort - Where Luxury Meets the Pacific**
