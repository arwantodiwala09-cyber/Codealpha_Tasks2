import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Clock,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          featuredRes,
          trendingRes,
          bestSellersRes,
          newArrivalsRes,
          flashSalesRes,
          categoriesRes,
        ] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getTrending(),
          productAPI.getBestSellers(),
          productAPI.getNewArrivals(),
          productAPI.getFlashSales(),
          categoryAPI.getTree(),
        ]);

        setFeaturedProducts(featuredRes.data.products);
        setTrendingProducts(trendingRes.data.products);
        setBestSellers(bestSellersRes.data.products);
        setNewArrivals(newArrivalsRes.data.products);
        setFlashSales(flashSalesRes.data.products);
        setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroSlides = [
    {
      title: 'Summer Sale',
      subtitle: 'Up to 70% off on top brands',
      cta: 'Shop Now',
      bg: 'from-blue-600 to-purple-700',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200',
    },
    {
      title: 'New Arrivals',
      subtitle: 'Discover the latest trends',
      cta: 'Explore',
      bg: 'from-emerald-600 to-teal-700',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    },
    {
      title: 'Tech Deals',
      subtitle: 'Premium electronics at best prices',
      cta: 'Shop Tech',
      bg: 'from-orange-600 to-red-700',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <HeroSlider slides={heroSlides} />

      {/* Categories */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {categories.slice(0, 8).map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/products?category=${category._id}`}
                className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-dark-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden border border-white/70 shadow-sm">
                  {category.image?.url ? (
                    <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary-700 dark:text-primary-200">{category.name[0] || 'C'}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {flashSales.length > 0 && (
        <section className="page-container">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Flash Sale</h2>
                  <p className="text-white/80 text-sm">Limited time offers</p>
                </div>
              </div>
              <CountdownTimer endDate={flashSales[0]?.flashSaleEnds} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSales.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products?featured=true" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {featuredProducts.slice(0, 10).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Banner Strip */}
      <section className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 group cursor-pointer"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Premium Collection</h3>
              <p className="text-white/80 mb-4">Starting at just ₹499</p>
              <Link to="/products?category=premium" className="inline-flex items-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 group cursor-pointer"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Free Delivery</h3>
              <p className="text-white/80 mb-4">On orders above ₹499</p>
              <Link to="/products" className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                Explore <ArrowRight size={16} />
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-primary-500" />
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <Link to="/products?sort=-createdAt" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {newArrivals.slice(0, 10).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={{ ...product, isNewArrival: true }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star size={24} className="text-yellow-500" />
            <h2 className="section-title">Best Sellers</h2>
          </div>
          <Link to="/products?bestsellers=true" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {bestSellers.slice(0, 10).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={{ ...product, isBestSeller: true }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-orange-500" />
            <h2 className="section-title">Trending Now</h2>
          </div>
          <Link to="/products?trending=true" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {trendingProducts.slice(0, 10).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={{ ...product, isTrending: true }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="page-container">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 md:p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stay in the Loop</h2>
            <p className="text-primary-200 mb-6">Subscribe to get special offers, free giveaways, and exclusive deals.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 outline-none focus:bg-white/20 transition-all"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Hero Slider Component
const HeroSlider = ({ slides }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative overflow-hidden h-[300px] md:h-[450px] lg:h-[550px]">
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: index === current ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}
          style={{ display: index === current ? 'block' : 'none' }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="page-container h-full flex items-center relative z-10">
            <div className="max-w-lg">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/80 text-lg md:text-xl mb-6"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  {slide.cta} <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Navigation */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-white" />
      {Object.keys(timeLeft).length > 0 && (
        <div className="flex items-center gap-1 text-white font-bold">
          <span className="bg-white/20 px-2 py-1 rounded text-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span>:</span>
          <span className="bg-white/20 px-2 py-1 rounded text-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span>:</span>
          <span className="bg-white/20 px-2 py-1 rounded text-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      )}
    </div>
  );
};

export default Home;