import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Package,
  Search,
  ArrowRight,
  User,
  MapPin,
  Phone,
  CreditCard,
  IndianRupee,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { useGetSellerOrdersQuery } from "../../features/order/sellerOrderApi";

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
  switch (status) {
    case "Delivered":
    case "Partially Delivered":
      return <CheckCircle2 size={14} />;
    case "Shipped":
    case "Partially Shipped":
      return <Truck size={14} />;
    case "Cancelled":
    case "Partially Cancelled":
      return <XCircle size={14} />;
    default:
      return <Clock size={14} />;
  }
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
  <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
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
    <div className="grid md:grid-cols-3 gap-4">
      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
    </div>
  </div>
);

function SellerOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetSellerOrdersQuery({ page });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  const stats = useMemo(() => {
    const base = {
      total: orders.length,
      processing: 0,
      shipped: 0,
      delivered: 0,
      revenue: 0,
    };
    for (const order of orders) {
      const s = getOverallStatus(order.items);
      if (s.includes("Processing")) base.processing += 1;
      if (s.includes("Shipped")) base.shipped += 1;
      if (s.includes("Delivered")) base.delivered += 1;
      base.revenue += Number(order.totalPrice || 0);
    }
    return base;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const overall = getOverallStatus(order.items);
      if (statusFilter !== "All" && !overall.includes(statusFilter)) return false;
      if (!q) return true;
      const id = String(order._id || "").toLowerCase();
      const buyer = String(order.order?.user?.name || "").toLowerCase();
      const city = String(order.order?.shippingAddress?.city || "").toLowerCase();
      return id.includes(q) || buyer.includes(q) || city.includes(q);
    });
  }, [orders, statusFilter, search]);

  const PageHeader = (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
              <ShoppingBag size={20} />
            </span>
            Manage Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and fulfil orders placed against your catalogue.
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
      <div className="max-w-7xl mx-auto">
        {PageHeader}
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
      <div className="max-w-7xl mx-auto">
        {PageHeader}
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-rose-500" size={40} />
          <p className="text-rose-700 dark:text-rose-300 font-medium mb-4">
            {error?.data?.message || "Failed to load seller orders"}
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

  return (
    <div className="max-w-7xl mx-auto">
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
          label="Revenue (page)"
          value={`₹${stats.revenue.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          icon={IndianRupee}
          accent="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300"
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
              placeholder="Search by order ID, buyer name or city"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center">
            <Package size={28} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {orders.length === 0 ? "No orders yet" : "No matches"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {orders.length === 0
              ? "Orders will appear here the moment a buyer checks out with your products."
              : "Try a different search term or clear the status filter."}
          </p>
          {orders.length === 0 ? (
            <Link
              to="/seller/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
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
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const overallStatus = getOverallStatus(order.items);
            const firstItem = order.items?.[0];
            const extraCount = Math.max(0, (order.items?.length || 0) - 1);
            const addr = order.order?.shippingAddress;

            return (
              <div
                key={order._id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all"
              >
                {/* Top strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center">
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
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {format(new Date(order.createdAt), "MMM dd, yyyy • hh:mm a")}
                    </p>
                    <StatusPill status={overallStatus} />
                  </div>
                </div>

                <div className="p-5 grid md:grid-cols-12 gap-5">
                  {/* Product preview */}
                  <div className="md:col-span-5 flex gap-3">
                    <div className="relative shrink-0">
                      {firstItem?.product?.images?.[0]?.imageUrl ? (
                        <img
                          src={firstItem.product.images[0].imageUrl}
                          alt={firstItem.name}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <Package size={24} />
                        </div>
                      )}
                      {extraCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {firstItem?.name || "—"}
                      </p>
                      {firstItem?.product?.brand && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {firstItem.product.brand}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span>₹{Number(firstItem?.price || 0).toFixed(2)}</span>
                        <span>×</span>
                        <span>{firstItem?.quantity || 0}</span>
                      </div>
                      {extraCount > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                          +{extraCount} more item{extraCount > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Buyer */}
                  <div className="md:col-span-4 md:border-l md:pl-5 md:border-gray-100 md:dark:border-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Buyer
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <p className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <User size={14} className="text-gray-400" />
                        <span className="truncate">
                          {order.order?.user?.name || "Unknown"}
                        </span>
                      </p>
                      {addr && (
                        <>
                          <p className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-xs">
                            <MapPin
                              size={14}
                              className="text-gray-400 mt-0.5 shrink-0"
                            />
                            <span className="line-clamp-2">
                              {addr.flatOrBuilding}, {addr.locality}, {addr.city},{" "}
                              {addr.state} - {addr.pincode}
                            </span>
                          </p>
                          <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                            <Phone size={14} className="text-gray-400" />
                            {addr.mobileNumber}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="md:col-span-3 md:border-l md:pl-5 md:border-gray-100 md:dark:border-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Summary
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1.5">
                          <CreditCard size={13} /> Payment
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            order.order?.isPaid
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}
                        >
                          {order.order?.isPaid ? "Paid" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Method</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {order.order?.paymentMethod || "—"}
                        </span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{Number(order.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    {order.items.length} item
                    {order.items.length > 1 ? "s" : ""}
                  </p>
                  <Link
                    to={`/seller/order/${order._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold shadow-md shadow-amber-500/20 transition-all group-hover:translate-x-0.5"
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
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
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

export default SellerOrders;
