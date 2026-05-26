//As the navbar will use the trader's full name when logged in, we want to have the name object in every page - we use locals (decoding JWT) - 
// ONLY WORKS FOR RENDERING, NOT FOR DB QUERIES, AUTHENTICATION, ETC.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => { 
    const token = req.session.jwt; // The token string stored in your session

    if (token) {
        try {
            // Use jwt.decode to read the payload without needing the Secret Key
            const decoded = jwt.decode(token); 
            
            res.locals.loggedIn = true;
            res.locals.trader_id = decoded.trader_id;   // Extracted from JWT
            res.locals.trader_name = decoded.trader_name; // Extracted from JWT
        } catch (err) {
            console.error("Token decode error:", err);
            res.locals.loggedIn = false;
        }
    } else {
        res.locals.loggedIn = false;
    }
    next();
};
