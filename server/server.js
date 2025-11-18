require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectMongoDB, initializePostgresTables } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to databases
connectMongoDB();
initializePostgresTables();

// Middleware for webhooks (raw body needed for signature verification)
app.use('/api/payment/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
    req.rawBody = req.body;
    next();
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.BASE_URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');

app.use('/api/booking', bookingRoutes);
app.use('/api/payment', paymentRoutes);

// Contact route
app.post('/api/contact', async (req, res) => {
    const { body, validationResult } = require('express-validator');
    const { sendContactEmail } = require('./utils/email');

    const validate = [
        body('name').trim().notEmpty(),
        body('email').isEmail(),
        body('message').trim().notEmpty()
    ];

    // Run validation
    await Promise.all(validate.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { name, email, phone, message } = req.body;
        const sent = await sendContactEmail(name, email, phone, message);

        if (sent) {
            res.json({ success: true, message: 'Message sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send message' });
        }
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Accommodations route
app.get('/api/accommodations', async (req, res) => {
    try {
        const Accommodation = require('./models/Accommodation');
        const accommodations = await Accommodation.find({ isActive: true });

        res.json({
            success: true,
            data: accommodations
        });
    } catch (error) {
        console.error('Get accommodations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred'
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   🏖️  KONCHAMAR RESORT - SERVER RUNNING   ║
    ╠════════════════════════════════════════════╣
    ║   Port: ${PORT.toString().padEnd(35)} ║
    ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)} ║
    ║   URL: ${(process.env.BASE_URL || `http://localhost:${PORT}`).padEnd(35)} ║
    ╚════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
