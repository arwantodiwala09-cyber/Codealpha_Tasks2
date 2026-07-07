const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  moveToWishlist,
  saveForLater,
  applyCoupon,
  removeCoupon,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update/:itemId', protect, updateCartItem);
router.delete('/remove/:itemId', protect, removeCartItem);
router.post('/move-to-wishlist/:itemId', protect, moveToWishlist);
router.post('/save-for-later/:itemId', protect, saveForLater);
router.post('/apply-coupon', protect, applyCoupon);
router.delete('/remove-coupon', protect, removeCoupon);
router.delete('/clear', protect, clearCart);

module.exports = router;