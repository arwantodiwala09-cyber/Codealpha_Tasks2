const Category = require('../models/Category');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories', 'name slug')
      .sort('order');

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('subcategories', 'name slug image');

    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    // If parent category, add to parent's subcategories
    if (req.body.parent) {
      await Category.findByIdAndUpdate(req.body.parent, {
        $push: { subcategories: category._id },
      });
    }

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    // Remove from parent's subcategories if exists
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $pull: { subcategories: category._id },
      });
    }

    await category.remove();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category tree (hierarchical)
// @route   GET /api/categories/tree
exports.getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.find({ parent: null, isActive: true })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        select: 'name slug image icon',
      })
      .sort('order');

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all categories (including inactive)
// @route   GET /api/admin/categories
exports.adminGetCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name')
      .populate('subcategories', 'name')
      .sort('order');

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};