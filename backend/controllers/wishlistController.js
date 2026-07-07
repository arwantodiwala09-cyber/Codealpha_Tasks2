const Wishlist = require('../models/Wishlist');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'products.product',
        select: 'name price originalPrice discount images ratings numReviews stock brand',
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        wishlist: { products: [] },
        count: 0,
      });
    }

    res.status(200).json({
      success: true,
      wishlist,
      count: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [],
      });
    }

    // Check if product already in wishlist
    const exists = wishlist.products.some(
      (p) => p.product.toString() === productId
    );

    if (exists) {
      return next(new ErrorHandler('Product already in wishlist', 400));
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      count: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return next(new ErrorHandler('Wishlist not found', 404));
    }

    wishlist.products.pull({ product: req.params.productId });
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      count: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
exports.clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $set: { products: [] } }
    );

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
exports.checkWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    const inWishlist = wishlist
      ? wishlist.products.some((p) => p.product.toString() === req.params.productId)
      : false;

    res.status(200).json({
      success: true,
      inWishlist,
    });
  } catch (error) {
    next(error);
  }
};