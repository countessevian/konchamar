const { postgresPool } = require('../config/database');

// Sync reservation to PostgreSQL
async function syncToPostgres(reservation) {
    const client = await postgresPool.connect();

    try {
        await client.query('BEGIN');

        // Check if reservation already exists
        const checkResult = await client.query(
            'SELECT id FROM reservations WHERE reservation_id = $1',
            [reservation.reservationId]
        );

        if (checkResult.rows.length > 0) {
            // Update existing reservation
            await client.query(`
                UPDATE reservations
                SET
                    guest_details = $1,
                    dates = $2,
                    guests = $3,
                    add_ons = $4,
                    pricing = $5,
                    payment_method = $6,
                    payment_status = $7,
                    payment_ref = $8,
                    special_requests = $9,
                    updated_at = CURRENT_TIMESTAMP
                WHERE reservation_id = $10
            `, [
                JSON.stringify(reservation.guestDetails),
                JSON.stringify(reservation.dates),
                reservation.guests,
                JSON.stringify(reservation.addOns),
                JSON.stringify(reservation.pricing),
                reservation.paymentMethod,
                reservation.paymentStatus,
                reservation.paymentRef,
                reservation.specialRequests,
                reservation.reservationId
            ]);
        } else {
            // Insert new reservation
            await client.query(`
                INSERT INTO reservations (
                    reservation_id,
                    accommodation_id,
                    guest_details,
                    dates,
                    guests,
                    add_ons,
                    pricing,
                    payment_method,
                    payment_status,
                    payment_ref,
                    special_requests,
                    hold_expires_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                reservation.reservationId,
                reservation.accommodationId._id ? reservation.accommodationId._id.toString() : reservation.accommodationId.toString(),
                JSON.stringify(reservation.guestDetails),
                JSON.stringify(reservation.dates),
                reservation.guests,
                JSON.stringify(reservation.addOns),
                JSON.stringify(reservation.pricing),
                reservation.paymentMethod,
                reservation.paymentStatus,
                reservation.paymentRef,
                reservation.specialRequests,
                reservation.holdExpiresAt
            ]);
        }

        await client.query('COMMIT');
        console.log(`Reservation ${reservation.reservationId} synced to PostgreSQL`);
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL sync error:', error);
        return false;
    } finally {
        client.release();
    }
}

// Sync accommodation to PostgreSQL
async function syncAccommodationToPostgres(accommodation) {
    const client = await postgresPool.connect();

    try {
        await client.query('BEGIN');

        const checkResult = await client.query(
            'SELECT id FROM accommodations WHERE id = $1',
            [accommodation._id.toString()]
        );

        if (checkResult.rows.length > 0) {
            await client.query(`
                UPDATE accommodations
                SET
                    type = $1,
                    name = $2,
                    description = $3,
                    capacity = $4,
                    base_price = $5,
                    amenities = $6,
                    images = $7,
                    is_active = $8,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $9
            `, [
                accommodation.type,
                accommodation.name,
                accommodation.description,
                accommodation.capacity,
                accommodation.basePrice,
                JSON.stringify(accommodation.amenities),
                JSON.stringify(accommodation.images),
                accommodation.isActive,
                accommodation._id.toString()
            ]);
        } else {
            await client.query(`
                INSERT INTO accommodations (
                    id, type, name, description, capacity,
                    base_price, amenities, images, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                accommodation._id.toString(),
                accommodation.type,
                accommodation.name,
                accommodation.description,
                accommodation.capacity,
                accommodation.basePrice,
                JSON.stringify(accommodation.amenities),
                JSON.stringify(accommodation.images),
                accommodation.isActive
            ]);
        }

        await client.query('COMMIT');
        console.log(`Accommodation ${accommodation.name} synced to PostgreSQL`);
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL accommodation sync error:', error);
        return false;
    } finally {
        client.release();
    }
}

// Sync availability to PostgreSQL
async function syncAvailabilityToPostgres(availability) {
    const client = await postgresPool.connect();

    try {
        await client.query('BEGIN');

        const checkResult = await client.query(
            'SELECT id FROM availability WHERE accommodation_id = $1 AND date = $2',
            [availability.accommodationId.toString(), availability.date]
        );

        if (checkResult.rows.length > 0) {
            await client.query(`
                UPDATE availability
                SET
                    available = $1,
                    status = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE accommodation_id = $3 AND date = $4
            `, [
                availability.available,
                availability.status,
                availability.accommodationId.toString(),
                availability.date
            ]);
        } else {
            await client.query(`
                INSERT INTO availability (
                    accommodation_id, date, available, status
                ) VALUES ($1, $2, $3, $4)
            `, [
                availability.accommodationId.toString(),
                availability.date,
                availability.available,
                availability.status
            ]);
        }

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL availability sync error:', error);
        return false;
    } finally {
        client.release();
    }
}

module.exports = {
    syncToPostgres,
    syncAccommodationToPostgres,
    syncAvailabilityToPostgres
};
