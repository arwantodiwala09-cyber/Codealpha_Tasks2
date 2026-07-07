const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    features: [String],
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxlength: [8, 'Price cannot exceed 8 digits'],
      default: 0.0,
    },
    originalPrice: {
      type: Number,
      default: 0.0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    gst: {
      type: Number,
      default: 18,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      maxlength: [5, 'Stock cannot exceed 5 digits'],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'Please enter product SKU'],
      unique: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    brand: {
      type: String,
      required: [true, 'Please enter product brand'],
    },
    images: [
      {
        public_id: { type: String },
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
        stock: { type: Number, default: 0 },
        images: [{ public_id: String, url: String }],
      },
    ],
    sizes: [
      {
        name: { type: String, required: true },
        stock: { type: Number, default: 0 },
        priceModifier: { type: Number, default: 0 },
      },
    ],
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    flashSalePrice: {
      type: Number,
      default: 0,
    },
    flashSaleEnds: Date,
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    material: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    tags: [String],
    sellCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1, ratings: -1 });
productSchema.index({ isFeatured: 1, isTrending: 1, isBestSeller: 1 });

// Calculate discount percentage before save
productSchema.pre('save', function (next) {
  if (this.originalPrice > 0) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);