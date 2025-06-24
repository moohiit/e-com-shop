import { useState } from 'react';
import { useAdminGetDashboardDataQuery } from '../../features/admin/adminApi';

export default function AdminDashboard() {
  const [filter, setFilter] = useState('today');

  const { data: response, error, isLoading } = useAdminGetDashboardDataQuery();

  if (isLoading) return <div className="p-6 text-center text-xl">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error loading dashboard data: {error.message}</div>;

  const data = response?.data || {};
  const currentData = data[filter];

  const cards = [
    { title: 'Users', value: currentData.users || 0, color: 'bg-blue-500', darkColor: 'dark:bg-blue-700' },
    { title: 'Products', value: currentData.products || 0, color: 'bg-green-500', darkColor: 'dark:bg-green-700' },
    { title: 'Categories', value: currentData.categories || 0, color: 'bg-yellow-500', darkColor: 'dark:bg-yellow-700' },
    { title: 'Orders', value: currentData.orders || 0, color: 'bg-purple-500', darkColor: 'dark:bg-purple-700' },
    { title: 'Revenue', value: `₹${currentData.revenue || 0}`, color: 'bg-pink-500', darkColor: 'dark:bg-pink-700' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Admin Dashboard</h1>

      {/* Filter Options */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {['today', 'month', 'year', 'all'].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded-full ${
              filter === option
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            } hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors`}
          >
            {option === 'today'
              ? 'Today'
              : option === 'month'
              ? 'This Month'
              : option === 'year'
              ? 'This Year'
              : 'All Time'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`p-6 rounded-xl shadow text-white ${card.color} ${card.darkColor} hover:scale-105 transform transition-transform duration-300`}
          >
            <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
            <p className="text-4xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
