const conn = require('./../utils/dbconn');

// Check if the trader owns the service (and that it exists)
exports.checkServiceOwnership = async (req, res, next) => {
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being updated
    const trader_id = req.trader?.trader_id; // Getting the trader_id from the token (isAuth)

    try {
        const [rows] = await conn.query('SELECT trader_id FROM services WHERE service_id = ?', [service_id]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'failure', message: 'Service not found' });
        }

        if (rows[0].trader_id !== trader_id) {
            return res.status(403).json({ status: 'failure', message: 'Forbidden: You do not own this service' });
        }

        next(); // Permission granted so we can proceed
    } catch (err) {
        console.error("Internal Error:", err);
        res.status(500).json({ status: 'failure', message: "An internal server error occurred. Please try again later." });
    }
};

// Check if the trader owns the booking (and that it exists)
exports.checkBookingOwnership = async (req, res, next) => {
    const { booking_id } = req.params; // Uses the service ID in the route, to target the specific service that's being updated
    const trader_id = req.trader?.trader_id; // Getting the trader_id from the token (isAuth)

    const checkSQL = `
        SELECT services.trader_id 
        FROM bookings 
        INNER JOIN services ON bookings.service_id = services.service_id
        WHERE bookings.booking_id = ?`;

    try {
        const [rows] = await conn.query(checkSQL, [booking_id]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'failure', message: 'Booking not found' });
        }

        if (rows[0].trader_id !== trader_id) {
            return res.status(403).json({ status: 'failure', message: 'Forbidden: You do not own this booking' });
        }

        next(); // Permission granted so we can proceed
    } catch (err) {
        console.error("Internal Error:", err);
        res.status(500).json({ status: 'failure', message: "An internal server error occurred. Please try again later." });
    }
};