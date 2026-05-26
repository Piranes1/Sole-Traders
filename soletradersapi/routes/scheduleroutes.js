// ROUTES
const express = require('express');
const router = express.Router({ mergeParams: true });

const controller = require('./../controllers/schedulecontrollers');

const { isAuth } = require('../middleware/auth'); // Authentication middleware
const { checkServiceOwnership, checkBookingOwnership } = require('./../middleware/ownershipCheck'); // Authorization middleware






router.post('/signup', controller.postSignUp);

router.post('/login', controller.postLogin);

router.get('/directory', controller.getDirectory);

router.get('/profile', isAuth, controller.getProfile);
router.get('/editprofile', isAuth, controller.getEditProfile);
router.put('/editprofile', isAuth, controller.putEditProfile);

router.get('/editservice/:service_id', isAuth, checkServiceOwnership, controller.getEditService);
router.put('/editservice/:service_id', isAuth, checkServiceOwnership, controller.putEditService);

router.post('/addservice', isAuth, controller.postAddService);

router.delete('/deleteservice/:service_id', isAuth, checkServiceOwnership, controller.deleteService);

router.get('/traderinfo/:trader_id', controller.getTraderInfo);

router.get('/bookservice/:service_id', controller.getBookingForm);
router.post('/bookservice/:service_id', controller.postBookingForm);

router.patch('/acceptbooking/:booking_id', isAuth, checkBookingOwnership, controller.patchAcceptBooking);
router.patch('/rejectbooking/:booking_id', isAuth, checkBookingOwnership, controller.patchRejectBooking);

router.post('/ratetrader/:trader_id', controller.postRating);

router.post('/tradercheck', controller.checkTraderExists);
router.post('/availabilitycheck', controller.checkAvailability);

router.get('/filteroptions', controller.getFilterOptions);





module.exports = router;
