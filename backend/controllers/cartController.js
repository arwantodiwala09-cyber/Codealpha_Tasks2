const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const ErrorHandler = require('../utils/errorHandler');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price originalPrice discount images stock brand gst')
      .populate('savedForLater.product', 'name price images stock');

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], savedForLater: [] },
        cartSummary: getEmptyCartSummary(),
      });
    }

    const cartSummary = calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      cart,
      cartSummary,
    });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, color, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    if (product.stock < quantity) {
      return next(new ErrorHandler('Insufficient stock', 400));
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    // Check if product already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === (color || null) &&
        item.size === (size || null)
    );

    if (existingIndex > -1) {
      // Update quantity
      cart.items[existingIndex].quantity += quantity;
      if (cart.items[existingIndex].quantity > product.stock) {
        cart.items[existingIndex].quantity = product.stock;
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        color: color || undefined,
        size: size || undefined,
        price: product.price,
        gst: product.gst,
      });
    }

    await cart.save();

    // Return populated cart
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price originalPrice discount images stock brand gst');

    const cartSummary = calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      cart,
      cartSummary,
      message: 'Item added to cart',
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return next(new ErrorHandler('Item not found in cart', 404));
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    if (quantity > product.stock) {
      return next(new ErrorHandler('Insufficient stock', 400));
    }

    item.quantity = quantity;
    if (item.quantity <= 0) {
      cart.items.pull(itemId);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price originalPrice discount images stock brand gst');

    const cartSummary = calculateCartSummary(populatedCart);

    res.status(200).json({
      success: true,
      cart: populatedCart,
      cartSummary,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    cart.items.pull(req.params.itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price originalPrice discount images stock brand gst');

    const cartSummary = calculateCartSummary(populatedCart);

    res.status(200).json({
      success: true,
      cart: populatedCart,
      cartSummary,
    });
  } catch (error) {
    next(error);
  }
};

exports.moveToWishlist = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return next(new ErrorHandler('Item not found in cart', 404));
    }

    // Add to wishlist
    const Wishlist = require('../models/Wishlist');
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    const existsInWishlist = wishlist.products.some(
      (p) => p.product.toString() === item.product.toString()
    );

    if (!existsInWishlist) {
      wishlist.products.push({ product: item.product });
      await wishlist.save();
    }

    // Remove from cart
    cart.items.pull(req.params.itemId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item moved to wishlist',
    });
  } catch (error) {
    next(error);
  }
};

exports.saveForLater = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return next(new ErrorHandler('Item not found in cart', 404));
    }

    cart.savedForLater.push({
      product: item.product,
      quantity: item.quantity,
    });

    cart.items.pull(req.params.itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock')
      .populate('savedForLater.product', 'name price images stock');

    res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return next(new ErrorHandler('Invalid coupon code', 400));
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'price');

    if (!cart || cart.items.length === 0) {
      return next(new ErrorHandler('Cart is empty', 400));
    }

    const subtotal = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const validation = coupon.isValid(subtotal, req.user.id);
    if (!validation.valid) {
      return next(new ErrorHandler(validation.message, 400));
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    cart.coupon = {
      code: coupon.code,
      discount,
      type: coupon.discountType,
    };

    await cart.save();

    res.status(200).json({
      success: true,
      discount,
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.coupon = undefined;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [], coupon: undefined } }
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

const getEmptyCartSummary = () => ({
  itemsPrice: 0,
  totalDiscount: 0,
  gstAmount: 0,
  platformFee: 0,
  packagingFee: 0,
  deliveryCharges: 0,
  couponDiscount: 0,
  totalSavings: 0,
  subtotal: 0,
  grandTotal: 0,
  itemCount: 0,
});

const calculateCartSummary = (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return getEmptyCartSummary();
  }

  let itemsPrice = 0;
  let originalPrice = 0;
  let gstAmount = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    if (item.product) {
      const qty = item.quantity || 1;
      itemsPrice += item.product.price * qty;
      originalPrice += (item.product.originalPrice || item.product.price) * qty;
      gstAmount += (item.product.price * qty * (item.gst || item.product.gst || 18)) / 100;
      itemCount += qty;
    }
  }

  const totalDiscount = originalPrice - itemsPrice;
  const platformFee = 3;
  const packagingFee = Math.round(itemCount * 5);
  const deliveryCharges = itemsPrice > 499 ? 0 : 40;
  const couponDiscount = cart.coupon?.discount || 0;
  const totalSavings = totalDiscount + couponDiscount + (deliveryCharges > 0 ? 0 : 40);
  const subtotal = itemsPrice + gstAmount + platformFee + packagingFee + deliveryCharges;
  const grandTotal = subtotal - couponDiscount;

  return {
    itemsPrice: Math.round(itemsPrice),
    totalDiscount: Math.round(totalDiscount),
    gstAmount: Math.round(gstAmount),
    platformFee,
    packagingFee,
    deliveryCharges,
    couponDiscount: Math.round(couponDiscount),
    totalSavings: Math.round(totalSavings),
    subtotal: Math.round(subtotal),
    grandTotal: Math.round(grandTotal),
    itemCount,
  };
};