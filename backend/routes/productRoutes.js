const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getTrendingProducts,
  getBestSellers,
  getNewArrivals,
  getFlashSales,
  getRelatedProducts,
  searchProducts,
  getBrands,
  createProductReview,
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/bestsellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/flash-sales', getFlashSales);
router.get('/search', searchProducts);
router.get('/brands', getBrands);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.put('/:id/review', protect, createProductReview);

module.exports = router;