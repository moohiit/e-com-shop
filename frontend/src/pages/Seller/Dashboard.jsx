import { useGetSellerDashboardQuery } from "../../features/order/sellerOrderApi";
import { useGetLowStockProductsQuery } from "../../features/products/productApiSlice";
import { Link } from "react-router-dom";
import { Loader2, Package, IndianRupee, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

function Dashboard() {
  const { data, isLoading, isError } = useGetSellerDashboardQuery();
  const { data: lowStockData } = useGetLowStockProductsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center text-red-500 mt-8">
        Failed to load dashboard data
      </div>
    );
  }

  const d = data.data;
  const { statusCounts, charts } = d;

  const statCards = [
    { label: "Total Orders", value: d.totalOrders, icon: ShoppingCart, color: "bg-blue-500" },
    { label: "Total Revenue", value: `₹${d.totalRevenue.toFixed(2)}`, icon: IndianRupee, color: "bg-green-500" },
    { label: "Paid Revenue", value: `₹${d.paidRevenue.toFixed(2)}`, icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Products", value: d.totalProducts, icon: Package, color: "bg-purple-500" },
  ];

  const statusData = [
    { name: "Processing", value: statusCounts.processing },
    { name: "Shipped", value: statusCounts.shipped },
    { name: "Delivered", value: statusCounts.delivered },
    { name: "Cancelled", value: statusCounts.cancelled },
  ].filter((s) => s.value > 0);

  const revenueTrend = (charts.revenueTrend || []).map((d) => ({
    date: d._id.substring(5), // MM-DD
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold">Seller Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`${card.color} text-white rounded-xl p-5 shadow-lg hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <Icon size={32} className="opacity-80" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue (Last 7 Days)</h2>
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue" ? [`₹${value}`, "Revenue"] : [value, "Orders"]
                  }
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No revenue data yet</p>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status Breakdown</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No orders yet</p>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockData?.products?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Low Stock Alert ({lowStockData.products.length})
              </h2>
            </div>
            <Link
              to="/seller/inventory"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage Inventory
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="pb-2 text-sm text-gray-500">Product</th>
                  <th className="pb-2 text-sm text-gray-500 text-right">Stock</th>
                  <th className="pb-2 text-sm text-gray-500 text-right">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockData.products.slice(0, 5).map((p) => (
                  <tr key={p._id} className="border-b dark:border-gray-700">
                    <td className="py-2">{p.name}</td>
                    <td className={`py-2 text-right font-semibold ${p.stock === 0 ? "text-red-600" : "text-yellow-600"}`}>
                      {p.stock}
                    </td>
                    <td className="py-2 text-right text-gray-500">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
        {charts.topProducts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="pb-3 text-sm text-gray-500">#</th>
                  <th className="pb-3 text-sm text-gray-500">Product</th>
                  <th className="pb-3 text-sm text-gray-500 text-right">Sold</th>
                  <th className="pb-3 text-sm text-gray-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {charts.topProducts.map((p, i) => (
                  <tr key={p._id} className="border-b dark:border-gray-700">
                    <td className="py-3 text-sm">{i + 1}</td>
                    <td className="py-3">{p.name}</td>
                    <td className="py-3 text-right">{p.totalSold}</td>
                    <td className="py-3 text-right">₹{p.totalRevenue.toFixed(2)}</td>
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

export default Dashboard;
