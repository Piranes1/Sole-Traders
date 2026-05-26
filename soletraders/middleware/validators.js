const { body} = require('express-validator'); // Adding param for rating validator
const axios = require('axios');

exports.loginValidators = [
    body('trader_email')
        .trim()
        .normalizeEmail() //
        .notEmpty().withMessage('E-Mail required')
        .isEmail().withMessage('Please provide a valid email address'),


    body('password')
        .notEmpty().withMessage('Password required')
];

exports.signUpValidators = [
    body('trader_name')
        .trim()
        .notEmpty().withMessage('Name required')
        .isLength({ min: 2, max: 70 }).withMessage('Name must be between 2 and 70 characters')
        .matches(/^[A-Za-z\s'\-]+$/).withMessage('Name contains invalid characters. Only alphabetical characters and spaces are allowed'),

    body('username')
        .trim()
        .notEmpty().withMessage('Username required')
        .bail() // Stop if empty - we need bail to avoid complex operations that are not needed (API endpoint requests)
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
        .bail() // Stop if wrong length
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Usernames can only contain letters, numbers, underscores, and hyphens')
        // Custom validations allow us to write our own JS logic for anything the express library doesn't provide by default
        .custom(value => {
            if (value.includes(' ')) throw new Error('Username cannot contain spaces');
            return true;
        })
        .bail() // Stop if it has spaces
        //API CHECK - API endpoint request 
        .custom((username) => {
            return axios.post('http://localhost:3002/tradercheck', { username }, { 
                validateStatus: (status) => status < 500  // Tell Axios to not throw error for 400/409/404 so we can read the message
            })
            .then(response => {
                // If 200 controller found a match
                if (response.status === 200 && response.data.errors.username) {
                    throw new Error('Username already exists');
                }
                return true; 
            })
            .catch(err => {
                // If it's the error we just threw above, pass that message through
                if (err.message === 'Username already exists') throw err;

                // Otherwise, it's a real Axios/Server error (connection refused, 500, etc)
                const serverError = err.response?.data?.errors?.username || 'Service unavailable';
                throw new Error(serverError);
            });
        }),

    body('trader_email')
        .trim()
        .notEmpty().withMessage('E-Mail required')
        .bail() // Stop if no email
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail()
        .bail() // Stop if no email format
        //API CHECK - API endpoint request 
        .custom((email) => {
            return axios.post('http://localhost:3002/tradercheck', { trader_email: email }, { 
                validateStatus: (status) => status < 500  // Tell Axios to not throw error for 400/409/404 so we can read the message
            })
            .then(response => {
                if (response.status === 200 && response.data.errors?.email) {
                    throw new Error('E-Mail already registered');
                }
                return true;
            })
            .catch(err => {
                // If it's the specific error we threw above, pass it straight to the UI
                if (err.message === 'E-Mail already registered') {
                    throw err; 
                }

                // 2. If it's a network/server error, log it for the dev and show a helpful message
                console.error("Connection Error:", err.message);
                throw new Error(err.response?.data?.errors?.email || 'Service unavailable');
                    });
                }),

    body('password')
        .trim()
        .notEmpty().withMessage('Password required')
        .isLength({ min: 12, max: 128 }).withMessage('Password must be 12–128 characters')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
];


exports.profileValidators = [
    // Trade type validation
    body('trade_type')
        .trim()
        .notEmpty().withMessage('Trade type is required')
        .isLength({ min: 3, max: 50 }).withMessage('Trade type must be between 3 and 50 characters')
        .matches(/^[A-Za-z\s&\-]+$/).withMessage('Trade type can only include letters (A-Z), spaces, ampersands (&), and hyphens (-)'), // Regex check allows: A-Z, a-z, &, -, spaces (' ') 

    // Region/town validation
    body('region')
        .trim()
        .notEmpty().withMessage('Region/Town is required')
        .isLength({ min: 3, max: 100 }).withMessage('Region must be between 3 and 100 characters')
        .matches(/^[A-Za-z\s&\-]+$/).withMessage('Region can only include letters (A-Z), spaces, ampersands (&), and hyphens (-)'),

    // Availabilitry dropdown validation (Ensures the value matches the <option> values)
    body('availability')
        .isIn(['available', 'soon', 'unavailable']).withMessage('Invalid availability selection'),

    // Bio/Description validation
    body('bio')
        .trim()
        .optional({ checkFalsy: true }) // Allows null, undefined, or empty string ""
        .isLength({ max: 750 }).withMessage('Bio cannot exceed 750 characters')
        .matches(/^[A-Za-z0-9\s&'’.,\-—/"!?;:()£]+$/).withMessage('Bio can only contain letters, numbers, and basic punctuation'),

    // Weekly schedule validation (Dynamic Fields: Validate that 'working_days' is an array of valid days)
    body('working_days')
        .optional() // No days could be checked - optional ensures we don't get an error
        .isArray().withMessage('Invalid schedule format') // Array check
        .custom((days) => { // Custom validator
            const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // Only 7 possible values
            const isValid = days.every(day => validDays.includes(day)); // Check if every passed day is part of validDays
            if (!isValid) throw new Error('One or more selected days are invalid');
            return true;
        }),

    // Time Validation 
    body(['start_time_*', 'end_time_*']) // We can use a wildcard (*) to check all start and end times dynamically: wildcard tells to check for anything that starts with start_time_/end_time_, so it checks all days
        .optional({ checkFalsy: true }) // Some days could be empty - optional ensures we don't get an error if a day is empty - checkFalsy: true is used to treat every empty string as null, so that we avoid a regex check that could throw errors
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format (HH:MM)') // Regex check to ensure same rules of a 24-hour clock (from 00:00 to 23:59) - [01]\d (first digit could be 0 or 1, second digit anyone between 1-9 \d) - 2[0-3] (first digit must be 2, second digit must be between 0-3) - [0-5]\d (minutes: must start with a number between between 0 and 5, but last digit could be between 19; i.e. xx:59)
];


exports.serviceValidators = [
    body('title')
        .trim()
        .notEmpty().withMessage('Service title is required')
        .isLength({ min: 3, max: 50 }).withMessage('Title must be between 3 and 80 characters')
        .matches(/^[A-Za-z0-9\s&'’.,\-—/"!?;:()£%]+$/).withMessage('Title can only contain letters, numbers, and basic punctuation'), // Blocks dangerous characters < > { }, while leaving room for flexible descriptions

    body('description')
        .trim()
        .optional({ checkFalsy: true }) // Allows null, undefined, or empty string ""
        .isLength({ max: 100 }).withMessage('Description cannot exceed 100 characters')
        .matches(/^[A-Za-z0-9\s&'’.,\-—/"!?;:()£%]+$/).withMessage('Description can only contain letters, numbers, and basic punctuation'),

    body('pricing_type')
        .trim()
        .toLowerCase() // As DB is in lower case
        .isIn(['hourly', 'fixed']).withMessage('Invalid pricing type selection'),

    
    body('base_price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0.01, max: 999999.99 }).withMessage('Price must be a valid amount (e.g. 19.99)')
        .customSanitizer(value => parseFloat(value).toFixed(2)) // Ensures 2 decimal places
];

exports.bookingValidators = [
    body('client_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .matches(/^[A-Za-z\s'\-]+$/).withMessage('Name contains invalid characters. Only alphabetical characters and spaces are allowed'),

    body('client_email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('requested_date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format')
        // Check date is not in the past
        .custom((value) => {
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to 00:00:00 to compare only the calendar date

        if (inputDate < today) {
            throw new Error('Booking date cannot be in the past');
        }
        return true;
    }),
    // Complex Availability Check (Axios Call)
    body('requested_start_time')
        .notEmpty().withMessage('Start time is required')
        .custom(async (startTime, { req }) => {
            const { service_id } = req.params;
            const { requested_date } = req.body;

            try {
                // Call checkAvailability controller on the backend
                const response = await axios.post('http://localhost:3002/availabilitycheck', {
                    service_id,
                    requested_date,
                    requested_start_time: startTime
                }, { 
                    // Tell Axios to not throw error for 400/409/404 so we can read the message
                    validateStatus: (status) => status < 500 
                });

                // If the backend returned an error (400, 404, or 409)
                if (response.status !== 200) {
                    // This pulls error message from controller, otherwise, there's an overlap and slot is already taken
                    throw new Error(response.data.message || 'Slot unavailable');
                }

                // If status is 200, validation passes
                return true;

            } catch (err) {
                // This sends the specific error message back to the EJS alert
                throw new Error(err.message || 'Unable to verify availability');
            }
        }),

    body('job_description')
        .trim()
        .optional({ checkFalsy: true }) // Allows null, undefined, or empty string ""
        .isLength({ max: 450 }).withMessage('Description cannot exceed 450 characters')
        .matches(/^[A-Za-z0-9\s&'’.,\-—/"!?;:()£%]+$/).withMessage('Description can only contain letters, numbers, and basic punctuation'),
];


exports.ratingValidators = [
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be a whole number between 1 and 5'),
];

