const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  getCategoryTree,
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategory);

module.exports = router;