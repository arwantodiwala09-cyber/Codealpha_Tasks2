import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const items = wishlist?.products || [];

  if (loading) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-lg">Loading your wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-6">Save products you love and view them later.</p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => {
          const product = item.product || item;
          return (
            <div key={product._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
              <div className="flex items-center gap-4">
                <img src={product.image?.url || 'https://via.placeholder.com/120'} alt={product.name} className="h-24 w-24 rounded-3xl object-cover" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-gray-500">₹{product.price?.toFixed?.(2) ?? product.price}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/products/${product._id}`} className="btn btn-outline">
                  View Product
                </Link>
                <button type="button" className="btn btn-secondary" onClick={() => removeFromWishlist(product._id)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
  
