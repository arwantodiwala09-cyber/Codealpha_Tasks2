const express = require('express');
const router = express.Router();
const {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAddresses);
router.post('/', protect, createAddress);
router.get('/:id', protect, getAddress);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);
router.put('/:id/default', protect, setDefaultAddress);

module.exports = router;