const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        color: { type: String },
        size: { type: String },
        gst: { type: Number, default: 18 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      landmark: String,
      addressType: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    },
    billingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentInfo: {
      id: { type: String },
      method: {
        type: String,
        enum: ['stripe', 'razorpay', 'cod', 'wallet'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending',
      },
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
      transactionId: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    gstAmount: {
      type: Number,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    platformFee: {
      type: Number,
      default: 0.0,
    },
    packagingFee: {
      type: Number,
      default: 0.0,
    },
    discount: {
      type: Number,
      default: 0.0,
    },
    couponDiscount: {
      type: Number,
      default: 0.0,
    },
    couponCode: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    savedAmount: {
      type: Number,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'pending',
    },
    statusTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    returnReason: String,
    returnRequestedAt: Date,
    returnApprovedAt: Date,
    trackingNumber: String,
    estimatedDelivery: Date,
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    invoiceUrl: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });

module.exports = mongoose.model('Order', orderSchema);