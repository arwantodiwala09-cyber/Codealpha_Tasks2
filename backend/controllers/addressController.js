const Address = require('../models/Address');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get user's addresses
// @route   GET /api/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort('-isDefault');

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single address
// @route   GET /api/addresses/:id
exports.getAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorHandler('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized', 403));
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create address
// @route   POST /api/addresses
exports.createAddress = async (req, res, next) => {
  try {
    const { isDefault } = req.body;

    // If setting as default, remove default from others
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      ...req.body,
      user: req.user.id,
    });

    // Add address to user's addresses array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { addresses: address._id },
    });

    // If first address, set as default
    if (!isDefault) {
      const count = await Address.countDocuments({ user: req.user.id });
      if (count === 1) {
        address.isDefault = true;
        await address.save();
      }
    }

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorHandler('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized', 403));
    }

    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorHandler('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized', 403));
    }

    // Remove address from user's addresses array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { addresses: address._id },
    });

    await address.remove();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorHandler('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized', 403));
    }

    await Address.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );

    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};