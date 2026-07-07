import { ShoppingCart, Package, Users, TrendingUp, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { icon: DollarSign, label: 'Total Revenue', value: '₹0', color: 'bg-green-500' },
    { icon: ShoppingCart, label: 'Total Orders', value: '0', color: 'bg-blue-500' },
    { icon: Package, label: 'Total Products', value: '0', color: 'bg-purple-500' },
    { icon: Users, label: 'Total Users', value: '0', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Welcome to Admin Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Start by adding products and managing your store. Use the sidebar to navigate.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;