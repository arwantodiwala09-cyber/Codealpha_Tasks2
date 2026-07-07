const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

// Admin Product Management
const {
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Admin Category Management
const {
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Admin Order Management
const {
  adminGetOrders,
  updateOrderStatus,
  getOrderStats,
} = require('../controllers/orderController');

// Admin Coupon Management
const {
  adminGetCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

// Protect all admin routes
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard' });
});

// Product Management
router.get('/products', adminGetProducts);
router.post('/products', uploadMultiple, createProduct);
router.put('/products/:id', uploadMultiple, updateProduct);
router.delete('/products/:id', deleteProduct);

// Category Management
router.get('/categories', adminGetCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Order Management
router.get('/orders', adminGetOrders);
router.get('/orders/stats', getOrderStats);
router.put('/orders/:id/status', updateOrderStatus);

// Coupon Management
router.get('/coupons', adminGetCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// User Management
const User = require('../models/User');
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshTokens').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password -refreshTokens');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;