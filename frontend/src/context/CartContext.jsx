import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], savedForLater: [] });
  const [cartSummary, setCartSummary] = useState({
    itemsPrice: 0,
    totalDiscount: 0,
    gstAmount: 0,
    platformFee: 3,
    packagingFee: 0,
    deliveryCharges: 40,
    couponDiscount: 0,
    totalSavings: 0,
    subtotal: 0,
    grandTotal: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      setCart(data.cart);
      setCartSummary(data.cartSummary);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, color, size) => {
    try {
      const { data } = await cartAPI.addToCart({ productId, quantity, color, size });
      setCart(data.cart);
      setCartSummary(data.cartSummary);
      toast.success(data.message || 'Added to cart');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      return { success: false };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await cartAPI.updateItem(itemId, { quantity });
      setCart(data.cart);
      setCartSummary(data.cartSummary);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
      return { success: false };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await cartAPI.removeItem(itemId);
      setCart(data.cart);
      setCartSummary(data.cartSummary);
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      toast.error('Failed to remove item');
      return { success: false };
    }
  };

  const moveToWishlist = async (itemId) => {
    try {
      await cartAPI.moveToWishlist(itemId);
      await fetchCart();
      toast.success('Moved to wishlist');
      return { success: true };
    } catch (error) {
      toast.error('Failed to move item');
      return { success: false };
    }
  };

  const saveForLater = async (itemId) => {
    try {
      const { data } = await cartAPI.saveForLater(itemId);
      setCart(data.cart);
      toast.success('Saved for later');
      return { success: true };
    } catch (error) {
      toast.error('Failed to save item');
      return { success: false };
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await cartAPI.applyCoupon(code);
      setCartSummary((prev) => ({
        ...prev,
        couponDiscount: data.discount,
        grandTotal: prev.subtotal - data.discount,
        totalSavings: prev.totalSavings + data.discount,
      }));
      toast.success(data.message);
      return { success: true, discount: data.discount };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
      return { success: false };
    }
  };

  const removeCoupon = async () => {
    try {
      await cartAPI.removeCoupon();
      setCartSummary((prev) => ({
        ...prev,
        couponDiscount: 0,
        grandTotal: prev.subtotal,
        totalSavings: prev.totalSavings - prev.couponDiscount,
      }));
      toast.success('Coupon removed');
      return { success: true };
    } catch (error) {
      toast.error('Failed to remove coupon');
      return { success: false };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], savedForLater: [] });
      setCartSummary({
        itemsPrice: 0, totalDiscount: 0, gstAmount: 0, platformFee: 3,
        packagingFee: 0, deliveryCharges: 40, couponDiscount: 0,
        totalSavings: 0, subtotal: 0, grandTotal: 0, itemCount: 0,
      });
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    cart,
    cartSummary,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    moveToWishlist,
    saveForLater,
    applyCoupon,
    removeCoupon,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;