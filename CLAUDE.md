# Konchamar Beach Resort Website - AI Development Guide

## Project Overview
Konchamar is a luxury boutique beachfront resort in La Libertad, El Salvador, near Playa El Majahual. This website must reflect exclusivity, sophistication, and seamless functionality for booking premium accommodations (rooms, suites, villas) and an event hall. The system handles reservations with Bitcoin and credit card payments, storing data in MongoDB (primary) and PostgreSQL (redundant backup).

## Core Principles
- **Luxury First**: Every design decision must convey opulence and exclusivity
- **Security**: PCI-compliant payment handling, encrypted sensitive data, HTTPS only
- **Performance**: Fast load times, optimized for mobile, CDN delivery
- **Reliability**: Dual database architecture (MongoDB + PostgreSQL) for redundancy
- **Flexibility**: Environment variables control pricing, availability, and configuration

---

## Design Specifications

### Visual Identity
**Color Palette**:
- Primary: Deep Ocean Blue (#0B3D5D)
- Secondary: Sandy Gold (#D4AF37)
- Accent: Emerald Green (#2D6A4F)
- Neutrals: Crisp White (#FFFFFF), Charcoal (#2C2C2C)
- Gradients: Blue-to-Gold for hero sections (mimicking Pacific sunsets)

**Typography**:
- Headings: Playfair Display (serif, elegant)
- Body: Montserrat (sans-serif, clean)
- Size hierarchy: H1 (48-64px), H2 (36-42px), Body (16-18px)

**UI Elements**:
- Buttons: Gold (#D4AF37) with subtle glow on hover, rounded corners (8px)
- Cards: White background, soft shadows (0 4px 12px rgba(0,0,0,0.1))
- Modals: Dark overlay (rgba(0,0,0,0.7)), centered white container
- Animations: Fade-in (300ms), parallax scrolling, micro-interactions on hover

### Layout Structure

#### Homepage
1. **Hero Section**:
   - Full-screen video background (waves, palm trees, beach)
   - Overlay: Semi-transparent tagline "Escape to Exclusive Serenity"
   - Centered CTA button: "Book Now" (gold, glowing hover effect)
   - Sticky navigation: Home | Rooms & Suites | Event Hall | Gallery | Contact

2. **Accommodations Section**:
   - Parallax scrolling with high-res images
   - Cards for each type: Room, Suite, Villa (image, brief description, "View Details" link)
   - Hover effects: Image zoom, card lift

3. **Event Hall Section**:
   - Split layout: Left (image carousel), Right (capacity, features, pricing)
   - CTA: "Inquire About Events"

4. **Gallery Section**:
   - Grid layout (3 columns desktop, 1 mobile)
   - Lightbox modal on click
   - Categories: Rooms, Dining, Beach, Activities

5. **Footer**:
   - Black background, gold text
   - Social media icons (Instagram, Facebook, WhatsApp)
   - Contact: email, phone, address
   - Links: Privacy Policy, Terms, FAQ

#### Booking Modal
- Triggered by "Book Now" buttons
- Components:
  - Date picker (calendar with green available, red booked dates)
  - Accommodation dropdown (Room, Suite, Villa, Event Hall)
  - Guest count input (validation against capacity)
  - "Check Availability" button
- Summary panel (right side): Selected dates, accommodation, guests, total price
- Mobile: Stack vertically

#### Confirmation Page
- Success animation (checkmark)
- Reservation details: ID, dates, accommodation, total paid
- Download PDF voucher button
- CTAs: "View My Reservations" (if logged in), "Back to Home"

---

## Technical Architecture

### Frontend Stack
- **HTML5**: Semantic structure (header, main, section, footer), ARIA attributes
- **CSS Framework**: Tailwind CSS for responsive design, custom utilities for luxury styling
- **JavaScript**:
  - Vanilla JS or Alpine.js for interactivity
  - Libraries: FullCalendar (date picker), Swiper.js (image carousels), AOS (scroll animations)
- **Build Tool**: Vite for bundling, minification, hot-reload during development
- **CDN**: Cloudflare for static assets (images, CSS, JS)

### Backend Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js for REST API
- **Databases**:
  - **MongoDB**: Primary (reservations, availability, users, payments)
  - **PostgreSQL**: Redundant backup (mirrored schema)
- **Payment Gateways**:
  - Bitcoin: Coinbase Commerce or BitPay
  - Credit Card: Stripe (PCI-compliant tokenization)
- **Email**: SendGrid for confirmation emails, PDF generation (pdfkit)
- **Authentication**: JWT for user accounts (optional login)
- **Environment**: dotenv for `.env` file management

### Database Schema

#### MongoDB Collections

**1. accommodations**
```
{
  _id: ObjectId,
  type: "room" | "suite" | "villa" | "event_hall",
  name: String (e.g., "Garden View Room"),
  description: String,
  capacity: Number,
  basePrice: Number, // from ENV, can be overridden
  amenities: [String],
  images: [String] // URLs
}
```

**2. availability**
```
{
  _id: ObjectId,
  accommodationId: ObjectId,
  date: Date,
  available: Number, // units available for this date
  status: "available" | "booked" | "blocked"
}
```

**3. reservations**
```
{
  _id: ObjectId,
  reservationId: String (UUID),
  accommodationId: ObjectId,
  guestDetails: {
    name: String,
    email: String (encrypted),
    phone: String,
    address: Object
  },
  dates: {
    checkIn: Date,
    checkOut: Date,
    nights: Number
  },
  guests: Number,
  addOns: [{ name: String, price: Number }],
  pricing: {
    subtotal: Number,
    tax: Number,
    resortFee: Number,
    total: Number
  },
  paymentMethod: "bitcoin" | "credit_card",
  paymentStatus: "pending" | "completed" | "failed",
  paymentRef: String (Stripe token or BTC transaction ID),
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}
```

**4. payment_tokens** (encrypted collection)
```
{
  _id: ObjectId,
  reservationId: String,
  stripeToken: String (encrypted), // only if credit card
  btcAddress: String, // only if Bitcoin
  createdAt: Date
}
```

**5. users** (optional, for account creation)
```
{
  _id: ObjectId,
  email: String (unique, encrypted),
  passwordHash: String,
  reservations: [ObjectId], // references to reservations
  createdAt: Date
}
```

#### PostgreSQL Tables
Mirror MongoDB schema in relational form:
- `accommodations` (id, type, name, description, capacity, base_price, amenities_json, images_json)
- `availability` (id, accommodation_id, date, available, status)
- `reservations` (id, reservation_id, accommodation_id, guest_details_json, dates_json, guests, add_ons_json, pricing_json, payment_method, payment_status, payment_ref, special_requests, created_at, updated_at)
- `users` (id, email, password_hash, created_at)

Sync via background job (cron or event-driven) to ensure eventual consistency.

---

## Environment Variables (.env)

```
# Server
NODE_ENV=production
PORT=3000
BASE_URL=https://www.konchamar.com

# Databases
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/konchamar
POSTGRES_URI=postgresql://user:pass@host:5432/konchamar

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key
JWT_SECRET=your-jwt-secret

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
COINBASE_COMMERCE_API_KEY=...
COINBASE_WEBHOOK_SECRET=...

# Email
SENDGRID_API_KEY=SG...
FROM_EMAIL=reservations@konchamar.com

# Pricing (USD)
ROOM_PRICE=100
SUITE_PRICE=200
VILLA_PRICE=500
EVENT_HALL_PRICE=1000

# Add-Ons (USD)
SPA_PACKAGE=150
SURF_LESSON=50
AIRPORT_TRANSFER=75
CATERING_PER_PERSON=30

# Availability (initial units)
ROOMS_AVAILABLE=4
SUITES_AVAILABLE=2
VILLAS_AVAILABLE=1
EVENT_HALL_AVAILABLE=1

# Pricing Rules
HIGH_SEASON_MULTIPLIER=1.2 # Dec-Feb
TAX_RATE=0.13 # 13% VAT
RESORT_FEE_RATE=0.05 # 5%

# Booking
HOLD_DURATION_MINUTES=15 # temporary reservation hold
MIN_NIGHTS=1
MAX_NIGHTS=30

# CDN
CDN_URL=https://cdn.konchamar.com
```

---

## API Endpoints

### Public Endpoints

**GET /api/accommodations**
- Returns all accommodation types with details, prices, images
- Response: `{ success: true, data: [...] }`

**POST /api/availability/check**
- Body: `{ checkIn: Date, checkOut: Date, accommodationType: String }`
- Response: `{ success: true, available: Boolean, suggestedDates: [...] }`

**POST /api/booking/create**
- Body: `{ accommodationId, checkIn, checkOut, guests, guestDetails, addOns, paymentMethod }`
- Creates temporary hold (15 min), returns `{ reservationId, total, paymentDetails }`

**POST /api/payment/bitcoin**
- Body: `{ reservationId }`
- Returns Bitcoin wallet address and QR code
- Response: `{ address, qrCodeUrl, amount_btc, expiresAt }`

**POST /api/payment/credit-card**
- Body: `{ reservationId, stripeToken }`
- Processes payment via Stripe
- Response: `{ success: true, reservationId, confirmationEmail }`

**GET /api/booking/:reservationId**
- Returns booking details (requires auth or email verification)
- Response: `{ success: true, reservation: {...} }`

**POST /api/contact**
- Body: `{ name, email, message }`
- Sends inquiry to staff, stores in CRM
- Response: `{ success: true }`

### Admin Endpoints (Protected)

**POST /api/admin/login**
- Body: `{ email, password }`
- Returns JWT token

**GET /api/admin/reservations**
- Returns all reservations with filters (date range, status)

**PUT /api/admin/availability**
- Body: `{ accommodationId, date, available }`
- Updates availability manually

**PUT /api/admin/pricing**
- Body: `{ accommodationType, newPrice }`
- Updates pricing (writes to ENV or database override)

---

## Booking Workflow Logic

### 1. Check Availability
```
1. User selects dates, accommodation type, guests
2. Frontend validates:
   - Check-in < Check-out
   - Nights >= MIN_NIGHTS && <= MAX_NIGHTS
   - Guests <= accommodation capacity
3. POST to /api/availability/check
4. Backend queries MongoDB availability collection:
   - For each date in range, check if available > 0
   - If all dates available, return true
   - Else, suggest nearest alternative dates
5. Frontend displays result or alternatives
```

### 2. Create Reservation
```
1. User confirms selection, adds extras, enters details
2. Frontend calculates total:
   - Subtotal = (basePrice * nights) + sum(addOns)
   - Tax = subtotal * TAX_RATE
   - Resort Fee = subtotal * RESORT_FEE_RATE
   - Total = subtotal + tax + resortFee
3. POST to /api/booking/create
4. Backend:
   - Generate reservationId (UUID)
   - Insert into MongoDB reservations (status: pending)
   - Decrement availability for date range (temporary hold)
   - Set expiry timer (15 min)
   - Return reservationId, total, payment instructions
5. Frontend shows payment options
```

### 3. Process Payment

**Bitcoin**:
```
1. POST to /api/payment/bitcoin
2. Backend:
   - Generate wallet address via Coinbase Commerce
   - Convert total USD to BTC (live rate)
   - Store address in payment_tokens collection
   - Return address, QR code, amount_btc
3. Frontend displays QR code, listens for webhook confirmation
4. Coinbase webhook hits /api/webhooks/coinbase:
   - Verify signature
   - Update reservation (status: completed)
   - Finalize availability (remove hold)
   - Sync to PostgreSQL
   - Send confirmation email
```

**Credit Card**:
```
1. User enters card details in Stripe Elements (frontend)
2. Stripe.js tokenizes card, returns token
3. POST to /api/payment/credit-card with token
4. Backend:
   - Create Stripe charge (amount, currency, token)
   - On success:
     - Update reservation (status: completed, paymentRef: charge_id)
     - Store encrypted token in payment_tokens
     - Finalize availability
     - Sync to PostgreSQL
     - Send confirmation email
   - On failure:
     - Release availability hold
     - Return error to frontend
```

### 4. Confirmation
```
1. Backend sends email via SendGrid:
   - Reservation details (dates, accommodation, guests)
   - PDF voucher (barcode, map, check-in instructions)
   - Local tips (Playa El Tunco, surfing, restaurants)
2. Frontend redirects to confirmation page
3. Optional: User creates account to track booking
```

### 5. Hold Expiry
```
1. On reservation creation, schedule job (15 min timer)
2. If payment not received:
   - Delete pending reservation
   - Restore availability (increment for date range)
   - Notify user via email (optional)
```

---

## Security Requirements

### Data Protection
- **Encryption at Rest**:
  - MongoDB: Encrypt guest email, phone using AES-256 (ENCRYPTION_KEY)
  - Stripe tokens: Encrypted before storage
- **Encryption in Transit**: HTTPS only (TLS 1.3), redirect HTTP to HTTPS
- **PCI Compliance**: Never store raw card details; use Stripe tokenization

### Authentication
- **User Accounts**: JWT with 24-hour expiry, refresh tokens in httpOnly cookies
- **Admin Access**: Multi-factor authentication (TOTP via Authy/Google Authenticator)
- **API Rate Limiting**: 100 requests/15 min per IP (prevent abuse)

### Input Validation
- **Frontend**: Validate dates, guest count, email format before submission
- **Backend**: Sanitize all inputs (express-validator), prevent XSS/SQL injection
- **CSRF**: Tokens for POST/PUT/DELETE requests

### Payment Security
- **Stripe**: Use Stripe Elements (PCI SAQ-A compliant), validate webhooks
- **Bitcoin**: Verify Coinbase Commerce webhook signatures, use HTTPS callbacks

### Backups
- **MongoDB**: Daily snapshots to AWS S3 (encrypted, 30-day retention)
- **PostgreSQL**: Continuous archiving (WAL), daily backups
- **Code**: Git repository with protected main branch

---

## Performance Optimization

### Frontend
- **Images**: Lazy loading (Intersection Observer), WebP format, responsive sizes
- **CSS/JS**: Minify, bundle with Vite, use CDN for libraries
- **Caching**: Service worker for offline support, cache static assets (1 year TTL)
- **Critical CSS**: Inline above-the-fold styles, defer non-critical

### Backend
- **Database Queries**: Index on `date`, `accommodationId` in availability collection
- **Caching**: Redis for frequently accessed data (accommodation details, pricing)
  - TTL: 1 hour for pricing, 5 min for availability
- **Load Balancing**: Nginx reverse proxy, horizontal scaling with PM2 cluster mode
- **API Response**: Compress with gzip/brotli

### CDN
- Serve static assets (images, videos) from Cloudflare
- Edge caching for HTML (5 min TTL), bypass for booking API

---

## Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation**: All interactive elements focusable, visible focus indicators
- **Screen Readers**: ARIA labels for icons, live regions for dynamic updates (availability)
- **Color Contrast**: 4.5:1 for text, 3:1 for UI components
- **Responsive**: Mobile-first design, tested on iOS/Android
- **Multilingual**: English (default), Spanish toggle (i18n library)

---

## Testing Strategy

### Unit Tests
- Backend: Jest for API endpoints, database queries
- Frontend: Vitest for utility functions, form validation

### Integration Tests
- Booking workflow end-to-end (Cypress or Playwright)
- Payment processing (Stripe test mode, Coinbase sandbox)

### Security Tests
- OWASP ZAP for vulnerability scanning
- Penetration testing for payment flows

### Performance Tests
- Lighthouse CI (score >90 for Performance, Accessibility)
- Load testing with Artillery (simulate 1000 concurrent users)

---

## Deployment Checklist

### Pre-Launch
- [ ] Verify all ENV variables in production
- [ ] Enable HTTPS (SSL certificate via Let's Encrypt or Cloudflare)
- [ ] Configure MongoDB Atlas firewall (whitelist server IPs)
- [ ] Set up PostgreSQL connection pooling (max 20 connections)
- [ ] Test payment gateways (live mode)
- [ ] Seed initial availability (12-month window)
- [ ] Set up monitoring (Sentry for errors, Google Analytics)
- [ ] Configure email DNS (SPF, DKIM for SendGrid)
- [ ] Create admin account (MFA enabled)

### Launch
- [ ] Deploy to production server (AWS EC2, DigitalOcean, or Vercel)
- [ ] Point domain (www.konchamar.com) to server IP
- [ ] Enable CDN (Cloudflare)
- [ ] Schedule daily backup cron jobs
- [ ] Test live booking (real payment, then refund)
- [ ] Announce on social media, Google My Business

### Post-Launch
- [ ] Monitor error logs (Sentry dashboard)
- [ ] Review analytics weekly (conversion rate, drop-off points)
- [ ] Update availability as bookings increase
- [ ] Collect guest reviews, add to testimonials section

---

## Maintenance Tasks

### Daily
- Sync MongoDB to PostgreSQL (cron job at 3 AM local time)
- Monitor payment confirmations (check for stuck transactions)

### Weekly
- Review booking trends, adjust pricing if needed
- Backup databases manually (in addition to automated)
- Check CDN cache hit rate, purge if stale

### Monthly
- Update availability for next month (if using rolling 12-month window)
- Audit security logs, review access patterns
- Update dependencies (npm audit fix)

### Quarterly
- Review and update content (gallery images, descriptions)
- A/B test booking flow improvements
- Security audit (penetration test)

---

## Edge Cases & Error Handling

### Booking Conflicts
- **Race Condition**: Two users book same accommodation simultaneously
  - Solution: Use MongoDB transactions to lock availability during booking
  - Fallback: First to complete payment gets reservation, second receives "unavailable" message

### Payment Failures
- **Stripe Decline**: Show user-friendly error ("Card declined. Please try another card.")
- **Bitcoin Timeout**: If payment not received in 15 min, release hold, notify user
- **Webhook Failure**: Retry logic (3 attempts), manual reconciliation dashboard for admins

### Database Sync Issues
- If PostgreSQL sync fails, log error but continue (MongoDB is source of truth)
- Admin dashboard shows sync status, button to trigger manual sync

### Overbooking
- Prevent by locking availability during payment window
- If occurs (system error), admin contacts guest to upgrade or refund

### User Errors
- Invalid dates: Frontend blocks past dates, enforces MIN/MAX nights
- Exceeded capacity: Show error before availability check
- Expired session: Auto-save form data (localStorage), restore on reload

---

## AI Assistant Implementation Guidance

### When Building This Project:
1. **Start with Frontend**: Create static HTML/CSS for homepage, booking modal first
2. **Add Interactivity**: Implement date picker, form validation with JavaScript
3. **Build Backend API**: Start with accommodation listing, then availability check
4. **Integrate Databases**: Set up MongoDB, then add PostgreSQL sync
5. **Payment Integration**: Stripe first (easier), then Bitcoin
6. **Testing**: Test booking flow thoroughly before connecting payments
7. **Deployment**: Use environment variables from start, avoid hardcoding

### Code Quality Standards:
- Write modular, reusable components (functions < 50 lines)
- Comment complex logic (especially pricing calculations, availability updates)
- Use async/await for database operations, handle errors gracefully
- Follow REST API conventions (proper status codes, JSON responses)
- Validate all inputs, sanitize before database insertion

### Git Workflow:
- Commit frequently with descriptive messages
- Branches: `feature/booking-modal`, `fix/payment-bug`
- Never commit `.env` file (use `.env.example` template)
- Tag releases (v1.0.0 for launch)

### When Stuck:
- For design: Reference luxury hotel websites (Four Seasons, Rosewood)
- For payments: Follow Stripe/Coinbase Commerce official docs
- For performance: Use Chrome DevTools Lighthouse
- For security: Consult OWASP Top 10 checklist

---

## Success Metrics

### Technical KPIs:
- Page load time < 2 seconds (mobile 4G)
- Booking completion rate > 70%
- Payment success rate > 95%
- Zero security breaches
- 99.9% uptime

### Business KPIs:
- 50+ bookings in first 3 months
- Average booking value > $800
- 30% direct bookings (vs. OTAs like Booking.com)
- 4.8+ star reviews on Google

---

## Additional Features for Future Versions

### Phase 2 (3-6 months post-launch):
- **User Accounts**: Save preferences, loyalty rewards (5% off after 3 stays)
- **Multi-Currency**: Display prices in USD, EUR, BTC
- **Live Chat**: WhatsApp Business API integration
- **Blog**: SEO-optimized content (surf guides, local attractions)

### Phase 3 (6-12 months):
- **Mobile App**: React Native or Flutter for iOS/Android
- **Dynamic Packaging**: Bundle room + surf lesson + spa at discounted rate
- **AI Chatbot**: Answer FAQs, assist with booking (GPT-4 integration)
- **Referral Program**: Guest earns $50 credit for referring friends

---

## Legal & Compliance

### Privacy Policy:
- Disclose data collection (email, payment info)
- GDPR compliance (even if not in EU, shows credibility)
- Right to access/delete data

### Terms of Service:
- Cancellation policy (e.g., full refund 14 days before, 50% within 7 days)
- Liability limits (force majeure, natural disasters)
- Dispute resolution (arbitration in El Salvador)

### Payment Processing:
- Stripe terms (merchant agreement)
- Bitcoin volatility disclaimer (exchange rate locked at payment)

### Local Regulations:
- El Salvador tourism permits (verify with local authorities)
- Tax collection (13% VAT remitted to government)

---

## Contact & Support

### For Guests:
- Email: reservations@konchamar.com
- Phone: +503 XXXX-XXXX
- WhatsApp: +503 XXXX-XXXX (instant replies 8 AM - 10 PM)

### For Development Issues:
- Refer to this CLAUDE.md document
- Check official docs: Stripe, MongoDB, Node.js
- Community: Stack Overflow, Reddit r/webdev

---

**This document is the single source of truth for building the Konchamar website. Follow specifications exactly to ensure luxury, security, and functionality. Adapt only when user requirements change or technical constraints require it. Good luck building an exceptional booking experience!**
