//Routes
const express = require('express');
const router = express.Router({ mergeParams: true });

const controller = require('./../controllers/schedulecontrollers');

const { isAuth } = require('./../middleware/auth.js');
const { loginValidators } = require('./../middleware/validators');
const { signUpValidators } = require('./../middleware/validators');
const { profileValidators } = require('../middleware/validators');
const { serviceValidators } = require('../middleware/validators');
const { bookingValidators } = require('../middleware/validators');
const { ratingValidators } = require('../middleware/validators');


router.get('/', controller.getIndex);
router.get('/index', controller.getIndex);


router.get('/directory', controller.getDirectory);

router.get('/login', controller.getLogin);
router.post('/login', loginValidators, controller.postLogin);

router.get('/logout', controller.getLogout);

router.get('/signup', controller.getSignUp);
router.post('/signup', signUpValidators, controller.postSignUp);

router.get('/profile', isAuth, controller.getProfile);
router.get('/editprofile', isAuth, controller.getEditProfile);
router.post('/profile', isAuth, profileValidators, controller.postEditProfile);

router.get('/editservice/:service_id', isAuth, controller.getEditService);
router.post('/editservice/:service_id', isAuth, serviceValidators, controller.postEditService);

router.get('/addservice', isAuth, controller.getAddService);
router.post('/addservice', isAuth, serviceValidators, controller.postAddService);

router.post('/deleteservice/:service_id', isAuth, controller.postDeleteService);

router.get('/traderinfo/:trader_id', controller.getTraderInfo);

router.get('/bookservice/:service_id', controller.getBookingForm);
router.post('/bookservice/:service_id', bookingValidators, controller.postBookingForm);

router.get('/bookingconfirmation', controller.getBookingConfirmation);

router.post('/acceptbooking/:booking_id', isAuth, controller.postAcceptBooking);
router.post('/rejectbooking/:booking_id', isAuth, controller.postRejectBooking);

router.post('/ratetrader/:trader_id', ratingValidators, controller.postRating);

module.exports = router;
