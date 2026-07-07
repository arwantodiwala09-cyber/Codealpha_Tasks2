import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Eye,
  Share2,
  Star,
  Zap,
  Truck,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const {
    _id,
    name,
    brand,
    price,
    originalPrice,
    discount,
    images,
    ratings,
    numReviews,
    stock,
    freeDelivery,
    isBestSeller,
    isTrending,
    isNewArrival,
    isFlashSale,
    flashSalePrice,
  } = product;

  const hasImage = !!images?.[0]?.url;
  const displayPrice = isFlashSale && flashSalePrice ? flashSalePrice : price;
  const displayOriginal = isFlashSale && flashSalePrice ? price : originalPrice;
  const actualDiscount = isFlashSale && flashSalePrice
    ? Math.round(((originalPrice - flashSalePrice) / originalPrice) * 100)
    : discount;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    setIsAdding(true);
    await addToCart(_id, 1);
    setIsAdding(false);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    await toggleWishlist(_id);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/products/${_id}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${_id}`}>
        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 p-2 rounded-xl transition-all duration-300 ${
            isInWishlist(_id)
              ? 'bg-red-50 text-red-500 shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart size={18} fill={isInWishlist(_id) ? 'currentColor' : 'none'} />
        </button>

        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-dark-700 aspect-square flex items-center justify-center">
          {hasImage ? (
            <img
              src={images[0].url}
              alt={name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/90 dark:bg-gray-800 dark:text-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
                {name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                No image available
              </span>
            </div>
          )}

          {/* Hover Actions */}
          <motion.div
            initial={false}
            animate={{ y: isHovered ? 0 : 80 }}
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-900 hover:bg-primary-500 hover:text-white'
                } ${isAdding ? 'scale-95' : ''}`}
              >
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : stock === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleQuickView}
                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors"
              >
                <Eye size={16} className="text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({ title: name, url: `/products/${_id}` });
                  } else {
                    navigator.clipboard.writeText(window.location.origin + `/products/${_id}`);
                    toast.success('Link copied!');
                  }
                }}
                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors"
              >
                <Share2 size={16} className="text-gray-700" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {brand && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              {brand}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 group-hover:text-primary-500 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={`${
                    star <= Math.round(ratings)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({numReviews || 0})
            </span>
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {isBestSeller && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                <Zap size={12} /> Best Seller
              </span>
            )}
            {isTrending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                <Zap size={12} /> Trending
              </span>
            )}
            {isNewArrival && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                New Product
              </span>
            )}
            {freeDelivery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                <Truck size={12} /> Free Delivery
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-2 mt-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{displayPrice?.toLocaleString('en-IN')}
            </span>
            {displayOriginal > displayPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ₹{displayOriginal?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-green-500">
                  {actualDiscount}% off
                </span>
              </>
            )}
          </div>

          {/* Stock Indicator */}
          {stock > 0 && stock <= 5 && (
            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
              <Clock size={12} />
              Only {stock} left in stock
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;