import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  LogOut,
  Settings,
  Package,
  Star,
  TrendingUp,
  Zap,
  Gift,
  Clock,
  Truck,
  Headphones,
  ChevronRight,
  Mic,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { productAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartSummary } = useCart();
  const { wishlistIds } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const fetchCategories = async () => {
      try {
        const { data } = await categoryAPI.getTree();
        setCategories(data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const { data } = await productAPI.search(searchQuery);
          setSearchResults(data.products);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceSearch(false);
        navigate(`/products?q=${encodeURIComponent(transcript)}`);
      };

      recognition.onerror = () => {
        setIsVoiceSearch(false);
        toast.error('Voice search failed');
      };

      recognition.start();
      setIsVoiceSearch(true);
    } else {
      toast.error('Voice search not supported');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Today\'s Deals', href: '/products?deals=true', icon: Zap },
    { name: 'Flash Sale', href: '/products?flash=true', icon: Clock },
    { name: 'New Arrivals', href: '/products?sort=-createdAt', icon: TrendingUp },
    { name: 'Best Sellers', href: '/products?bestsellers=true', icon: Star },
    { name: 'Gift Cards', href: '/products?gifts=true', icon: Gift },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-gradient-to-r from-primary-600 to-primary-800 text-white text-xs py-1.5">
        <div className="page-container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Truck size={14} />
              Free delivery on orders above ₹499
            </span>
            <span className="flex items-center gap-1">
              <Headphones size={14} />
              24/7 Customer Support
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-primary-200 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary-200 transition-colors">Contact</Link>
            <Link to="/faq" className="hover:text-primary-200 transition-colors">FAQ</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-dark-800/95 backdrop-blur-md shadow-lg'
            : 'bg-white dark:bg-dark-800'
        } ${isScrolled ? 'top-0' : 'top-[34px]'}`}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-gradient hidden sm:block">
                ShopHub
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for products, brands, categories..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full pl-12 pr-24 py-2.5 bg-gray-100 dark:bg-dark-700 border-2 border-transparent focus:border-primary-500 rounded-xl outline-none transition-all text-sm dark:text-white"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      className={`p-2 rounded-lg transition-colors ${
                        isVoiceSearch
                          ? 'bg-primary-100 text-primary-600 animate-pulse'
                          : 'hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-400'
                      }`}
                    >
                      <Mic size={16} />
                    </button>
                    <button
                      type="submit"
                      className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>

                {/* Search Suggestions */}
                <AnimatePresence>
                  {isSearchOpen && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {searchResults.slice(0, 8).map((product) => (
                          <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-xl transition-colors"
                          >
                            <img
                              src={product.images?.[0]?.url || '/placeholder.png'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-primary-600 font-semibold">
                                ₹{product.price}
                                {product.discount > 0 && (
                                  <span className="text-green-500 ml-2">{product.discount}% off</span>
                                )}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Heart size={20} />
                {wishlistIds.size > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {wishlistIds.size}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <ShoppingCart size={20} />
                {cartSummary.itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartSummary.itemCount > 99 ? '99+' : cartSummary.itemCount}
                  </span>
                )}
              </Link>

              {/* Profile / Auth */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <img
                      src={user?.avatar?.url || '/default-avatar.png'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="hidden md:block text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={16} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                          <div className="flex items-center gap-3">
                            <img
                              src={user?.avatar?.url || '/default-avatar.png'}
                              alt={user?.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                              <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          {[
                            { icon: User, label: 'My Profile', href: '/profile' },
                            { icon: Package, label: 'My Orders', href: '/orders' },
                            { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                            { icon: Star, label: 'Rewards', href: '/profile?tab=rewards' },
                            { icon: Settings, label: 'Settings', href: '/profile?tab=settings' },
                          ].map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-xl transition-colors"
                            >
                              <item.icon size={18} />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          ))}

                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
                            >
                              <Settings size={18} />
                              <span className="text-sm font-medium">Admin Dashboard</span>
                            </Link>
                          )}
                        </div>

                        <div className="p-2 border-t border-gray-200 dark:border-dark-700">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full"
                          >
                            <LogOut size={18} />
                            <span className="text-sm">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Nav Links */}
        <div className="hidden lg:block border-t border-gray-200 dark:border-dark-700">
          <div className="page-container">
            <div className="flex items-center gap-1 h-10">
              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 h-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                  <Menu size={16} />
                  Categories
                  <ChevronDown size={14} />
                </button>

                {/* Mega Menu */}
                <div className="absolute top-full left-0 mt-1 w-[800px] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-6">
                  <div className="grid grid-cols-4 gap-6">
                    {categories.map((category) => (
                      <div key={category._id}>
                        <Link
                          to={`/products?category=${category._id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors text-sm"
                        >
                          {category.name}
                        </Link>
                        {category.subcategories?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {category.subcategories.map((sub) => (
                              <li key={sub._id}>
                                <Link
                                  to={`/products?category=${sub._id}`}
                                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center gap-1.5 px-3 h-full text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <link.icon size={14} />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-dark-800 shadow-2xl overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                      <ShoppingCart size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-gradient">ShopHub</span>
                  </Link>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X size={24} className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="mb-6">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-dark-700 rounded-xl outline-none text-sm dark:text-white"
                    />
                  </div>
                </form>

                {/* Mobile Categories */}
                <div className="space-y-1 mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/products?category=${category._id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                    >
                      <span className="text-sm">{category.name}</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                  ))}
                </div>

                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shop</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                    >
                      <link.icon size={18} className="text-primary-500" />
                      <span className="text-sm">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;