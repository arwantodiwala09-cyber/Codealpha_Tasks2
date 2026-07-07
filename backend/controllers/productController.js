const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const ErrorHandler = require('../utils/errorHandler');
const { deleteImage } = require('../middleware/upload');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const resultPerPage = Number(req.query.limit) || 12;

    const apiFeatures = new APIFeatures(Product.find({ status: 'active' }), req.query)
      .search()
      .filter()
      .category(req.query.category)
      .priceRange(req.query.minPrice, req.query.maxPrice)
      .rating(req.query.minRating)
      .discount(req.query.minDiscount)
      .filterByBrand(req.query.brands)
      .filterByColor(req.query.colors)
      .filterBySize(req.query.sizes)
      .sort()
      .pagination(resultPerPage);

    const products = await apiFeatures.query
      .populate('category', 'name slug')
      .select('-reviews');

    const totalCount = await apiFeatures.getTotalCount();

    res.status(200).json({
      success: true,
      count: products.length,
      totalCount,
      totalPages: Math.ceil(totalCount / resultPerPage),
      currentPage: Number(req.query.page) || 1,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('category', 'name slug');

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('category', 'name slug');

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file, index) => ({
        public_id: file.filename,
        url: file.path,
        isPrimary: index === 0,
      }));
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    if (req.files && req.files.length > 0) {
      // Delete old images
      for (const image of product.images) {
        await deleteImage(image.public_id);
      }

      req.body.images = req.files.map((file, index) => ({
        public_id: file.filename,
        url: file.path,
        isPrimary: index === 0,
      }));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Delete images from cloudinary
    for (const image of product.images) {
      await deleteImage(image.public_id);
    }

    await product.remove();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   PUT /api/products/:id/review
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, title } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return next(new ErrorHandler('Product already reviewed', 400));
    }

    const review = {
      user: req.user.id,
      product: req.params.id,
      rating: Number(rating),
      title,
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Calculate average rating
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, status: 'active' })
      .populate('category', 'name slug')
      .limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
exports.getTrendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isTrending: true, status: 'active' })
      .populate('category', 'name slug')
      .limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bestseller products
// @route   GET /api/products/bestsellers
exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isBestSeller: true, status: 'active' })
      .populate('category', 'name slug')
      .limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
exports.getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isNewArrival: true, status: 'active' })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flash sales
// @route   GET /api/products/flash-sales
exports.getFlashSales = async (req, res, next) => {
  try {
    const products = await Product.find({
      isFlashSale: true,
      flashSaleEnds: { $gt: Date.now() },
      status: 'active',
    })
      .populate('category', 'name slug')
      .limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    const products = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
    })
      .populate('category', 'name slug')
      .limit(4);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products (autocomplete)
// @route   GET /api/products/search
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return next(new ErrorHandler('Please provide a search query', 400));
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      status: 'active',
    })
      .select('name brand price images discount ratings stock')
      .limit(10);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all brands
// @route   GET /api/products/brands
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { status: 'active' });

    res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all products (including inactive)
// @route   GET /api/admin/products
exports.adminGetProducts = async (req, res, next) => {
  try {
    const resultPerPage = Number(req.query.limit) || 20;

    const apiFeatures = new APIFeatures(Product.find(), req.query)
      .search()
      .filter()
      .sort()
      .pagination(resultPerPage);

    const products = await apiFeatures.query.populate('category', 'name slug');
    const totalCount = await apiFeatures.getTotalCount();

    res.status(200).json({
      success: true,
      count: products.length,
      totalCount,
      totalPages: Math.ceil(totalCount / resultPerPage),
      currentPage: Number(req.query.page) || 1,
      products,
    });
  } catch (error) {
    next(error);
  }
};