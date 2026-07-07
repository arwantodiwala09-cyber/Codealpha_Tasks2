const express = require('express');
const router = express.Router();
const {
  createStripePaymentIntent,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
  processCOD,
  getPaymentMethods,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/methods', getPaymentMethods);
router.post('/stripe/create-payment-intent', protect, createStripePaymentIntent);
router.post('/stripe/webhook', stripeWebhook);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/cod', protect, processCOD);

module.exports = router;