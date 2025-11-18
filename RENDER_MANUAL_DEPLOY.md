# Konchamar Resort - Manual Render Deployment Guide

## Quick Deploy on Render (Manual Web Service)

### Step 1: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `countessevian/konchamar`
4. Configure the service:

```
Name: konchamar-resort (or any name you prefer)
Region: Oregon (US West) - closest to El Salvador
Branch: master
Root Directory: (leave blank)
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free (for testing) or Starter ($7/month for production)
```

5. Click **"Advanced"** to add environment variables

### Step 2: Add Environment Variables

Click **"Add Environment Variable"** and add each of these. Replace placeholder values with your actual credentials.

#### Critical Variables (REQUIRED)

```
NODE_ENV=production
PORT=3000
BASE_URL=https://konchamar-resort.onrender.com
```

#### Database (REQUIRED - Get from MongoDB Atlas)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/konchamar?retryWrites=true&w=majority
```

#### Security (REQUIRED - Generate these!)

Generate keys by running locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
ENCRYPTION_KEY=<paste-generated-key-here>
JWT_SECRET=<paste-generated-key-here>
JWT_EXPIRE=24h
```

#### Payment Gateways (REQUIRED for bookings)

Get Stripe keys from: https://dashboard.stripe.com/apikeys

```
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_PUBLIC_KEY=pk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

#### Bitcoin Wallet (REQUIRED for Bitcoin payments)

```
BTC_WALLET_ADDRESS=your_bitcoin_wallet_address
ADMIN_API_KEY=<paste-generated-key-here>
```

Note: Bitcoin payments are manual. Customers will see your wallet address and QR code. You'll need to manually confirm payments using the admin endpoint.

#### Email Service (REQUIRED for confirmations)

Get SendGrid API key from: https://app.sendgrid.com/settings/api_keys

```
SENDGRID_API_KEY=SG.your_key_here
FROM_EMAIL=reservations@konchamar.online
ADMIN_EMAIL=admin@konchamar.online
```

#### Pricing & Configuration (Use defaults or customize)

```
ROOM_PRICE=100
SUITE_PRICE=200
VILLA_PRICE=500
EVENT_HALL_PRICE=1000
SPA_PACKAGE=150
SURF_LESSON=50
AIRPORT_TRANSFER=75
CATERING_PER_PERSON=30
ROOMS_AVAILABLE=4
SUITES_AVAILABLE=2
VILLAS_AVAILABLE=1
EVENT_HALL_AVAILABLE=1
HIGH_SEASON_MULTIPLIER=1.2
TAX_RATE=0.13
RESORT_FEE_RATE=0.05
HOLD_DURATION_MINUTES=15
MIN_NIGHTS=1
MAX_NIGHTS=30
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### PostgreSQL (OPTIONAL - for backup database)

If you add Render's PostgreSQL addon, add these:

```
POSTGRES_HOST=<from-render-postgres-addon>
POSTGRES_PORT=5432
POSTGRES_USER=<from-render-postgres-addon>
POSTGRES_PASSWORD=<from-render-postgres-addon>
POSTGRES_DB=konchamar
```

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Your app will be live at: `https://konchamar-resort.onrender.com`

---

## Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] Stripe account with Live API keys
- [ ] SendGrid account with verified sender email
- [ ] Generated ENCRYPTION_KEY and JWT_SECRET
- [ ] Coinbase Commerce account (optional, for Bitcoin payments)

---

## After Deployment

### 1. Update BASE_URL

Once deployed, update the BASE_URL environment variable to match your actual Render URL:

```
BASE_URL=https://your-actual-app-name.onrender.com
```

### 2. Configure Webhooks

**Stripe Webhooks:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-app-name.onrender.com/api/webhooks/stripe`
4. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Bitcoin Payment Confirmation

Bitcoin payments are manual. When a customer pays:

1. They'll see your BTC wallet address and QR code
2. After they send payment, they'll contact you with their transaction ID
3. Verify the payment in your Bitcoin wallet
4. Confirm the payment using this API call:

```bash
curl -X POST https://your-app-name.onrender.com/api/payment/confirm-bitcoin \
  -H "Content-Type: application/json" \
  -d '{
    "reservationId": "RESERVATION_ID",
    "transactionId": "BTC_TRANSACTION_ID",
    "adminKey": "YOUR_ADMIN_API_KEY"
  }'
```

### 3. Whitelist Render IPs in MongoDB Atlas

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Or add specific Render IP ranges

### 4. Test Your Deployment

Visit your app URL and test:
- [ ] Homepage loads correctly
- [ ] Images and videos display
- [ ] Booking modal opens
- [ ] Date picker works
- [ ] Contact form submits (check logs)

---

## Monitoring & Logs

**View Logs:**
- Go to Render Dashboard → Your Service → Logs tab
- Monitor for startup errors or runtime issues

**Common Issues:**
- **"Cannot connect to MongoDB"**: Check connection string and IP whitelist
- **"Missing environment variable"**: Verify all required vars are set
- **"App not responding"**: Check logs for errors, verify PORT=3000

---

## Updating Environment Variables

To update environment variables after deployment:

1. Go to Render Dashboard → Your Service
2. Click "Environment" tab
3. Edit the variable
4. Click "Save Changes"
5. Service will automatically redeploy

---

## Custom Domain (Optional)

To use `konchamar.online` instead of the Render subdomain:

1. In Render Dashboard → Your Service → Settings
2. Scroll to "Custom Domain"
3. Click "Add Custom Domain"
4. Enter: `konchamar.online` or `www.konchamar.online`
5. Add the DNS records shown by Render to your domain registrar
6. Wait for DNS propagation (5-60 minutes)
7. Update BASE_URL environment variable to your custom domain

---

## Cost Summary

**Render Web Service:**
- Free: $0/month (sleeps after 15min inactivity)
- Starter: $7/month (always on, recommended)
- Standard: $25/month (better performance)

**MongoDB Atlas:** Free tier (512MB storage)

**SendGrid:** Free tier (100 emails/day)

**Stripe:** Per transaction (2.9% + $0.30)

**Total minimum for production: ~$7/month**

---

## Generate Security Keys

Run these commands locally before deployment:

```bash
# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste into Render's environment variables.

---

## Support Resources

- **Render Docs:** https://render.com/docs/web-services
- **MongoDB Atlas Setup:** https://docs.atlas.mongodb.com/getting-started/
- **Stripe Integration:** https://stripe.com/docs/payments
- **SendGrid Setup:** https://docs.sendgrid.com/for-developers/sending-email

---

**You're ready to deploy!** Follow the steps above and your site will be live in minutes.
