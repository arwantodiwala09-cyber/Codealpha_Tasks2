import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Star, Minus, Plus, Truck, Shield, RefreshCw } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await productAPI.getById(id);
        setProduct(data.product);
        const relatedRes = await productAPI.getRelated(id);
        setRelated(relatedRes.data.products);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product not found</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-dark-700 aspect-square mb-4">
            <img
              src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  i === selectedImage ? 'border-primary-500' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-primary-600 font-medium mb-2">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} className={`${star <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                <span className="text-sm font-semibold text-green-500">{product.discount}% off</span>
              </>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
                <Plus size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-500">{product.stock} in stock</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => addToCart(product._id, quantity)} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product._id)} className={`p-3 rounded-xl border ${isInWishlist(product._id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 dark:border-dark-600 text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
              <Heart size={20} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="p-3 rounded-xl border border-gray-300 dark:border-dark-600 text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700">
              <Share2 size={20} />
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Truck size={18} className="text-primary-500" /> Free delivery on orders above ₹499
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <RefreshCw size={18} className="text-primary-500" /> 30-day easy returns
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Shield size={18} className="text-primary-500" /> Secure checkout
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title mb-6">Related Products</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;