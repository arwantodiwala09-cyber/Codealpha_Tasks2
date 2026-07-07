import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const {
    cart,
    cartSummary,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const items = cart?.items || [];

  if (loading) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-lg">Loading your cart...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Browse products and add items to your cart.</p>
        <Link to="/products" className="btn btn-primary">
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-bold mb-8">My Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.product || item;
            return (
              <div key={item._id || product._id} className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
                <div className="flex items-center gap-4">
                  <img src={product.image?.url || product.image || 'https://via.placeholder.com/150'} alt={product.name} className="h-28 w-28 rounded-3xl object-cover" />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-500">{product.brand || product.category || ''}</p>
                    <p className="mt-2 text-lg font-semibold">₹{product.price?.toFixed?.(2) ?? product.price}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="min-w-[2.5rem] text-center text-lg font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="btn btn-outline" onClick={() => removeItem(item._id)}>
                      Remove
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => removeItem(item._id)}>
                      Save for later
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cartSummary.subtotal?.toFixed?.(2) ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>₹{cartSummary.totalDiscount?.toFixed?.(2) ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>GST</span>
              <span>₹{cartSummary.gstAmount?.toFixed?.(2) ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{cartSummary.deliveryCharges?.toFixed?.(2) ?? 0}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4 font-semibold">
              <span>Total</span>
              <span>₹{cartSummary.grandTotal?.toFixed?.(2) ?? 0}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link to="/checkout" className="btn btn-primary w-full">
              Proceed to Checkout
            </Link>
            <button type="button" className="btn btn-outline w-full" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
  
