const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

router.get('/', getCoupons);
router.post('/validate', protect, validateCoupon);
router.get('/:id', getCoupon);

module.exports = router;