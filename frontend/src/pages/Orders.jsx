import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await orderAPI.getMyOrders();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {loading ? (
        <div className="text-center py-20">
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">You have no orders yet.</p>
          <Link to="/products" className="btn btn-primary mt-6 inline-block">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                  <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-x-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{order.status}</span>
                  <Link to={`/orders/${order._id}`} className="text-primary-600 hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
  
