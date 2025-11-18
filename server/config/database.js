const mongoose = require('mongoose');
const { Pool } = require('pg');

// MongoDB Connection
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// PostgreSQL Connection Pool
const postgresPool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Test PostgreSQL connection
postgresPool.on('connect', () => {
    console.log('✅ PostgreSQL connected successfully');
});

postgresPool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
});

// Initialize PostgreSQL tables
const initializePostgresTables = async () => {
    try {
        const client = await postgresPool.connect();
        try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS accommodations (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                capacity INTEGER NOT NULL,
                base_price DECIMAL(10, 2) NOT NULL,
                amenities JSONB,
                images JSONB,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS availability (
                id SERIAL PRIMARY KEY,
                accommodation_id INTEGER REFERENCES accommodations(id),
                date DATE NOT NULL,
                available INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(20) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(accommodation_id, date)
            );

            CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);

            CREATE TABLE IF NOT EXISTS reservations (
                id SERIAL PRIMARY KEY,
                reservation_id VARCHAR(50) UNIQUE NOT NULL,
                accommodation_id INTEGER REFERENCES accommodations(id),
                guest_details JSONB NOT NULL,
                dates JSONB NOT NULL,
                guests INTEGER NOT NULL,
                add_ons JSONB,
                pricing JSONB NOT NULL,
                payment_method VARCHAR(20) NOT NULL,
                payment_status VARCHAR(20) DEFAULT 'pending',
                payment_ref VARCHAR(255),
                special_requests TEXT,
                hold_expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_reservation_id ON reservations(reservation_id);
            CREATE INDEX IF NOT EXISTS idx_payment_status ON reservations(payment_status);

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                role VARCHAR(20) DEFAULT 'guest',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

            console.log('✅ PostgreSQL tables initialized');
        } catch (error) {
            console.error('❌ PostgreSQL table initialization error:', error.message);
        } finally {
            client.release();
        }
    } catch (error) {
        console.log('⚠️  PostgreSQL not available - running in MongoDB-only mode');
    }
};

module.exports = {
    connectMongoDB,
    postgresPool,
    initializePostgresTables
};
