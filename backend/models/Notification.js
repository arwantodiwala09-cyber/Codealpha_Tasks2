const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter notification title'],
    },
    message: {
      type: String,
      required: [true, 'Please enter notification message'],
    },
    type: {
      type: String,
      enum: [
        'order',
        'payment',
        'shipping',
        'promotion',
        'wishlist',
        'review',
        'system',
        'coupon',
        'offer',
      ],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    link: String,
    image: String,
    data: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);