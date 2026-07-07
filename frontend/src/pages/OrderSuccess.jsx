import { Link, useParams } from 'react-router-dom';

const OrderSuccess = () => {
  const { id } = useParams();

  return (
    <div className="page-container py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-gray-500 mb-6">Your order has been placed successfully.</p>
      {id && <p className="text-gray-700 mb-6">Order ID: <strong>{id}</strong></p>}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link to="/orders" className="btn btn-primary">
          View Order Status
        </Link>
        <Link to="/products" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
  
