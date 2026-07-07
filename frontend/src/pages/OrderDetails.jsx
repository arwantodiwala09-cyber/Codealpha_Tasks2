import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getOrder(id);
        setOrder(data.order);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container py-20 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/orders" className="btn btn-primary mt-6 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold mb-2">Order Number</h2>
            <p>{order._id}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <p>{order.status}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Total</h2>
            <p>₹{order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Placed</h2>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.orderItems?.map((item) => (
              <div key={item._id || item.product} className="flex items-center gap-4 rounded-3xl border border-gray-200 p-4 dark:border-dark-700">
                <img src={item.image || 'https://via.placeholder.com/120'} alt={item.name} className="h-20 w-20 rounded-3xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{item.price?.toFixed?.(2) ?? item.price}</p>
              </div>
            ))}
          </div>
        </div>

        <Link to="/orders" className="btn btn-primary mt-8 inline-block">
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
  
