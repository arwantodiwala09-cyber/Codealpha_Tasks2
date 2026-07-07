import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await wishlistAPI.getWishlist();
      setWishlist(data.wishlist);
      setWishlistIds(new Set(data.wishlist.products.map((p) => p.product?._id)));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    try {
      await wishlistAPI.addToWishlist(productId);
      setWishlistIds((prev) => new Set([...prev, productId]));
      toast.success('Added to wishlist');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
      return { success: false };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      toast.success('Removed from wishlist');
      return { success: true };
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      return { success: false };
    }
  };

  const toggleWishlist = async (productId) => {
    if (wishlistIds.has(productId)) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  const value = {
    wishlist,
    wishlistIds,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export default WishlistContext;