const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new ErrorHandler('No order items', 400));
    }

    // Calculate prices
    let itemsPrice = 0;
    let gstAmount = 0;
    let totalDiscount = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorHandler(`Product not found: ${item.product}`, 404));
      }

      if (product.stock < item.quantity) {
        return next(new ErrorHandler(`Insufficient stock for ${product.name}`, 400));
      }

      const itemPrice = product.price * item.quantity;
      const itemGst = (itemPrice * (item.gst || product.gst)) / 100;
      const itemOriginalPrice = (product.originalPrice || product.price) * item.quantity;
      const itemDiscount = itemOriginalPrice - itemPrice;

      itemsPrice += itemPrice;
      gstAmount += itemGst;
      totalDiscount += itemDiscount;

      item.price = product.price;
      item.name = product.name;
      item.image = product.images[0]?.url || '';
      item.gst = item.gst || product.gst;
    }

    // Calculate shipping
    const shippingPrice = itemsPrice > 499 ? 0 : 40;
    const platformFee = 3;
    const packagingFee = itemsPrice * 0.01;

    let totalPrice = itemsPrice + gstAmount + shippingPrice + platformFee + packagingFee;

    // Apply coupon
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validation = coupon.isValid(totalPrice, req.user.id);
        if (validation.valid) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (totalPrice * coupon.discountValue) / 100;
            if (coupon.maxDiscount > 0) {
              couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
            }
          } else {
            couponDiscount = coupon.discountValue;
          }

          // Update coupon usage
          coupon.usedCount += 1;
          const userUsage = coupon.usersUsed.find(
            (u) => u.user.toString() === req.user.id.toString()
          );
          if (userUsage) {
            userUsage.usedCount += 1;
          } else {
            coupon.usersUsed.push({ user: req.user.id });
          }
          await coupon.save();
        }
      }
    }

    totalPrice -= couponDiscount;
    const savedAmount = totalDiscount + couponDiscount + (shippingPrice > 0 ? 0 : 40);

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
      },
      itemsPrice,
      gstAmount,
      shippingPrice,
      platformFee,
      packagingFee,
      discount: totalDiscount,
      couponDiscount,
      couponCode: couponCode?.toUpperCase(),
      totalPrice,
      savedAmount,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      statusTimeline: [
        {
          status: 'pending',
          timestamp: Date.now(),
          description: 'Order placed successfully',
        },
      ],
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sellCount: item.quantity },
      });
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } }
    );

    // Send confirmation email
    try {
      const user = await User.findById(req.user.id);
      const emailContent = emailTemplates.orderConfirmation(user.name, order);
      await sendEmail({
        email: user.email,
        ...emailContent,
      });
    } catch (err) {
      console.error('Order confirmation email failed:', err);
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('orderItems.product', 'name images brand');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images brand');

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Check if order belongs to user or user is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized to access this order', 403));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    if (order.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized', 403));
    }

    if (['delivered', 'cancelled', 'returned'].includes(order.orderStatus)) {
      return next(new ErrorHandler('Order cannot be cancelled', 400));
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancelReason = req.body.reason;
    order.statusTimeline.push({
      status: 'cancelled',
      timestamp: Date.now(),
      description: req.body.reason || 'Order cancelled by user',
    });

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sellCount: -item.quantity },
      });
    }

    // Refund if paid
    if (order.isPaid) {
      order.paymentInfo.status = 'refunded';
      order.paymentInfo.refundedAt = Date.now();
      order.paymentInfo.refundAmount = order.totalPrice;
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request return
// @route   PUT /api/orders/:id/return
exports.requestReturn = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    if (order.orderStatus !== 'delivered') {
      return next(new ErrorHandler('Order must be delivered to request return', 400));
    }

    if (order.returnRequestedAt) {
      return next(new ErrorHandler('Return already requested', 400));
    }

    order.returnRequestedAt = Date.now();
    order.returnReason = req.body.reason;
    order.orderStatus = 'returned';
    order.statusTimeline.push({
      status: 'returned',
      timestamp: Date.now(),
      description: req.body.reason || 'Return requested by user',
    });

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all orders
// @route   GET /api/admin/orders
exports.adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .sort('-createdAt');

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;

    res.status(200).json({
      success: true,
      count: totalOrders,
      stats: { totalOrders, totalRevenue, pendingOrders, deliveredOrders },
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order status
// @route   PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, description, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    order.orderStatus = status;
    order.statusTimeline.push({
      status,
      timestamp: Date.now(),
      description: description || `Order ${status}`,
      updatedBy: req.user.id,
    });

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get order stats
// @route   GET /api/admin/orders/stats
exports.getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
    ]);

    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      stats,
      monthlyStats,
    });
  } catch (error) {
    next(error);
  }
};