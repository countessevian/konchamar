# Konchamar Resort - Render.com Deployment Guide

## Important Note
This is a **Node.js/Express** application, not a Python application. The start command is `npm start`, not `gunicorn`.

## Prerequisites

1. **MongoDB Atlas Account** (free tier available)
   - Sign up at: https://www.mongodb.com/cloud/atlas
   - Create a cluster and get your connection string

2. **Render Account**
   - Sign up at: https://render.com

3. **Payment Gateway Accounts**
   - Stripe: https://stripe.com
   - Coinbase Commerce: https://commerce.coinbase.com

4. **SendGrid Account** (for emails)
   - Sign up at: https://sendgrid.com

## Production Environment Variables

Copy these into Render's environment variables section. Replace placeholder values with your actual credentials.

```bash
# ===== CRITICAL SETTINGS =====
NODE_ENV=production
PORT=3000
BASE_URL=https://your-app-name.onrender.com

# ===== DATABASE =====
# Get this from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/konchamar?retryWrites=true&w=majority

# PostgreSQL (Optional - for redundant backup)
# If using Render's PostgreSQL addon, these will be auto-populated
POSTGRES_HOST=your-postgres-host.render.com
POSTGRES_PORT=5432
POSTGRES_USER=konchamar_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=konchamar

# ===== SECURITY (GENERATE THESE!) =====
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=<GENERATE-32-CHAR-HEX-STRING>
JWT_SECRET=<GENERATE-RANDOM-STRING>
JWT_EXPIRE=24h

# ===== PAYMENT GATEWAYS =====
# Stripe (Live Keys - get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Coinbase Commerce (get from https://commerce.coinbase.com/dashboard/settings)
COINBASE_COMMERCE_API_KEY=<YOUR_API_KEY>
COINBASE_WEBHOOK_SECRET=<YOUR_WEBHOOK_SECRET>

# ===== EMAIL SERVICE =====
# SendGrid (get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key
FROM_EMAIL=reservations@konchamar.online
ADMIN_EMAIL=admin@konchamar.online

# ===== PRICING (USD) =====
ROOM_PRICE=100
SUITE_PRICE=200
VILLA_PRICE=500
EVENT_HALL_PRICE=1000

# ===== ADD-ONS (USD) =====
SPA_PACKAGE=150
SURF_LESSON=50
AIRPORT_TRANSFER=75
CATERING_PER_PERSON=30

# ===== INITIAL AVAILABILITY =====
ROOMS_AVAILABLE=4
SUITES_AVAILABLE=2
VILLAS_AVAILABLE=1
EVENT_HALL_AVAILABLE=1

# ===== PRICING RULES =====
HIGH_SEASON_MULTIPLIER=1.2
TAX_RATE=0.13
RESORT_FEE_RATE=0.05

# ===== BOOKING CONFIGURATION =====
HOLD_DURATION_MINUTES=15
MIN_NIGHTS=1
MAX_NIGHTS=30

# ===== RATE LIMITING =====
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===== CDN (Optional) =====
CDN_URL=https://cdn.konchamar.com
```

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub**
   ```bash
   git add render.yaml RENDER_DEPLOY.md
   git commit -m "Add Render deployment configuration"
   git push origin master
   ```

2. **Connect to Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `countessevian/konchamar`
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables**
   - Render will prompt you to fill in the environment variables marked with `sync: false`
   - Fill in all required values (see above)

4. **Deploy**
   - Click "Apply" to start the deployment
   - Wait for build to complete (5-10 minutes first time)

### Option 2: Manual Setup

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `countessevian/konchamar`

2. **Configure Service**
   - **Name**: konchamar-resort
   - **Region**: Choose closest to El Salvador (e.g., Oregon)
   - **Branch**: master
   - **Root Directory**: (leave empty)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for production)

3. **Add Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add all variables from the list above

4. **Create Service**
   - Click "Create Web Service"
   - Wait for deployment to complete

## Post-Deployment Setup

### 1. MongoDB Atlas Configuration

1. **Whitelist Render IPs**
   - In MongoDB Atlas, go to Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific Render IP ranges

2. **Create Database User**
   - Go to Database Access
   - Create a user with read/write permissions
   - Use these credentials in MONGODB_URI

### 2. Initialize Database Data

Once deployed, you may need to initialize the accommodation data:

1. **SSH into Render Shell** (if available on your plan)
   - Or create an initialization endpoint

2. **Run initialization**:
   ```bash
   node server/scripts/initializeData.js
   ```

### 3. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app-name.onrender.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. Configure Coinbase Commerce Webhooks

1. Go to Coinbase Commerce Dashboard → Settings → Webhook
2. Add URL: `https://your-app-name.onrender.com/api/webhooks/coinbase`
3. Copy the shared secret to `COINBASE_WEBHOOK_SECRET`

### 5. Custom Domain (Optional)

1. In Render Dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add your domain: `konchamar.online` or `www.konchamar.online`
4. Configure DNS records as instructed by Render
5. Update `BASE_URL` environment variable

### 6. SSL Certificate

Render automatically provisions SSL certificates for all domains. HTTPS is enabled by default.

## Environment Variables Security Checklist

- [ ] Changed all default passwords
- [ ] Generated unique ENCRYPTION_KEY (32 characters)
- [ ] Generated unique JWT_SECRET
- [ ] Using Stripe LIVE keys (not test keys)
- [ ] Using Coinbase Commerce LIVE API keys
- [ ] Valid SendGrid API key with verified sender
- [ ] MongoDB connection string uses strong password
- [ ] BASE_URL matches your actual domain

## Generating Secure Keys

Run these commands locally to generate secure keys:

```bash
# Generate ENCRYPTION_KEY (32-byte hex string)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET (64-byte hex string)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Monitoring & Logs

1. **View Logs**
   - In Render Dashboard → Your Service → Logs
   - Monitor for errors during startup

2. **Health Check**
   - Render automatically monitors your app
   - If it doesn't respond on PORT, it will restart

3. **Metrics**
   - View CPU, Memory, and Request metrics in Dashboard

## Troubleshooting

### App Won't Start
- Check logs for missing environment variables
- Verify MongoDB connection string is correct
- Ensure PORT is set to 3000

### Database Connection Failed
- Verify MongoDB Atlas IP whitelist
- Check username/password in connection string
- Ensure cluster is running

### Payment Processing Not Working
- Verify API keys are LIVE keys (not test)
- Check webhook endpoints are configured
- Review webhook secrets match environment variables

### Email Not Sending
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Review email templates in server/utils/email.js

## Updating Deployment

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin master
```

Render will automatically detect changes and redeploy.

## Cost Estimate (Render)

- **Free Tier**: $0/month
  - 750 hours/month
  - Spins down after 15 min inactivity
  - Good for testing

- **Starter**: $7/month
  - Always on
  - 512 MB RAM
  - Recommended for production

- **Standard**: $25/month
  - 2 GB RAM
  - Better performance for high traffic

## Additional Services Needed

1. **MongoDB Atlas**: Free tier available (512 MB storage)
2. **SendGrid**: Free tier (100 emails/day)
3. **Stripe**: Pay per transaction (2.9% + $0.30)
4. **Coinbase Commerce**: Free (small fee on crypto transactions)

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Stripe Docs: https://stripe.com/docs
- SendGrid Docs: https://docs.sendgrid.com

---

**Ready to Deploy!** Follow the steps above and your Konchamar Resort website will be live on Render.
