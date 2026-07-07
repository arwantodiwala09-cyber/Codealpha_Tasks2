const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please enter full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please enter phone number'],
    },
    alternatePhone: String,
    address: {
      type: String,
      required: [true, 'Please enter address'],
    },
    apartment: String,
    landmark: String,
    city: {
      type: String,
      required: [true, 'Please enter city'],
    },
    state: {
      type: String,
      required: [true, 'Please enter state'],
    },
    zipCode: {
      type: String,
      required: [true, 'Please enter zip code'],
    },
    country: {
      type: String,
      default: 'India',
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Address', addressSchema);