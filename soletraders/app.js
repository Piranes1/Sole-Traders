const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config({ path: './config.env' }); // Reads and use the config.env values
const session = require('express-session'); // Required for sessions
const morgan = require('morgan');
const router = require('./routes/scheduleroutes');
const locals = require('./middleware/locals.js');

const app = express();


// Global Middleware
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true })); // Parses incoming HTML forms into a JS object available at req.body
app.use(session({ // Session middleware
    secret: 'MySoleTradersPass1999',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Security: cookie cannot be accessed via client-side scripting languages
        sameSite: 'lax',  // Better security while maintaining functionality
        maxAge: 3600000 // 1 hour
    }
}));
app.use(locals); // User locals to populate navbar dynamically
app.use(morgan('tiny'));
app.set('view engine', 'ejs');


// Routes
app.use('/', router);

// Start server
app.listen(process.env.PORT, (err) => {
    if (err) return console.error(err);
    console.log(`Express listening on port ${process.env.PORT}`);
});