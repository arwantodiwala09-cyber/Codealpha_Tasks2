const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const ErrorHandler = require('../utils/errorHandler');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Stripe payment intent
// @route   POST /api/payments/stripe/create-payment-intent
exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe webhook
// @route   POST /api/payments/stripe/webhook
exports.stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update order payment status
        await Order.findOneAndUpdate(
          { 'paymentInfo.id': paymentIntent.id },
          {
            'paymentInfo.status': 'paid',
            isPaid: true,
            paidAt: Date.now(),
          }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await Order.findOneAndUpdate(
          { 'paymentInfo.id': failedPayment.id },
          { 'paymentInfo.status': 'failed' }
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payments/razorpay/create-order
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/razorpay/verify
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return next(new ErrorHandler('Invalid payment signature', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process COD order
// @route   POST /api/payments/cod
exports.processCOD = async (req, res, next) => {
  try {
    // COD payment is processed when order is delivered
    res.status(200).json({
      success: true,
      message: 'Cash on delivery selected',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment methods
// @route   GET /api/payments/methods
exports.getPaymentMethods = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      methods: [
        {
          id: 'stripe',
          name: 'Stripe',
          type: 'card',
          enabled: true,
        },
        {
          id: 'razorpay',
          name: 'Razorpay',
          type: 'gateway',
          enabled: true,
          supportedMethods: ['upi', 'card', 'netbanking', 'wallet'],
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          type: 'cod',
          enabled: true,
          maxAmount: 50000,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};