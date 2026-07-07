import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartSummary, loading } = useCart();
  const items = cart?.items || [];
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    landmark: '',
    addressType: 'home',
  });
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [billingSame, setBillingSame] = useState(true);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const hasValidAddress = () => {
    return [
      'fullName',
      'phone',
      'address',
      'city',
      'state',
      'zipCode',
      'country',
    ].every((field) => shippingAddress[field]?.trim());
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!hasValidAddress()) {
      toast.error('Please fill in all required shipping fields.');
      return;
    }

    if (!items.length) {
      toast.error('Your cart is empty.');
      return;
    }

    const orderItems = items.map((item) => ({
      product: item.product?._id || item.product,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    }));

    const payload = {
      orderItems,
      shippingAddress,
      billingAddress: billingSame ? shippingAddress : billingAddress,
      paymentMethod: 'wallet',
    };

    try {
      setProcessing(true);
      const { data } = await orderAPI.createOrder(payload);
      toast.success('Order placed successfully');
      navigate(`/order-success/${data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-lg">Preparing checkout...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No items to checkout</h1>
        <p className="text-gray-500 mb-6">Add products to your cart before checkout.</p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <form onSubmit={handlePlaceOrder} className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <p className="text-gray-500 mb-4">Enter your shipping details, then place a fake payment order.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</span>
              <input
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleShippingChange}
                className="input-field mt-2"
                placeholder="John Doe"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
              <input
                name="phone"
                value={shippingAddress.phone}
                onChange={handleShippingChange}
                className="input-field mt-2"
                placeholder="9876543210"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</span>
            <input
              name="address"
              value={shippingAddress.address}
              onChange={handleShippingChange}
              className="input-field mt-2"
              placeholder="123 Main Street"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">City</span>
              <input
                name="city"
                value={shippingAddress.city}
                onChange={handleShippingChange}
                className="input-field mt-2"
                placeholder="Mumbai"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">State</span>
              <input
                name="state"
                value={shippingAddress.state}
                onChange={handleShippingChange}
                className="input-field mt-2"
                placeholder="Maharashtra"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</span>
              <input
                name="zipCode"
                value={shippingAddress.zipCode}
                onChange={handleShippingChange}
                className="input-field mt-2"
                placeholder="400001"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</span>
              <input
                name="country"
                value={shippingAddress.country}
                onChange={handleShippingChange}
                className="input-field mt-2"
                placeholder="India"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Landmark</span>
            <input
              name="landmark"
              value={shippingAddress.landmark}
              onChange={handleShippingChange}
              className="input-field mt-2"
              placeholder="Near city mall"
            />
          </label>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="billingSame"
              checked={billingSame}
              onChange={() => setBillingSame((prev) => !prev)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="billingSame" className="text-sm text-gray-600 dark:text-gray-300">
              Billing address same as shipping
            </label>
          </div>

          {!billingSame && (
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-700 dark:bg-dark-900">
              <h3 className="text-lg font-semibold">Billing Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</span>
                  <input
                    name="fullName"
                    value={billingAddress.fullName}
                    onChange={handleBillingChange}
                    className="input-field mt-2"
                    placeholder="John Doe"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
                  <input
                    name="phone"
                    value={billingAddress.phone}
                    onChange={handleBillingChange}
                    className="input-field mt-2"
                    placeholder="9876543210"
                    required
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</span>
                <input
                  name="address"
                  value={billingAddress.address}
                  onChange={handleBillingChange}
                  className="input-field mt-2"
                  placeholder="123 Main Street"
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">City</span>
                  <input
                    name="city"
                    value={billingAddress.city}
                    onChange={handleBillingChange}
                    className="input-field mt-2"
                    placeholder="Mumbai"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">State</span>
                  <input
                    name="state"
                    value={billingAddress.state}
                    onChange={handleBillingChange}
                    className="input-field mt-2"
                    placeholder="Maharashtra"
                    required
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</span>
                  <input
                    name="zipCode"
                    value={billingAddress.zipCode}
                    onChange={handleBillingChange}
                    className="input-field mt-2"
                    placeholder="400001"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</span>
                  <input
                    name="country"
                    value={billingAddress.country}
                    onChange={handleBillingChange}
                    className="input-field mt-2"
                    placeholder="India"
                    required
                  />
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={processing}>
            {processing ? 'Placing order...' : 'Pay with Fake Wallet'}
          </button>
          <p className="mt-3 text-sm text-gray-500">This uses a fake payment method so you can create an order without real integration.</p>
        </form>

        <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cartSummary.subtotal?.toFixed?.(2) ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{cartSummary.deliveryCharges?.toFixed?.(2) ?? 0}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-4 border-t border-gray-200 dark:border-dark-700">
              <span>Total</span>
              <span>₹{cartSummary.grandTotal?.toFixed?.(2) ?? 0}</span>
            </div>
          </div>
          <div className="mt-6 rounded-3xl bg-primary-50 p-4 text-sm text-primary-700 dark:bg-primary-900/20 dark:text-primary-100">
            <p className="font-semibold">Fake Payment Notice</p>
            <p className="mt-2">This checkout simulates a paid order using a fake wallet method, so you can test order creation immediately.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
  
