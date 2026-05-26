const axios = require('axios'); // Require axios module
const { validationResult } = require('express-validator');


// CONTROLLERS

// Static display/render of index as no DB connection required - No need to async as nothing asynchronous happens here
exports.getIndex = (req, res) => {
    res.render('index');
};


exports.getDirectory = async (req, res) => {

    const { trade_type, region } = req.query;

    try {
        // Fetch both the filtered traders AND the dropdown options from API
        const [tradersRes, optionsRes] = await Promise.all([ // Promise all: takes an iterable of promises as input a returns a single Promise
            axios.get('http://localhost:3002/directory', { params: { trade_type, region } }),
            axios.get('http://localhost:3002/filteroptions')
        ]);

        // Render the page, ensuring 'tradeOptions' and 'regionOptions' are defined
        res.render('directory', {
            traders: tradersRes.data.traders, 
            tradeOptions: optionsRes.data.trades || [], // trade type filter data  
            regionOptions: optionsRes.data.regions || [], // region filter data
            currentTrade: trade_type || '',
            currentRegion: region || '',
            loggedIn: req.session.isLoggedIn || false,
        });

    } catch (err) {
        console.error("Directory Error:", err.message);
        // Render with empty arrays so the EJS loops don't crash
        res.render('directory', {
            traders: [],
            tradeOptions: [],
            regionOptions: [],
            currentTrade: '',
            currentRegion: '',
            loggedIn: req.session.isLoggedIn || false,  
        });
    }
};



// LOGIN (GET)
exports.getLogin = (req, res) => {
    // Pull data from session (default to null if empty)
    const errors = req.session.loginErrors || null;
    const oldData = req.session.oldData || null;

    // Clear the session immediately once data pulled into consts and saved ("Flush")
    req.session.loginErrors = null;
    req.session.oldData = null;

    // Render the page
     res.render('login', { errors: errors, oldData: oldData });
};

// LOGIN (POST)
exports.postLogin = async (req, res) => {

    // Obtaining any errors during login validation - if any errors: array of errors obtained and stored in a session variable
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        // Save data to session
        req.session.loginErrors = errors.array();
        req.session.oldData = req.body;
        
        // Redirect back to GET route
        return res.redirect('/login');
    }      

    const { trader_email, password } = req.body; // Values sent from form - plaintext
    const vals = { trader_email, password };

    const endpoint = `http://localhost:3002/login`;


    try {
        // Await the API response
        const response = await axios.post(endpoint, vals);

        // Extract the API response
        const token = response.data.token;
        const trader = response.data.trader;

        console.log("Token:", token);
        console.log("Trader:", trader);

        // Store in session
        const session = req.session;
        session.isLoggedIn = true;
        session.jwt = token;
     

        // Headers
        const headers = response.headers;
        console.log(headers);

        return res.redirect('/profile');

    } catch (error) {
        // Extract message sent by API - Or hardcoded alternative if the API server is down
        const apiMessage = error.response ? error.response.data.message : "Unable to connect to login service.";
        console.log("Error making API request:", apiMessage);

        // Store in session as an array to match EJS logic so we can give feedback to user
        req.session.loginErrors = [{ msg: apiMessage }];
        req.session.oldData = req.body;
        return res.redirect('/login');
    }

};


// LOGOUT (GET) - 
exports.getLogout = (req, res) => {
    req.session.destroy((err) => {
        // Handling possible errors
        if (err) {
            console.log("Error destroying session:", err);
            return res.redirect('/');
        }
        console.log("Session successfully destroyed - Logout was successful");

        res.redirect('/');
    });
};


// SIGN UP (GET)
exports.getSignUp = (req, res) => {
    const errors = req.session.signUpErrors || null;
    const oldData = req.session.oldSignUpData || null;

    req.session.signUpErrors = null;
    req.session.oldSignUpData = null;
    req.session.signupsuccess = null;

    res.render('signup', { errors: errors, oldData: oldData });
};
// SIGN UP (POST) 
exports.postSignUp = async (req, res) => {

    // Obtaining any errors during login validation - if any errors: array of errors obtained and stored in a session variable
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const { password, ...safeData } = req.body; // We want to save the data the trader entered for a better UX experience (numerous fields to fill in) but saving the passwork is a risk - with this destructuring line that uses a Rest Pattern we create an object called safeData that stores everything the trader entered at sign-up bar the password  
        req.session.signUpErrors = errors.array();
        req.session.oldSignUpData = safeData; // Save the data the trader entered in case a validation error occurs and redirection happens - this line allows us to save the data entered by user so that it doens't have to be re-entered
        return res.redirect('/signup');
    }


    const { trader_name, username, trader_email, password } = req.body;
    const vals = { trader_name, username, trader_email, password };


    const endpoint = `http://localhost:3002/signup`;

    try {
        // Await the API response
        const response = await axios.post(endpoint, vals);

        console.log("Signup Response:", response.data);

      

        // I want to automatically log in the new users, so they can access /editprofile, so we need to do the same thing the login controller does to ensure this happens
        // Extract the API response
        const token = response.data.token;
        const trader = response.data.trader;

        console.log("Token:", token);
        console.log("Trader:", trader);

        // Store in session
        const session = req.session;
        session.isLoggedIn = true;
        session.jwt = token;
      
        // Headers
        const headers = response.headers;
        console.log(headers);

        // After successful signup, redirect to profile
        return res.redirect('/editprofile');

    } catch (error) {
        // Extract message sent by API + logic to handle if the API server is down
        const apiErrorMessage = error.response?.data?.message || "Account creation failed. Please try again.";
        console.error("SIGNUP API ERROR:", apiErrorMessage);

        // Creating safeData object again within the catch block
        const { password, ...safeData } = req.body;

        req.session.signupsuccess = {
            status: 'failure',
            message: apiErrorMessage
        };
        req.session.oldSignUpData = safeData; // Keep all bar the password
        return res.redirect('/signup');
    }

};


// PROFILE (GET) - USING MULTIPLE SQL STATEMENTS IN A SINGLE QUERY USING MYSQL12/PROMISE WRAPPER AND ASYNC/AWAIT
exports.getProfile = async (req, res) => {
    const { jwt } = req.session; // Retrieving stored JWT from session

    // If the URL shows a status, we use that status to filter bookings, otherwise status is undefined and defaults to 'all' (show all bookings)
    const statusFilter = req.query.status || 'all';

    // statusFilter tells us if trader is filtering bookings by status. The ? marks the boundary between the patch and the query string
    // The query string specifies details or filters for the page
    const endpoint = `http://localhost:3002/profile?status=${statusFilter}`; 


    try {
        // Await the API response
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${jwt}` } // Sending headers request to API for authentication 
        });

        // Extract the API response
        const { trader, services, bookings, schedule } = response.data;
       
        // Capturing flag from URL, so we can pass feedback to user after quick action buttons are used
        const errorMessage = req.query.error || null;
        const successMessage = req.query.success || null; 

        return res.render('profile', { trader, services, bookings, schedule, currentStatus: statusFilter, errorMessage, successMessage });

    } catch (error) {
       console.log(`Error fetching edit profile data:", ${error}`);
       return res.redirect('/');
    }
};

// EDIT PROFILE (GET)
exports.getEditProfile = async (req, res) => {
    const { jwt } = req.session; // Retrieving stored JWT from session

    const endpoint = `http://localhost:3002/editprofile`;

    try {
        // Await the API response
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${jwt}` } // Sending headers request to API for authentication 
        });

        // Extract API response
        const { trader, schedule } = response.data;

        // We require errrors and oldData to show feedback to trader if something goes wrong and to keep the data entered for better UX
        return res.render('editprofile', { trader, schedule, errors: [], oldData: {} });

    } catch (error) {
        console.log(`Error fetching edit profile data:", ${error}`);
        return res.redirect('/profile');
    }

};

// EDIT PROFILE (AXIOS PUT) - TWO TRY/CATCH BLOCKS NEEDED AS WE HAVE TO FETCH FORM DATA FROM DB, IF UPDATE FAILS WE HAVE TO GO BACK AND SAY 'WE KNOW IT FAILED BUT I STILL NEED DATA TO RENDER IT AGAIN'
exports.postEditProfile = async (req, res) => {
    
    const { jwt } = req.session; // Retrieving stored JWT from session

     const endpoint = `http://localhost:3002/editprofile`; // Define endpoint
     

    // Obtaining any errors during form validation (express-validator)
    const errors = validationResult(req);

    // If local validation fails, we re-render immediately with a 400 status
    if (!errors.isEmpty()) {
        try {
            const getData = await axios.get(endpoint, {
                // Sending headers request to API for authentication
                headers: { Authorization: `Bearer ${jwt}` }
            });

            return res.status(400).render('editprofile', { // Validation failed - 400 code to avoid a default success code because it rendered
                trader: getData.data.trader,
                schedule: getData.data.schedule,
                errors: errors.array(), // Passing the structured array for red alerts
                oldData: req.body, // Feedback on user mistakes

            });
        } catch (err) {
            return res.redirect('/profile');
        }
    }

    // Attempt API update if no errors
    try {
        // Await the API response
        await axios.put(endpoint, req.body,
            {
                // Sending headers request to API for authentication
                headers: { Authorization: `Bearer ${jwt}` } 
            }
        );
        return res.redirect('/profile');

    } catch (error) {
       // Extract error message sent by API 
        const apiErrorMessage = error.response?.data?.message || "Connection error.";
        console.error(`Error updating profile: ${apiErrorMessage}`);

        // Re-fetch current data (trader/schedule) so the form can re-render
        return res.status(error.response?.status || 500).render('editprofile', { // Passing dynamic API status, at this step, if status not received 500
            trader: req.body, // Keep user input
            schedule: [],
            errors: [{ msg:apiErrorMessage}],
            oldData: req.body, // Keep user rinput
        });
    }
};



// EDIT SERVICE (GET)
exports.getEditService = async (req, res) => {
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being updated
    const { jwt } = req.session; // Retrieving stored JWT from session


    const endpoint = `http://localhost:3002/editservice/${service_id}`;

    try {
        // Await the API response
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${jwt}` } // Sending headers request to API for authentication
        });

        const service = response.data.service;

        return res.render("editservice", { 
            service, 
            errors: [],
            oldData: {}
        });

    } catch (error) {
        console.error(`Error fetching service:", ${error}`);
        return res.redirect("/profile");
    }
};
// EDIT SERVICE (PUT)
exports.postEditService = async (req, res) => {
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being booked

    const errors = validationResult(req);
    // If errors, send user back to form and don't call API
    if (!errors.isEmpty()) {
        return res.render('editservice', {
            service: { service_id }, 
            errors: errors.array(),
            oldData: req.body, // Keeps user input
        });
    }

 
    const { jwt } = req.session; // Retrieving stored JWT from session
    const { title, description, pricing_type, base_price } = req.body;
    const vals = { title, description, pricing_type, base_price }; // Service_id sent in URL, so we don't need it here  

    const endpoint = `http://localhost:3002/editservice/${service_id}`;

    try {
        // Await the API response
        await axios.put(endpoint, vals,
            {
                headers: { Authorization: `Bearer ${jwt}` } // Sending headers request to API for authentication
            }
        );

        return res.redirect('/profile');

    } catch (error) {
        const apiError = error.response?.data?.message || "Could not update service.";
        console.error(`Error updating service: ${error}`);
        
        // Handle API rejection
        return res.render('/editservice', {
            service: { service_id },
            errors: [{ msg: apiError }], // Map the API error into an array so EJS can read it
            oldData: req.body // Keep input data for better UX
        });
    }

};


// ADD SERVICE (GET)
exports.getAddService = (req, res) => {
    res.render('addservice', {
        errors: [], // We need empty errors and old data to handle EJS validation logic, GET won't have any validation errors
        oldData: {}, // or any old data from user input, but it shares the same EJS page as postAddService - so we need them empty to avoid crashes while allowing for user to keep old data
    });
};
// ADD SERVICE (POST)
exports.postAddService = async (req, res) => {

    const errors = validationResult(req);
    // If errors, send user back to form and don't call API
    if (!errors.isEmpty()) {
        return res.render('addservice', {
            errors: errors.array(),
            oldData: req.body, // Keeps user input
        });
    }

    const { jwt } = req.session; // Retrieving stored JWT from session

    const { title, description, pricing_type, base_price } = req.body;
    const vals = { title, description, pricing_type, base_price }; // API knows trader_id from the JWT token, so we don't need it here  

    const endpoint = `http://localhost:3002/addservice`;

   

    try {
        // Await the API response
        await axios.post(endpoint, vals, {
            headers: { Authorization: `Bearer ${jwt}` } // Sending headers request to API for authentication
        });

        return res.redirect('/profile');

    } catch (error) {
        // Handle API/Database errors
        const apiError = error.response?.data?.message || "Server error occurred.";
        
        return res.render('addservice', {
            errors: [{ msg: apiError }], // Map the API error into an array so EJS can read it
            oldData: req.body // Keep input data for better UX
        });
    }
};




// DELETE SERVICE (DELETE)
exports.postDeleteService = async (req, res) => {
    const { service_id } = req.params;
    const { jwt } = req.session; // Retrieving stored JWT from session

    const endpoint = `http://localhost:3002/deleteservice/${service_id}`; // Sending headers request to API for authentication



    try {
        // Await the API response
        await axios.delete(endpoint, {
            headers: { Authorization: `Bearer ${jwt}` } // Sending headers request to API for authentication
        });

        return res.redirect('/profile?success=deleted');

    } catch (error) {
        console.error(`Error deleting service: ${error}`);
        return res.redirect('/profile?error=delete_failed');
    }
};

// TRADER INFO (GET)
exports.getTraderInfo = async (req, res) => {
    const { trader_id } = req.params; // Uses the trader ID in the route, to target the specific trader that's being selected

    // Capture error or success message from the URL
    const errorMessage = req.query.error; 
    const successMessage = req.query.success;


    const endpoint = `http://localhost:3002/traderinfo/${trader_id}`;

    try {
        // Await the API response
        const response = await axios.get(endpoint);

        // Extract the API response
        const trader = response.data.trader;
        const services = response.data.services;
        const schedule = response.data.schedule;

        return res.render('traderinfo', {
            trader,
            services,
            schedule,
            errorMessage,
            successMessage,
            publicTraderName: trader.trader_name // Renaming trader_name for the public trader information, so that it doesn't clash with the logged in trader trader_name variable
        });
    } catch (error) {
        console.error(`Error fetching trader info: ${error}`);
        return res.redirect('/');
    }
};


// BOOK SERVICE (GET)
exports.getBookingForm = async (req, res) => {
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being booked

    const endpoint = `http://localhost:3002/bookservice/${service_id}`;

    try {
        // Await the API response
        const response = await axios.get(endpoint);
        // Extract the API response
        const service = response.data.service;
        const trader = response.data.trader;

        // Check if trader and service exist
        if (!service || !trader) {
            return res.status(404).redirect('/directory');
        }

        return res.render('bookservice', {
            service_id,
            service,
            trader,
            errors: [],    // So EJS knows it exists but could be empty
            oldData: {},    // Empty object, as the GET won't contain oldData, but shares the same EJS the POST redirects to if validation errors - EJS that uses oldData keep user data even after error
            error: null
        });

    } catch (error) {
        console.error(`Error fetching booking form data: ${error}`);
        return res.redirect('/directory');
    }
};
// BOOK SERVICE (POST)
exports.postBookingForm = async (req, res) => {
    const { service_id } = req.params; // Uses the service ID in the route, to target the specific service that's being booked

    const errors = validationResult(req);

    const endpoint = `http://localhost:3002/bookservice/${service_id}`;

    // Handle validation errors checked by API controller checkAvailability
    if (!errors.isEmpty()) {
        try {
            // We still need to fetch service info so the EJS can show the service title
            const serviceRes = await axios.get(`http://localhost:3002/bookservice/${service_id}`);

            const allErrors = errors.array();
        
            // I want a big red box if trader status is unavailable so: check if ANY of the errors are about the trader being unavailable
            // We look for the specific message backend checkAvailability sends
            const systemMessage = allErrors.find(e => 
                e.msg.includes('currently unavailable') // Find specific error message
            );
            
            return res.status(400).render('bookservice', { // Validation failed - 400 code to avoid a default success code because it rendered
                service: serviceRes.data.service,
                trader: serviceRes.data.trader,
                service_id: service_id,
                errors: allErrors, // Contains "Slot already booked" or "Trader doesn't work on Sundays"
                oldData: req.body,
                error: systemMessage ? systemMessage.msg : null // Extracting the specific error we want in the general red box
            });
        } catch (err) {
            console.error("Error during validation:", err.message);
            return res.redirect('/directory');
        }
    }
    // Attempt booking if no errors
    try {
        // Await the API repsonse
        const response = await axios.post(endpoint, req.body);

        return res.redirect('/bookingconfirmation');
        
    } catch (error) {
        try {
            // Extract specific error message from API
            const apiErrorMessage = error.response?.data?.message || "An error occurred while processing your booking.";
            console.error(`Booking rejection: ${apiErrorMessage}`);
            
            // Service specific endpoint - If API is down it will throw an error, so we need another catch in case a redirection to directory is necessary
            const getData = await axios.get(`http://localhost:3002/service/${service_id}`);
                
            // Render the same page along with error & previous input
            return res.status(error.response?.status || 500).render('bookservice', { // Passing dynamic API status, at this step, if status not received 500
                service_id,
                service: getData.data.service,
                trader: getData.data.trader,
                error: apiErrorMessage, // Use by EJS to provide feedback
                oldData: req.body,
                errors:[],          
            });
        } catch {
            // API is down, can't even show the form
            return res.redirect('/directory');
        }
    }
};


// BOOKING CONFIRMATION (GET)
exports.getBookingConfirmation = (req, res) => {
    res.render('bookingconfirmation');
};






// ACCEPT BOOKING BUTTON POST - NEEDED FOR THE ACCEPT BOOKING BUTTONS TO WORK
exports.postAcceptBooking = async (req, res) => {
    const { booking_id } = req.params; // Uses the booking ID in the route, to target the specific booking that's being accepted
    const { jwt } = req.session; // Retrieving stored JWT from session


    const endpoint = `http://localhost:3002/acceptbooking/${booking_id}`;


    try {
        // Await the API repsonse
        const response = await axios.patch(endpoint, {}, {
            headers: { Authorization: `Bearer ${jwt}` }
        });

        // Checking if booking was accepted successfully
        if (response.data && response.data.success) {
            return res.redirect('/profile');
        }

        return res.redirect('/profile?success=accepted');

    } catch (error) {
        console.error(`Error accepting booking: ${error}`);
        return res.redirect('/profile?error=true');
    }

}

// REJECT BOOKING BUTTON POST - NEEDED FOR THE REJECT BOOKING BUTTONS TO WORK
exports.postRejectBooking = async (req, res) => {
    const { booking_id } = req.params; // Uses the booking ID in the route, to target the specific booking that's being rejected
    const { jwt } = req.session; // Retrieving stored JWT from session


    const endpoint = `http://localhost:3002/rejectbooking/${booking_id}`;


    try {
        // Await the API response
        const response = await axios.patch(endpoint, {}, {
            headers: { Authorization: `Bearer ${jwt}` }
        });

        // Checking if booking was rejected successfully
        if (response.data && response.data.success) {
            return res.redirect('/profile');
        }

        return res.redirect('/profile?success=rejected');

    } catch (error) {
        console.error(`Error rejecting booking: ${error}`);
        return res.redirect('/profile?error=true');
    }

}

// SUBMIT A TRADER RATING (POST)
exports.postRating = async (req, res) => {
    const { trader_id } = req.params;
    const { rating } = req.body;

    // Check for validation errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessage = errors.array()[0].msg; // Extracting the error message
        return res.redirect(`/traderinfo/${trader_id}?error=${encodeURIComponent(errorMessage)}`); // Passing error info in URL - encodeURIComponent ensures no characters break the URL
    }

    try {
        // Forward the rating to the API on Port 3002
        await axios.post(`http://localhost:3002/ratetrader/${trader_id}`, {
            rating: rating
        });

        // Redirect back to the trader's info page
        res.redirect(`/traderinfo/${trader_id}?success=rated`);
    } catch (error) {
        const apiErrorMessage = error.response?.data?.message || "An error occurred while processing your rating.";
        console.error(`Rating rejection: ${apiErrorMessage}`);
        res.redirect(`/traderinfo/${trader_id}?error=${encodeURIComponent(apiErrorMessage)}`); // Passing error info in URL - encodeURIComponent ensures no characters break the URL
    }
};

