const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOTP,
  verifyOTP,
  changePassword,
  getMe,
  updateProfile,
  updateAvatar,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/send-otp', protect, sendOTP);
router.post('/verify-otp', protect, verifyOTP);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-avatar', protect, uploadSingle, updateAvatar);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;