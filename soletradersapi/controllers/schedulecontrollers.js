const conn = require('./../utils/dbconn');
const jwt = require('jsonwebtoken'); // JWT TOKEN
const crypto = require('./../js/crypto');




// CONTROLLERS


// DIRECTORY (GET)
// WHERE 1=1 is used in dynamic queries where filters change on user input - this way we avoid specific if/else checks that make the code messy (e.g. is there trade_type? use WHERE trade_type = ? - is there region too? use AND, or only WHERE for region if there's only region) - With WHERE 1=1 WHERE is always there and we can blidly use AND to add filters based on user input
exports.getDirectory = async (req, res) => {
   const { trade_type, region } = req.query;

    let selectSQL = `SELECT traders.trader_id, traders.trader_name, traders.trade_type, traders.region, AVG(ratings.rating) AS average_rating 
                     FROM traders 
                     LEFT JOIN ratings ON traders.trader_id  = ratings.trader_id
                     WHERE 1=1`;
    
    const queryParams = [];

    // Check if trade_type exists AND is not an empty string
    if (trade_type && trade_type.trim() !== "") {
        selectSQL += ` AND trade_type = ?`;
        queryParams.push(trade_type);
    }

    // Check if region exists and that is not an empty string
    if (region && region.trim() !== "") {
        selectSQL += ` AND region = ?`;
        queryParams.push(region);
    }

    // Group results by trader, to show each trader once, and not once for each rating
    selectSQL += ` GROUP BY traders.trader_id`;

    try {
        const [rows] = await conn.query(selectSQL, queryParams);
        
        res.status(200).json({
            status: 'success',
            traders: rows
        });
    } catch (err) {
        // Log the full error to terminal for debugging - don't send error message externally for increased security
        console.error("Internal Error:", err);
        res.status(500).json({ status: 'failure', message: "An internal server error occurred. Please try again later." });
    }
    
};

// FILTER CONTROLLER
exports.getFilterOptions = async (req, res) => {
    try {
        // Fetch unique trades and regions that actually exist in DB
        // SELECT DISTINCT asks to only fetch only one of each unique value (e.g. if 3 plumbers in DB, plumber is only returned once)
        const [trades] = await conn.query("SELECT DISTINCT trade_type FROM traders WHERE trade_type IS NOT NULL");
        const [regions] = await conn.query("SELECT DISTINCT region FROM traders WHERE region IS NOT NULL");

        res.status(200).json({
            // .map unwraps the objects returned (e.g. "trades": [{trader_type: 'Plumber'}, {trader_type: 'Electrician'}] => "trades": ["Plumber", "Electrician"])
            trades: trades.map(t => t.trade_type),
            regions: regions.map(r => r.region)
        });
    } catch (err) {
        console.error("Internal Error:", err);
        res.status(500).json({ status: 'failure', message: "An internal server error occurred. Please try again later." });
    }
};


// SIGN UP (POST)
exports.postSignUp = async (req, res) => {
    const { trader_name, username, trader_email, password } = req.body; // Plaintext pass

    try {
        // Hash the plaintext password
        const hashedPassword = await crypto.hashPassword(password);

        // Insert new trader data into DB with a hashed password
        const insertSQL = `INSERT INTO traders (trader_name, username, trader_email, password_hash) 
                           VALUES (?, ?, ?, ?)`;

        const vals = [trader_name, username, trader_email, hashedPassword];

        const [insertResult] = await conn.query(insertSQL, vals); // fielddata not useful for non-select SQL queries

        // Getting trader ID from insert result
        const newTraderId = insertResult.insertId;

        // Creating JWT
        const accessToken = jwt.sign({
            trader_id: newTraderId,
            trader_name: trader_name
        },
            process.env.JWT_SECRET, // Secret key securely defined and stored in config.env file
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            status: 'success',
            message: `Trader (ID ${insertResult.insertId}) registered successfully`,
            //trader_id: newTraderId,
            token: accessToken,
            trader: {
                trader_id: newTraderId,
                trader_name: trader_name
            }
        });
    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        })
    }
};


// LOGIN (POST)
exports.postLogin = async (req, res) => {
    
    const { trader_email, password } = req.body; // Values sent from form (pass in plaintext)


    // SQL query to get id and name from traders table when email and pass match
    const checkSQL = `SELECT trader_id, trader_name, password_hash 
                        FROM traders 
                        WHERE traders.trader_email = ?`; 
    try {
        // Execute SQL query to check email
        const [rows, fielddata1] = await conn.query(checkSQL, [trader_email]);
        const numRows = rows.length;
        
        if (numRows === 0) {
            return res.status(401).json({
                status: 'failure',
                message: 'Invalid email or password'
            });
        }


        const trader = rows[0];
        // Compare plaintext password with bcrypt hash - pass check
        const isMatch = await crypto.comparePassword(password, trader.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                status: 'failure',
                message: 'Invalid email or password'
            });
        }

        // Creating JWT
        const accessToken = jwt.sign({
            trader_id: trader.trader_id,
            trader_name: trader.trader_name
        },
            process.env.JWT_SECRET, // Secret key securely defined and stored in .env file
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token: accessToken,
            trader: {
                trader_id: trader.trader_id,
                trader_name: trader.trader_name
            }
        });
    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};





// PROFILE (GET) - USING MULTIPLE SQL STATEMENTS IN A SINGLE QUERY USING MYSEQL12/PROMISE WRAPPER AND ASYNC/AWAIT
exports.getProfile = async (req, res) => {

    const trader_id = req.trader?.trader_id; // Identity guaranteed by isAuth middleware

    // Grabbing booking status from URL - defaults to show all if not specified
    const statusFilter = req.query.status || 'all';
    // Force filter to 'all' if the user provides something weird manually
    const allowedStatuses = ['all', 'pending', 'accepted', 'rejected'];
    if (!allowedStatuses.includes(statusFilter)) {
    statusFilter = 'all'; 
    }
   

    // Using the trader id stored in the token to link the profile to the DB and get the rest of the info that's not in the token
    const traderSQL = `SELECT trade_type, region, availability, bio 
                       FROM traders 
                       WHERE trader_id = ?`;
    // Fetching the services data for a specific trader from the DB, using the trader id
    const servicesSQL = `SELECT services.service_id, services.title, services.description, services.pricing_type, services.base_price 
                        FROM services
                        WHERE trader_id = ?`;

    // Fetch availability slots (ordered by day of the week)
    const availabilitySQL = `SELECT day_of_week, start_time, end_time 
                             FROM availability_slots 
                             WHERE trader_id = ? 
                             ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`; // Order by day

    // Fetching the bookings data for a specific trader from the DB, using the services table and the trader_id in that table to link to the specific trader 
    // We need to render the service title fetched through the JOIN, so aliasing it helps avoid confusion in the EJS 
    // SQL Query required to filter bookings - declared as let instead of const because it will be a dynamic query that depends on the status that's passed by URL
    let bookingsSQL = `SELECT bookings.booking_id, bookings.client_name, bookings.client_email, 
                            bookings.requested_date, bookings.requested_start_time, 
                            bookings.job_description, bookings.status, bookings.created_at, 
                            services.title AS service_title
                        FROM bookings
                        INNER JOIN services ON bookings.service_id = services.service_id
                        WHERE services.trader_id = ?`;


    // LOGIC TO ENABLE THE BOOKING FILTER - bookingsSQL query updated to add booking status if the URL specified a specific status                       
    const bookingsParams = [trader_id];
    // Add filter if status not8 specified
    if (statusFilter !== 'all') {
        bookingsSQL += ` AND bookings.status = ?`;
        bookingsParams.push(statusFilter);
    }
    // Ordering bookings by status when all are being displayed
    bookingsSQL += ` ORDER BY 
                      CASE 
                         WHEN bookings.status = 'pending' THEN 1
                         WHEN bookings.status = 'accepted' THEN 2 
                         WHEN bookings.status = 'rejected' THEN 3
                      END,
                      bookings.created_at DESC;`;


    // Required to fetch ratings and calculate average rating for the rating bar
    const ratingSQL = `SELECT AVG(rating) as average_rating 
                       FROM ratings 
                       WHERE trader_id = ?`;


    try {
        // Execute trader SQL
        const [traderRows, fielddata1] = await conn.query(traderSQL, [trader_id]);

        // Existence check
        const numRows = traderRows.length;
        if (numRows === 0) { // Checking if there any matches for that trader
            return res.status(404).json({
                status: 'failure',
                message: `Trader (ID ${trader_id}) not found`
            });
        }

        // Execute SQLs
        const [servicesRows, fielddata2] = await conn.query(servicesSQL, [trader_id]);
        const [bookingsRows, fielddata3] = await conn.query(bookingsSQL, bookingsParams); // bookingParams: trader ID + status (if passed)
        const [availabilityRows, fielddata4] = await conn.query(availabilitySQL, [trader_id]);
        const [ratingRows, fielddata5] = await conn.query(ratingSQL, [trader_id]);

        return res.status(200).json({
            status: 'success',
            message: `Trader (${trader_id}) data fetched successfully`,
            trader: {
                ...traderRows[0], // Spread operator used to create a new object that combines trader and its average_rating. Query contains only one row, the trader, so we need indexing the get the single object
                average_rating: ratingRows[0].average_rating || 0 // If avg. rating is null, pass 0
            },
            services: servicesRows, // Query could contain multiple services, no indexing required
            bookings: bookingsRows, // Query could contain multiple bookings, no indexing required
            schedule: availabilityRows
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};

// EDIT PROFILE (GET)
exports.getEditProfile = async (req, res) => {
    const trader_id = req.trader?.trader_id; // Identity guaranteed by isAuth middleware


    // Using the trader id stored in JWT token to link the profile to the DB and get the rest of the info that's not in the session
    const traderSQL = `SELECT trade_type, region, availability, bio 
                       FROM traders 
                       WHERE trader_id = ?`;
    // Fetch already existing availability slots so that data appears when page loads
    const availabilitySQL = `SELECT day_of_week, start_time, end_time 
                             FROM availability_slots 
                             WHERE trader_id = ?`;

    try {
        const [traderRows] = await conn.query(traderSQL, [trader_id]);
        const [availabilityRows] = await conn.query(availabilitySQL, [trader_id]);

        const numRows = traderRows.length;
        if (numRows === 0) {
            return res.status(404).json({
                status: 'failure',
                message: `Trader (ID ${trader_id}) not found`
            });
        }

        return res.status(200).json({
            status: 'success',
            trader: traderRows[0],
            schedule: availabilityRows
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};

// EDIT PROFILE (PUT)
exports.putEditProfile = async (req, res) => {
    const trader_id = req.trader?.trader_id; // Identity guaranteed by isAuth API middleware

    // Values entered by user in form (already validated)
    const { trade_type, region, availability, bio, working_days } = req.body; 
    const vals = [trade_type, region, availability, bio, trader_id];

    // SQL query to update the main trader profile (excluding availability slots for recurring availability)
    const updateSQL = `UPDATE traders
                       SET trade_type = ?, region = ?, availability = ?, bio = ?
                       WHERE trader_id = ?`;

    try {
        const [updateResult] = await conn.query(updateSQL, vals);

        // The "Clean Slate" method: instead of checking which days changed, which stayed the same, etc.. we delete all and insert
        await conn.query(`DELETE FROM availability_slots WHERE trader_id = ?`, [trader_id]);

        // Insert the new slots if any days were checked
        if (working_days) {
            // If only one day is checked, Express sends a string. If multiple, an array
            const daysToProcess = Array.isArray(working_days) ? working_days : [working_days];
            
            // for…of loop to iterate through all days
            for (const day of daysToProcess) {
                // We use the day name to grab the specific start/end times from the body
                const start = req.body[`start_time_${day}`];
                const end = req.body[`end_time_${day}`];

                await conn.query(
                    `INSERT INTO availability_slots (trader_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)`,
                    [trader_id, day, start, end]
                );
            }
        }

        return res.status(200).json({
            status: 'success',
            message: `Profile (ID ${trader_id}) updated successfully`,
            affectedRows: updateResult.affectedRows
        });
    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};



// EDIT SERVICE (GET)
exports.getEditService = async (req, res) => {
    
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being updated



    //SQL query to...
    const selectSQL = `SELECT * 
                       FROM services 
                       WHERE service_id = ?`; //Using placeholder to avoid SQL injection

    try {
        // Execture SQL query
        const [rows] = await conn.query(selectSQL, [service_id]);

        const service = rows[0];
        
        return res.status(200).json({
            status: 'success',
            service
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};


// EDIT SERVICE (PUT)
exports.putEditService = async (req, res) => {
    
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being updated

    const { title, description, pricing_type, base_price } = req.body;
    const vals = [title, description, pricing_type, base_price, service_id];


    // SQL query to update services table in the DB
    const updateSQL = `UPDATE services
                       SET title = ?, description = ?, pricing_type = ?, base_price = ?
                       WHERE service_id = ?`;

    try {
        //Execute SQL query to update DB
        const [updateResult] = await conn.query(updateSQL, vals);


        return res.status(200).json({
            status: 'success',
            message: `Service (ID ${service_id}) updated successfully`,
            affectedRows: updateResult.affectedRows
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};



// ADD SERVICE (POST)
exports.postAddService = async (req, res) => {
    const trader_id = req.trader?.trader_id; // Getting the trader_id from the token

    const { title, description, pricing_type, base_price } = req.body; // Trader_id comes from the session, not the form
    const vals = [trader_id, title, description, pricing_type, base_price]; // Trader_id fetched from session to add data to DB


    // Update DB
    const insertSQL = `INSERT INTO services (trader_id, title, description, pricing_type, base_price)
                       VALUES (?, ?, ?, ?, ?)`;

    try {
        const [insertResult] = await conn.query(insertSQL, vals);

        return res.status(201).json({
            status: 'success',
            message: `Service (ID ${insertResult.insertId}) created successfully`,
            service_id: insertResult.insertId
        });


    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};




// DELETE SERVICE (DELETE)
exports.deleteService = async (req, res) => {
    const { service_id } = req.params;

    // Update DB
    const deleteSQL = `DELETE FROM services 
                       WHERE service_id = ?`;


    try {
        // Execute deleteSQL
        const [deleteResult] = await conn.query(deleteSQL, [service_id]);


        return res.status(200).json({
            status: 'success',
            message: `Service (ID ${service_id}) deleted successfully`,
            affectedRows: deleteResult.affectedRows
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};


// TRADER INFO (GET)
exports.getTraderInfo = async (req, res) => {
    const { trader_id } = req.params; // Uses the trader ID in the route, to target the specific trader that's being selected


    // SQL query to fetch trader profile info - LEFT JOIN is required to save results that have no ratings, an INNER JOIN would ignore traders without ratings as it would only return results when there's a match in both tables (i.e. traders with no ratings wouldn't show)
    // Group results by trader, to show each trader once, and not once for each rating
    const traderSQL = `SELECT traders.trader_id, trader_name, trade_type, region, availability, bio, AVG(ratings.rating) AS average_rating
                       FROM traders
                       LEFT JOIN ratings ON traders.trader_id = ratings.trader_id
                       WHERE traders.trader_id = ?
                       GROUP BY traders.trader_id`;

    //SQL query to fech services offered by this trader
    const servicesSQL = `SELECT services.service_id, services.title, services.description, services.pricing_type, services.base_price 
                         FROM services
                         INNER JOIN traders ON services.trader_id = traders.trader_id
                         WHERE traders.trader_id = ?`;
    
    // SQL query to fetch weekly recurring schedule
    const scheduleSQL = `SELECT day_of_week, start_time, end_time 
                         FROM availability_slots 
                         WHERE trader_id = ?
                         ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`;                    

    try {
        //Execute traderSQL to check for trader
        const [traderRows, fielddata1] = await conn.query(traderSQL, [trader_id]);

        // Checking if trader exists
        const numRows = traderRows.length;
        if (numRows === 0) {
            return res.status(404).json({
                status: 'failure',
                message: `Trader (ID ${trader_id}) not found`
            });
        }

        const trader = traderRows[0];

        // Execute servicesSQL
        const [servicesRows, fielddata2] = await conn.query(servicesSQL, [trader_id]);

        // Execute scheduleSQL
        const [scheduleRows, fielddata3] = await conn.query(scheduleSQL, [trader_id]);

        return res.status(200).json({
            status: 'success',
            trader,
            services: servicesRows,
            schedule: scheduleRows,
        });
    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};




// BOOK SERVICE (GET)
exports.getBookingForm = async (req, res) => {
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being booked

    // SQL query to fetch the service data
    const serviceSQL = `SELECT service_id, title, description, pricing_type, base_price, trader_id
                        FROM services
                        WHERE service_id = ?`;

    // SQL query to fetch the data of the trader who owns the service
    const traderSQL = `SELECT trader_id, trader_name, trade_type, region
                       FROM traders
                       WHERE trader_id = ?`;

    try {
        // Execute the service SQL
        const [serviceRows] = await conn.query(serviceSQL, [service_id]);

        const numServiceRows = serviceRows.length;
        if (numServiceRows === 0) {
            return res.status(404).json({
                status: 'failure',
                message: `Service (ID ${service_id}) not found`
            });

        }

        const service = serviceRows[0];

        // Execute the trader SQL
        const [traderRows] = await conn.query(traderSQL, [service.trader_id]);

        const numTraderRows = traderRows.length;
        if (traderRows.length === 0) {
            return res.status(404).json({
                status: 'failure',
                message: `Trader (ID ${service_id}) not found`
            });
        }

        const trader = traderRows[0];

        return res.status(200).json({
            status: 'success',
            service,
            trader
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};
// BOOK SERVICE (POST)
exports.postBookingForm = async (req, res) => {
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being booked
    const { client_name, client_email, requested_date, requested_start_time, job_description } = req.body;
    const vals = [client_name, client_email, requested_date, requested_start_time, job_description, service_id];

    // SQL Query to insert new booking into DB
    const insertBookingSQL = `INSERT INTO bookings (client_name, client_email, requested_date, requested_start_time, job_description, service_id) 
                              VALUES (?, ?, ?, ?, ?, ?)`;

    try {
        // Execute insertBookingSQL 
        const [insertResult] = await conn.query(insertBookingSQL, vals);

        // Double checking insertion was successful
        const numInserted = insertResult.affectedRows;
        // Successful booking
        if (numInserted > 0) {
            return res.status(201).json({
                status: 'success',
                message: `Booking (ID ${insertResult.insertId}) created successfully`,
                booking_id: insertResult.insertId
            });
        }

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};



// ACCEPT BOOKING BUTTON (PATCH) - NEEDED FOR THE ACCEPT BOOKING BUTTONS TO WORK
exports.patchAcceptBooking = async (req, res) => {
    const { booking_id } = req.params;

    // SQL query to update the status for a specific booking
    const updateSQL = `UPDATE bookings
                       SET status = 'accepted'
                       WHERE booking_id = ?`;

    try {
        // Execute updateSQL
        const [updateResult] = await conn.query(updateSQL, [booking_id]);


        return res.status(200).json({
            status: 'success',
            message: `Booking (ID ${booking_id}) accepted successfully`,
            affectedRows: updateResult.affectedRows
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};


// REJECT BOOKING BUTTON (PATCH) - NEEDED FOR THE REJECT BOOKING BUTTONS TO WORK
exports.patchRejectBooking = async (req, res) => {
    const { booking_id } = req.params;

    // SQL query to update the status for a specific booking
    const updateSQL = `UPDATE bookings
                       SET status = 'rejected'
                       WHERE booking_id = ?`;

    try {
        // Execute updateSQL
        const [updateResult] = await conn.query(updateSQL, [booking_id]);


        return res.status(200).json({
            status: 'success',
            message: `Booking (ID ${booking_id}) rejected successfully`,
            affectedRows: updateResult.affectedRows
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};


// SUBMIT A TRADER RATING (POST)
exports.postRating = async (req, res) => {
    const { trader_id } = req.params; // Trader ID will be passed in URL
    const { rating } = req.body;

    const checkSQL = `SELECT trader_id 
                      FROM traders 
                      WHERE trader_id = ?`
    
    // SQL Query to Insert the individual new rating
    const insertSQL = `INSERT INTO ratings (trader_id, rating) 
                       VALUES (?, ?)`;
    

   
    try {
        // Execute checkSQL to verify trader exists
        const [rows] = await conn.query(checkSQL, [trader_id]);

        if (rows.length===0) {
            return res.status(404).json({ status: 'failure', message: 'Trader not found' });
        }

        // Execute insertSQL
        await conn.query(insertSQL, [trader_id, rating]);
        


        return res.status(201).json({
            status: 'success',
            message: 'Rating submitted successfully'
        });

    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({
            status: 'failure',
            message: "An internal server error occurred. Please try again later."
        });
    }
};

// CONTROLLER TO CHECK IF TRADER EXISTS - VALIDATORS USE THIS CONTROLLER
exports.checkTraderExists = async (req, res) => {
    const { trader_email, username } = req.body;
    
    // Check either email or username depending on what the frontend sends
    const checkSQL = `SELECT username, trader_email
                      FROM traders 
                      WHERE trader_email = ? OR username = ?`;
    
    try {
        const [rows] = await conn.query(checkSQL, [trader_email, username ]);

        

        if (rows.length > 0) {

            // Use .some() here to be safe in case the OR query returns multiple different rows
            const emailExists = rows.some(row => row.trader_email === trader_email);
            const usernameExists = rows.some(row => row.username === username);

            // 200 means it exists (error)
            return res.status(200).json({
                status: 'success',
                exists: true,
                errors: {
                    email: emailExists ? 'This email is already registered' : null,
                    username: usernameExists ? 'This username is already taken' : null,
                }
            });
        } else {
            // 404 means it doesn't exist (no error)
            return res.status(404).json({
                status: 'failure',
                exists: false,
                message: 'Credential is available'
            });
        }
    } catch (err) {
        console.error("Internal Error:", err);
        return res.status(500).json({ status: 'failure', message: "Internal validation error." });
    }
};

// CHECK AVAILABILITY - REQUIRED FOR BOOKING A SERVICE VALIDATION - VALIDATOR WILL USE THIS CONTROLLER
exports.checkAvailability = async (req, res) => {
    const { service_id, requested_date, requested_start_time } = req.body;

    // SQL Query to fetch service and trader info
    const checkServiceSQL = `SELECT services.trader_id, traders.availability 
                             FROM services 
                             JOIN traders ON services.trader_id = traders.trader_id 
                             WHERE services.service_id = ?`;

    // SQL Query to check if the day/time exists in the trader's weekly schedule
    const checkScheduleSQL = `SELECT * FROM availability_slots 
                              WHERE availability_slots.trader_id = ? 
                              AND availability_slots.day_of_week = ?`;

    // SQL Query to check for overlaps - We are assuming that each booking will take 1 hour, so any booking requests 1 hour 15 mins before or after an existing booking will be rejected (1 hour 15 minutes) 
    const checkOverlapSQL = `SELECT * FROM bookings 
                             INNER JOIN services ON bookings.service_id = services.service_id
                             WHERE services.trader_id = ? 
                             AND bookings.requested_date = ? 
                             AND bookings.status IN ('accepted', 'pending')
                             AND ABS(TIME_TO_SEC(TIMEDIFF(bookings.requested_start_time, ?))) < 4500`;

    try {
        // Check General Availability & Service
        const [serviceData] = await conn.query(checkServiceSQL, [service_id]);
        if (serviceData.length === 0) return res.status(404).json({ message: 'Service not found' });
        
        const { trader_id, availability } = serviceData[0];
        if (availability === 'unavailable') return res.status(400).json({ message: 'Trader is currently unavailable and not accepting any bookings' });

        // Check Weekly Schedule (Day of Week)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[new Date(requested_date).getDay()];
        const [daySlots] = await conn.query(checkScheduleSQL, [trader_id, dayName]);

        // First Error: Does the trader even work on this day?
        if (daySlots.length === 0) {
            return res.status(400).json({ 
                message: `Trader doesn't work on ${dayName}s` 
            });
        }
        // Second Error: Check if requested time falls within ANY of those slots
        // .some() to see if at least one slot matches the time
        const isWithinHours = daySlots.some(slot => {
            // Trim seconds off so we compare "09:00" to "09:00"
            const workStart = slot.start_time.substring(0, 5);
            const workEnd = slot.end_time.substring(0, 5);
            return requested_start_time >= workStart && requested_start_time <= workEnd;
        }); 
        if (!isWithinHours) {
            return res.status(400).json({ 
                message: `Trader is closed at ${requested_start_time.substring(0, 5)}. Please choose a time within their working hours` 
            });
        }



        // Check Overlaps
        const [overlaps] = await conn.query(checkOverlapSQL, [trader_id, requested_date, requested_start_time]);
        if (overlaps.length > 0) return res.status(409).json({ message: 'This slot is already booked' });

        // If it passes everything:
        return res.status(200).json({ status: 'success', message: 'Slot is available' });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "An internal server error occurred. Please try again later." });
    }
};


