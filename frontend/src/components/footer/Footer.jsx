import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
  CreditCard,
  Shield,
  Truck,
  RefreshCw,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: {
      title: 'Shop',
      links: [
        { name: 'Today\'s Deals', href: '/products?deals=true' },
        { name: 'New Arrivals', href: '/products?sort=-createdAt' },
        { name: 'Best Sellers', href: '/products?bestsellers=true' },
        { name: 'Flash Sales', href: '/products?flash=true' },
        { name: 'Gift Cards', href: '/products?gifts=true' },
        { name: 'Clearance', href: '/products?discount=50' },
      ],
    },
    help: {
      title: 'Help & Support',
      links: [
        { name: 'Help Center', href: '/faq' },
        { name: 'Shipping Info', href: '/faq#shipping' },
        { name: 'Returns & Exchanges', href: '/faq#returns' },
        { name: 'Size Guide', href: '/faq#size-guide' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Track Order', href: '/orders' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/about#careers' },
        { name: 'Press', href: '/about#press' },
        { name: 'Affiliates', href: '/about#affiliates' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ],
    },
  };

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: CreditCard, title: 'Best Prices', desc: 'Price match guarantee' },
  ];

  return (
    <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700">
      {/* Features Bar */}
      <div className="border-b border-gray-200 dark:border-dark-700">
        <div className="page-container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-700"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{feature.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <ShoppingCart size={22} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold text-gradient">ShopHub</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              Your premium destination for quality products at unbeatable prices. 
              We curate the best brands and products to bring you an exceptional 
              shopping experience with fast delivery and top-notch customer service.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} className="text-primary-500" />
                <span>123 Business Park, Mumbai, India 400001</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={16} className="text-primary-500" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail size={16} className="text-primary-500" />
                <span>support@shophub.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
                { icon: Twitter, href: '#', color: 'hover:bg-blue-400' },
                { icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
                { icon: Youtube, href: '#', color: 'hover:bg-red-600' },
              ].map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  className={`w-10 h-10 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 ${social.color} hover:text-white transition-all duration-200`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group"
                    >
                      <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-10">
        <div className="page-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">Subscribe to Our Newsletter</h3>
              <p className="text-primary-200 text-sm">Get the latest deals and offers straight to your inbox</p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 outline-none focus:bg-white/20 transition-all min-w-[280px]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-dark-700">
        <div className="page-container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} ShopHub. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8" />
              <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-8" />
              <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="RuPay" className="h-8" />
              <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;