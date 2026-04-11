import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Package,
  Search,
  ArrowRight,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  IndianRupee,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useGetMyOrdersQuery } from "../../features/order/orderApi";

const STATUS_FILTERS = [
  "All",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusStyles = {
  Processing:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800",
  Shipped:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800",
  Delivered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800",
  Cancelled:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800",
  "Partially Delivered":
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 ring-1 ring-teal-200 dark:ring-teal-800",
  "Partially Shipped":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800",
  "Partially Cancelled":
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 ring-1 ring-pink-200 dark:ring-pink-800",
};

const statusIcon = (status) => {
  if (status?.includes("Delivered")) return <CheckCircle2 size={14} />;
  if (status?.includes("Shipped")) return <Truck size={14} />;
  if (status?.includes("Cancelled")) return <XCircle size={14} />;
  return <Clock size={14} />;
};

const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
      statusStyles[status] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    {statusIcon(status)}
    {status}
  </span>
);

const getOverallStatus = (items = []) => {
  if (!items.length) return "Processing";
  const statuses = items.map((i) => i.orderStatus);
  const unique = [...new Set(statuses)];
  if (unique.length === 1) return unique[0];
  if (statuses.includes("Cancelled")) return "Partially Cancelled";
  if (statuses.includes("Delivered")) return "Partially Delivered";
  if (statuses.includes("Shipped")) return "Partially Shipped";
  return "Processing";
};

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}
      >
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>
    <div className="flex gap-3 mb-3">
      <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  </div>
);

function Orders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetMyOrdersQuery({ page });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  const stats = useMemo(() => {
    const base = {
      total: orders.length,
      processing: 0,
      shipped: 0,
      delivered: 0,
      spent: 0,
    };
    for (const order of orders) {
      const s = getOverallStatus(order.orderItems);
      if (s.includes("Processing")) base.processing += 1;
      if (s.includes("Shipped")) base.shipped += 1;
      if (s.includes("Delivered")) base.delivered += 1;
      base.spent += Number(order.totalPrice || 0);
    }
    return base;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const overall = getOverallStatus(order.orderItems);
      if (statusFilter !== "All" && !overall.includes(statusFilter))
        return false;
      if (!q) return true;
      const id = String(order._id || "").toLowerCase();
      const names = (order.orderItems || [])
        .map((i) => String(i.name || "").toLowerCase())
        .join(" ");
      return id.includes(q) || names.includes(q);
    });
  }, [orders, statusFilter, search]);

  const PageHeader = (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <ShoppingBag size={20} />
            </span>
            My Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track, review and manage everything you've bought on ShopEase.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {PageHeader}
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <div className="space-y-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {PageHeader}
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-rose-500" size={40} />
          <p className="text-rose-700 dark:text-rose-300 font-medium mb-4">
            {error?.data?.message || "Failed to load orders"}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium"
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {PageHeader}
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Package size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            You have no orders yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            When you place your first order, it'll appear here so you can track
            its journey from cart to doorstep.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/20"
          >
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {PageHeader}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Orders (page)"
          value={stats.total}
          icon={Package}
          accent="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
        />
        <StatCard
          label="Processing"
          value={stats.processing}
          icon={Clock}
          accent="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
        />
        <StatCard
          label="Shipped"
          value={stats.shipped}
          icon={Truck}
          accent="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          accent="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
        />
        <StatCard
          label="Spent (page)"
          value={`₹${stats.spent.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          icon={IndianRupee}
          accent="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or product name"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center">
            <Search size={22} />
          </div>
          <p className="text-gray-900 dark:text-white font-semibold">
            No matches
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Try a different search term or clear the status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const overallStatus = getOverallStatus(order.orderItems);
            const items = order.orderItems || [];
            const extraCount = Math.max(0, items.length - 3);

            return (
              <div
                key={order._id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                {/* Top strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Order ID
                      </p>
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        #{String(order._id).substring(0, 10).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        order.isPaid
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      }`}
                    >
                      <CreditCard size={11} />
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                    <StatusPill status={overallStatus} />
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {format(
                      new Date(order.createdAt),
                      "MMMM do, yyyy • hh:mm a"
                    )}
                  </p>

                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Thumbnails */}
                    <div className="flex items-center -space-x-3">
                      {items.slice(0, 3).map((item, i) => (
                        <div
                          key={item._id || i}
                          className="relative w-16 h-16 rounded-xl border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-sm"
                          style={{ zIndex: 10 - i }}
                        >
                          {item.product?.images?.[0]?.imageUrl ? (
                            <img
                              src={item.product.images[0].imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="relative w-16 h-16 rounded-xl border-2 border-white dark:border-gray-900 bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                          +{extraCount}
                        </div>
                      )}
                    </div>

                    {/* Item summary */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {items[0]?.name || "—"}
                      </p>
                      {items.length > 1 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          + {items.length - 1} more item
                          {items.length - 1 > 1 ? "s" : ""}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {items.reduce(
                          (s, i) => s + (i.quantity || 0),
                          0
                        )}{" "}
                        unit
                        {items.reduce(
                          (s, i) => s + (i.quantity || 0),
                          0
                        ) > 1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="md:text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{Number(order.totalPrice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {items.length} item{items.length > 1 ? "s" : ""}
                  </p>
                  <Link
                    to={`/order/${order._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all group-hover:translate-x-0.5"
                  >
                    View Details
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const active = n === page;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;
