import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  IndianRupee,
  ShoppingBag,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Tag,
  Calendar,
} from "lucide-react";
import {
  useGetSellerOrderByIdQuery,
  useUpdateSellerOrderItemStatusMutation,
  useCancelSellerOrderItemMutation,
} from "../../features/order/sellerOrderApi";

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

const overallStatusOf = (items = []) => {
  if (!items.length) return "Processing";
  const statuses = items.map((i) => i.orderStatus);
  const unique = [...new Set(statuses)];
  if (unique.length === 1) return unique[0];
  if (statuses.includes("Cancelled")) return "Partially Cancelled";
  if (statuses.includes("Delivered")) return "Partially Delivered";
  if (statuses.includes("Shipped")) return "Partially Shipped";
  return "Processing";
};

const TRACKER_STEPS = ["Processing", "Shipped", "Delivered"];
const stepIndexFor = (status) => {
  if (status?.includes("Delivered")) return 2;
  if (status?.includes("Shipped")) return 1;
  if (status?.includes("Cancelled")) return -1;
  return 0;
};

const StatusTracker = ({ status }) => {
  const idx = stepIndexFor(status);
  const cancelled = status?.includes("Cancelled");
  return (
    <div className="flex items-center gap-2">
      {TRACKER_STEPS.map((step, i) => {
        const done = !cancelled && i <= idx;
        const active = !cancelled && i === idx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                done
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                  : cancelled
                  ? "bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  done ? "bg-white/25" : "bg-white dark:bg-gray-700"
                }`}
              >
                {i + 1}
              </span>
              {step}
              {active && (
                <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              )}
            </div>
            {i < TRACKER_STEPS.length - 1 && (
              <div
                className={`flex-1 h-[3px] mx-1 rounded-full ${
                  i < idx && !cancelled
                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="mt-1.5 text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}
      >
        <Icon size={16} />
      </div>
    </div>
  </div>
);

function SellerOrderDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetSellerOrderByIdQuery(id);
  const [updateItemStatus, { isLoading: isUpdating }] =
    useUpdateSellerOrderItemStatusMutation();
  const [cancelItem, { isLoading: isCancelling }] =
    useCancelSellerOrderItemMutation();

  const [itemStatuses, setItemStatuses] = useState({});
  const [cancelReason, setCancelReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const order = data?.order;

  useEffect(() => {
    if (order) {
      const initial = {};
      order.items.forEach((item) => {
        initial[item._id] = item.orderStatus;
      });
      setItemStatuses(initial);
    }
  }, [order]);

  const overallStatus = useMemo(
    () => (order ? overallStatusOf(order.items) : "Processing"),
    [order]
  );

  const totalSavings = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => {
      const base = item.basePrice || 0;
      const price = item.price || 0;
      return sum + (base - price) * item.quantity;
    }, 0);
  }, [order]);

  const totalQty = useMemo(
    () => (order?.items || []).reduce((s, i) => s + (i.quantity || 0), 0),
    [order]
  );

  const handleStatusUpdate = async (item) => {
    try {
      setUpdatingItemId(item._id);
      await updateItemStatus({
        id: order._id,
        productId: item.product?._id || item.product,
        status: itemStatuses[item._id],
      }).unwrap();
      toast.success("Item status updated");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update item status");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelItem({
        id: order._id,
        productId: selectedItem.product?._id || selectedItem.product,
        reason: cancelReason,
      }).unwrap();
      toast.success("Item cancelled");
      setSelectedItem(null);
      setCancelReason("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to cancel item");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-rose-500" size={40} />
          <p className="text-rose-700 dark:text-rose-300 font-medium mb-4">
            {error?.data?.message || "Failed to load order details"}
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

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center">
          <p className="text-lg font-semibold mb-4">Order not found</p>
          <Link
            to="/seller/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium"
          >
            <ChevronLeft size={16} /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const addr = order.order?.shippingAddress;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/seller/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <ChevronLeft size={18} />
          Back to Orders
        </Link>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Gradient header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 md:p-8 text-white shadow-xl shadow-amber-500/20">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/80">
                  Order ID
                </p>
                <p className="font-mono text-lg font-bold">
                  #{String(order._id).substring(0, 12).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} />
                {format(new Date(order.createdAt), "dd MMM yyyy • hh:mm a")}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-bold">
              {statusIcon(overallStatus)}
              {overallStatus}
            </span>
            <p className="text-2xl md:text-3xl font-bold">
              ₹{Number(order.totalPrice || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Tracker */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Fulfilment Progress
        </p>
        <StatusTracker status={overallStatus} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Items"
          value={order.items.length}
          icon={Package}
          accent="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
        />
        <StatCard
          label="Total Qty"
          value={totalQty}
          icon={Tag}
          accent="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
        />
        <StatCard
          label="Payment"
          value={order.order?.isPaid ? "Paid" : "Pending"}
          icon={CreditCard}
          accent={
            order.order?.isPaid
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
              : "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300"
          }
        />
        <StatCard
          label="Total"
          value={`₹${Number(order.totalPrice || 0).toFixed(2)}`}
          icon={IndianRupee}
          accent="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: items */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items.map((item) => {
                const availableStatusOptions = [
                  "Processing",
                  "Shipped",
                  "Delivered",
                ].filter(
                  (opt) => opt !== item.orderStatus && !item.isCancelled
                );
                const lineTotal = Number(item.price || 0) * item.quantity;
                const isThisUpdating = updatingItemId === item._id;

                return (
                  <div key={item._id} className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      <div className="shrink-0">
                        {item.product?.images?.[0]?.imageUrl ? (
                          <img
                            src={item.product.images[0].imageUrl}
                            alt={item.name}
                            className="w-24 h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-800"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                            <Package size={28} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {item.product?.brand && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {item.product.brand}
                              </p>
                            )}
                            <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} · ₹
                              {Number(item.price || 0).toFixed(2)} each
                            </p>
                          </div>
                          <p className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            ₹{lineTotal.toFixed(2)}
                          </p>
                        </div>

                        {/* Price breakdown */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Base
                            </span>
                            <span className="font-medium">
                              ₹
                              {(
                                Number(item.basePrice || 0) * item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                          {item.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                              <span>
                                Disc ({item.discountPercentage || 0}%)
                              </span>
                              <span>
                                −₹
                                {(item.discountAmount * item.quantity).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Tax ({item.taxPercentage || 0}%)
                            </span>
                            <span className="font-medium">
                              ₹
                              {(
                                Number(item.taxAmount || 0) * item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Line total
                            </span>
                            <span className="font-semibold">
                              ₹{lineTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Status + timestamps */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <StatusPill status={item.orderStatus} />
                          {item.isDelivered && item.deliveredAt && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                              Delivered{" "}
                              {format(
                                new Date(item.deliveredAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          )}
                          {item.isCancelled && item.cancelledAt && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                              Cancelled{" "}
                              {format(
                                new Date(item.cancelledAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          )}
                        </div>

                        {/* Cancellation reason */}
                        {item.isCancelled && item.cancellationReason && (
                          <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                            Reason: {item.cancellationReason}
                          </p>
                        )}

                        {/* Actions */}
                        {!item.isCancelled && (
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <select
                              value={
                                itemStatuses[item._id] || item.orderStatus
                              }
                              onChange={(e) =>
                                setItemStatuses({
                                  ...itemStatuses,
                                  [item._id]: e.target.value,
                                })
                              }
                              disabled={
                                isUpdating ||
                                availableStatusOptions.length === 0
                              }
                              className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                            >
                              <option value={item.orderStatus}>
                                {item.orderStatus} (current)
                              </option>
                              {availableStatusOptions.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(item)}
                              disabled={
                                isUpdating ||
                                itemStatuses[item._id] === item.orderStatus ||
                                availableStatusOptions.length === 0
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {isThisUpdating && (
                                <Loader2 size={12} className="animate-spin" />
                              )}
                              Update Status
                            </button>
                            {!item.isDelivered && (
                              <button
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                              >
                                <XCircle size={12} /> Cancel Item
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Price Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Items Price
                </span>
                <span className="font-medium">
                  ₹{Number(order.itemsPrice || 0).toFixed(2)}
                </span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>−₹{Number(order.totalDiscount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tax</span>
                <span className="font-medium">
                  ₹{Number(order.taxPrice || 0).toFixed(2)}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Savings</span>
                  <span>−₹{totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ₹{Number(order.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: buyer + address */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={14} /> Buyer
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <User
                  size={14}
                  className="text-gray-400 mt-0.5 shrink-0"
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.order?.user?.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 break-all">
                  {order.order?.user?.email || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} /> Shipping Address
            </h2>
            {addr ? (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {addr.fullName}
                </p>
                <p>
                  {addr.flatOrBuilding}, {addr.locality}
                </p>
                {addr.landmark && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Landmark: {addr.landmark}
                  </p>
                )}
                <p>
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                {addr.country && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {addr.country}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Phone size={14} className="text-gray-400" />
                  <span className="font-medium">{addr.mobileNumber}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No address on this order.
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={14} /> Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Method
                </span>
                <span className="font-medium">
                  {order.order?.paymentMethod || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Status
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
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setSelectedItem(null);
              setCancelReason("");
            }}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Cancel Item
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setCancelReason("");
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              {selectedItem.product?.images?.[0]?.imageUrl ? (
                <img
                  src={selectedItem.product.images[0].imageUrl}
                  alt={selectedItem.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                  <Package size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm line-clamp-1">
                  {selectedItem.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {selectedItem.quantity} · ₹
                  {(
                    Number(selectedItem.price || 0) * selectedItem.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="cancel-reason"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Reason for cancellation
              </label>
              <textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Why are you cancelling this item?"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setCancelReason("");
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={!cancelReason.trim() || isCancelling}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg"
              >
                {isCancelling ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerOrderDetails;
