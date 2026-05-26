const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config({ path: './config.env' }); // Reads and use the config.env values
const router = require('./routes/scheduleroutes');



const app = express();


// Middleware
app.use(morgan('tiny'));
app.use(express.json());

// Routes
app.use('/', router);

// Start server
app.listen(process.env.PORT, (err) => {
    if (err) return console.error(err);
    console.log(`Express listening on port ${process.env.PORT}`);
});