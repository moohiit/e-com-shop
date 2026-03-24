import { useState } from "react";
import { useAdminGetDashboardDataQuery } from "../../features/admin/adminApi";
import { Loader2, Users, Package, FolderTree, ShoppingCart, IndianRupee } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

export default function AdminDashboard() {
  const [filter, setFilter] = useState("all");
  const { data: response, error, isLoading } = useAdminGetDashboardDataQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading dashboard data
      </div>
    );
  }

  const data = response?.data || {};
  const currentData = data[filter] || {};
  const charts = data.charts || {};

  const cards = [
    { title: "Users", value: currentData.users || 0, icon: Users, color: "bg-blue-500" },
    { title: "Products", value: currentData.products || 0, icon: Package, color: "bg-green-500" },
    { title: "Categories", value: currentData.categories || 0, icon: FolderTree, color: "bg-yellow-500" },
    { title: "Orders", value: currentData.orders || 0, icon: ShoppingCart, color: "bg-purple-500" },
    { title: "Revenue", value: `₹${(currentData.revenue || 0).toLocaleString()}`, icon: IndianRupee, color: "bg-pink-500" },
  ];

  const filterLabels = {
    today: "Today",
    month: "This Month",
    year: "This Year",
    all: "All Time",
  };

  const revenueTrend = (charts.revenueTrend || []).map((d) => ({
    date: d._id.substring(5),
    revenue: d.revenue,
    orders: d.orders,
  }));

  const userGrowth = (charts.userGrowth || []).map((d) => ({
    date: d._id.substring(5),
    users: d.count,
  }));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>

      {/* Filter Buttons */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(filterLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`${card.color} text-white rounded-xl p-5 shadow-lg hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <Icon size={28} className="opacity-80" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            Revenue & Orders (Last 7 Days)
          </h2>
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [`₹${value.toLocaleString()}`, "Revenue"]
                      : [value, "Orders"]
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar yAxisId="right" dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No revenue data yet</p>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            New Users (Last 7 Days)
          </h2>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No user growth data yet</p>
          )}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Top Selling Products
        </h2>
        {charts.topProducts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="pb-3 text-sm text-gray-500">#</th>
                  <th className="pb-3 text-sm text-gray-500">Product</th>
                  <th className="pb-3 text-sm text-gray-500 text-right">Units Sold</th>
                  <th className="pb-3 text-sm text-gray-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {charts.topProducts.map((p, i) => (
                  <tr
                    key={p._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 text-sm">{i + 1}</td>
                    <td className="py-3">{p.name}</td>
                    <td className="py-3 text-right">{p.totalSold}</td>
                    <td className="py-3 text-right">₹{p.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales data yet</p>
        )}
      </div>
    </div>
  );
}
