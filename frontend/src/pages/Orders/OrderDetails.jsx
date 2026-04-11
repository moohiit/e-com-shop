import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetOrderByIdQuery,
  useCancelOrderItemMutation,
} from "../../features/order/orderApi";
import {
  useCreateReturnRequestMutation,
  useGetMyReturnsQuery,
} from "../../features/returns/returnApiSlice";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  Loader2,
  Download,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Banknote,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Clock,
  IndianRupee,
  ShieldCheck,
  X,
  ChevronLeft,
  Store,
  ShoppingBag,
  Calendar,
} from "lucide-react";

const STATUS_CONFIG = {
  Processing: { color: "blue", icon: Clock },
  Shipped: { color: "amber", icon: Truck },
  Delivered: { color: "green", icon: CheckCircle2 },
  Cancelled: { color: "red", icon: XCircle },
};

const TRACKER_STEPS = [
  { key: "Processing", label: "Processing", icon: Clock },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

const getOverallItemStatus = (items = []) => {
  if (!items.length) return "Processing";
  const statuses = items.map((i) => i.orderStatus);
  const unique = [...new Set(statuses)];
  if (unique.length === 1) return unique[0];
  if (statuses.includes("Delivered")) return "Shipped";
  if (statuses.includes("Shipped")) return "Shipped";
  if (statuses.every((s) => s === "Cancelled")) return "Cancelled";
  return "Processing";
};

const stepIndexFor = (status) => {
  if (status === "Delivered") return 2;
  if (status === "Shipped") return 1;
  if (status === "Cancelled") return -1;
  return 0;
};

const StatusTracker = ({ status }) => {
  const idx = stepIndexFor(status);
  const cancelled = status === "Cancelled";
  return (
    <div className="flex items-center">
      {TRACKER_STEPS.map((step, i) => {
        const done = !cancelled && i <= idx;
        const active = !cancelled && i === idx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  done
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : cancelled
                    ? "bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              >
                <Icon size={16} />
                {active && (
                  <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
                )}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  done
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < TRACKER_STEPS.length - 1 && (
              <div
                className={`flex-1 h-[3px] mx-2 rounded-full mb-5 ${
                  i < idx && !cancelled
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600"
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

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: "gray", icon: Package };
  const Icon = cfg.icon;
  const colorMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    gray: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[cfg.color]}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

const RefundBadge = ({ refundStatus, method }) => {
  if (!refundStatus) return null;
  const isRefunded = refundStatus === "Refunded" || refundStatus === "refunded";
  const isPending = refundStatus === "Pending";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        isRefunded
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : isPending
          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      }`}
    >
      {isRefunded ? (
        <CheckCircle2 size={11} />
      ) : isPending ? (
        <Clock size={11} />
      ) : (
        <XCircle size={11} />
      )}
      Return: {refundStatus}
      {method === "bank_transfer" && " (Bank)"}
    </span>
  );
};

function OrderDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetOrderByIdQuery(id);
  const [cancelOrderItem, { isLoading: isCancelling }] =
    useCancelOrderItemMutation();
  const [createReturnRequest, { isLoading: isReturning }] =
    useCreateReturnRequestMutation();
  const { data: myReturnsData } = useGetMyReturnsQuery();

  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [returnDialog, setReturnDialog] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [expandedSellers, setExpandedSellers] = useState({});

  const order = data?.order;

  const handleCancelItem = async () => {
    try {
      const result = await cancelOrderItem({
        id: order._id,
        productId: cancelDialog.product._id,
        reason: cancelReason,
      }).unwrap();

      setCancelDialog(null);
      setCancelReason("");

      // Show refund details in toast
      const refund = result?.refund;
      if (refund?.refunded) {
        toast.success(
          `Item cancelled. ₹${refund.amount.toFixed(2)} refund initiated — ${
            refund.method === "bank_transfer"
              ? "will be credited to your bank account"
              : "will be credited to your original payment method"
          } within 5-7 business days.`,
          { duration: 6000 }
        );
      } else if (refund && !refund.refunded) {
        toast.success("Item cancelled.");
        toast.error(`Refund could not be processed: ${refund.message}`, {
          duration: 5000,
        });
      } else {
        toast.success("Item cancelled successfully.");
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to cancel item");
    }
  };

  const handleReturnRequest = async () => {
    try {
      await createReturnRequest({
        orderId: order._id,
        productId: returnDialog.product._id,
        reason: returnReason,
      }).unwrap();
      setReturnDialog(null);
      setReturnReason("");
      toast.success("Return request submitted. The seller will review it shortly.");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit return request");
    }
  };

  const getReturnForItem = (productId) =>
    myReturnsData?.returns?.find(
      (r) => r.order?._id === id && r.product?._id === productId
    );

  const isWithinReturnWindow = (deliveredAt) => {
    if (!deliveredAt) return false;
    return (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24) <= 7;
  };

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to download invoice");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error(err.message || "Failed to download invoice");
    }
  };

  const toggleSeller = (sellerId) =>
    setExpandedSellers((prev) => ({ ...prev, [sellerId]: !prev[sellerId] }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-red-500">{error?.data?.message || "Failed to load order"}</p>
        <Link to="/my-orders" className="text-blue-600 hover:underline text-sm">
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-gray-500">Order not found</p>
        <Link to="/my-orders" className="text-blue-600 hover:underline text-sm">
          Back to orders
        </Link>
      </div>
    );
  }

  const isCOD = order.paymentMethod === "Cash on Delivery";
  const cancelledItems = order.orderItems.filter((i) => i.isCancelled);
  const cancelledTotal = cancelledItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );
  const allCancelled =
    order.orderItems.length > 0 &&
    order.orderItems.every((i) => i.isCancelled);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Top nav */}
        <div className="mb-4">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ChevronLeft size={18} />
            Back to Orders
          </Link>
        </div>

        {/* Gradient hero header */}
        <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl shadow-blue-500/20">
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
                    #{order._id.substring(0, 12).toUpperCase()}
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
                {order.isPaid ? "Paid" : "Payment Pending"}
              </span>
              <p className="text-2xl md:text-3xl font-bold">
                ₹{Number(order.totalPrice || 0).toFixed(2)}
              </p>
              {order.isPaid && (
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
                >
                  <Download size={13} /> Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fulfilment tracker */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Fulfilment Progress
          </p>
          <StatusTracker status={getOverallItemStatus(order.orderItems)} />
        </div>

        {/* Refund banner — shows when any item is cancelled on a paid order */}
        {order.isPaid && cancelledItems.length > 0 && (
          <div
            className={`rounded-xl border p-4 mb-6 ${
              isCOD
                ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900"
                : "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isCOD
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}
              >
                <IndianRupee size={18} />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isCOD
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-green-800 dark:text-green-300"
                  }`}
                >
                  Refund of ₹
                  {(cancelledTotal + (allCancelled ? order.shippingPrice || 0 : 0)).toFixed(2)}{" "}
                  initiated
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isCOD
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-green-700 dark:text-green-400"
                  }`}
                >
                  {isCOD
                    ? "Refund will be credited to your bank account within 5-7 business days. Our team will contact you for bank details if not already on file."
                    : "Refund will be credited to your original payment method within 5-7 business days."}
                </p>
                {cancelledItems.length < order.orderItems.length && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {cancelledItems.length} of {order.orderItems.length} item(s) cancelled
                    {!allCancelled && " — shipping fee is refunded only when all items are cancelled"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left — summary cards */}
          <div className="lg:col-span-4 space-y-4">
            {/* Order summary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    {isCOD ? <Banknote size={13} /> : <CreditCard size={13} />}
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span
                    className={`font-semibold text-xs ${
                      order.isPaid
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Paid on</span>
                    <span>{format(new Date(order.paidAt), "MMM dd, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} /> Shipping
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                <p>
                  {order.shippingAddress?.flatOrBuilding},{" "}
                  {order.shippingAddress?.locality}
                </p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
                  {order.shippingAddress?.pincode}
                </p>
                {order.shippingAddress?.landmark && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Landmark: {order.shippingAddress.landmark}
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-400">
                  Phone: {order.shippingAddress?.mobileNumber}
                </p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Price Breakdown
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Items</span>
                  <span>₹{order.itemsPrice?.toFixed(2)}</span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>−₹{order.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tax</span>
                  <span>₹{order.taxPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Delivery</span>
                  <span
                    className={
                      order.shippingPrice === 0
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : ""
                    }
                  >
                    {order.shippingPrice === 0
                      ? "FREE"
                      : `₹${order.shippingPrice?.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
                {cancelledTotal > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400 text-xs">
                    <span>Refunded (cancelled items)</span>
                    <span>
                      −₹
                      {(
                        cancelledTotal +
                        (allCancelled ? order.shippingPrice || 0 : 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — items + seller orders */}
          <div className="lg:col-span-8 space-y-4">
            {/* Order Items */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Items ({order.orderItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.orderItems.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  const returnReq = getReturnForItem(item.product?._id);
                  const hasReturn = !!returnReq;
                  const canReturn =
                    item.isDelivered &&
                    !item.isCancelled &&
                    !hasReturn &&
                    isWithinReturnWindow(item.deliveredAt);
                  const canCancel = !item.isCancelled && !item.isDelivered;

                  return (
                    <div key={item._id} className="p-4 md:p-5">
                      <div className="flex gap-4">
                        {/* Image */}
                        <Link
                          to={`/product/${item.product?._id}`}
                          className="shrink-0"
                        >
                          <img
                            src={
                              item.product?.images?.[0]?.imageUrl ||
                              "/placeholder-image.jpg"
                            }
                            alt={item.name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                          />
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {item.product?.brand && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {item.product.brand}
                                </p>
                              )}
                              <Link
                                to={`/product/${item.product?._id}`}
                                className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Qty: {item.quantity} &middot; ₹{item.price?.toFixed(2)} each
                              </p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              ₹{lineTotal.toFixed(2)}
                            </p>
                          </div>

                          {/* Status badges */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <StatusBadge status={item.orderStatus} />
                            {item.isDelivered && item.deliveredAt && (
                              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                Delivered {format(new Date(item.deliveredAt), "MMM dd")}
                              </span>
                            )}
                            {item.isCancelled && item.cancelledAt && (
                              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                Cancelled {format(new Date(item.cancelledAt), "MMM dd")}
                              </span>
                            )}
                            {hasReturn && (
                              <RefundBadge
                                refundStatus={returnReq.status}
                                method={
                                  returnReq.refundId?.startsWith("COD_")
                                    ? "bank_transfer"
                                    : "original_payment"
                                }
                              />
                            )}
                          </div>

                          {/* Cancellation reason */}
                          {item.isCancelled && item.cancellationReason && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 italic">
                              Reason: {item.cancellationReason}
                            </p>
                          )}

                          {/* Refund info for cancelled items */}
                          {item.isCancelled && order.isPaid && (
                            <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 text-xs">
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                <IndianRupee size={11} className="inline -mt-0.5" /> Refund: ₹
                                {lineTotal.toFixed(2)}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                {isCOD
                                  ? "Will be credited to your bank account within 5-7 business days."
                                  : "Will be credited to your original payment method within 5-7 business days."}
                              </p>
                            </div>
                          )}

                          {/* Return info box */}
                          {hasReturn && (
                            <div
                              className={`mt-2 rounded-lg p-2.5 text-xs ${
                                returnReq.status === "Refunded"
                                  ? "bg-green-50 dark:bg-green-900/10"
                                  : returnReq.status === "Rejected"
                                  ? "bg-red-50 dark:bg-red-900/10"
                                  : "bg-amber-50 dark:bg-amber-900/10"
                              }`}
                            >
                              <p className="font-medium">
                                Return {returnReq.status} — ₹{returnReq.refundAmount?.toFixed(2)}
                              </p>
                              {returnReq.status === "Refunded" && (
                                <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                  {returnReq.refundId?.startsWith("COD_")
                                    ? "Refund will be credited to your bank account within 5-7 business days."
                                    : `Refund ID: ${returnReq.refundId} — credited to original payment method.`}
                                </p>
                              )}
                              {returnReq.status === "Pending" && (
                                <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                  Waiting for seller approval. You'll be notified once reviewed.
                                </p>
                              )}
                              {returnReq.status === "Rejected" && returnReq.sellerNote && (
                                <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                  Seller note: {returnReq.sellerNote}
                                </p>
                              )}
                              {returnReq.reason && (
                                <p className="text-gray-500 dark:text-gray-400 mt-0.5 italic">
                                  Your reason: {returnReq.reason}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => setCancelDialog(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            )}
                            {canReturn && (
                              <button
                                type="button"
                                onClick={() => setReturnDialog(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                              >
                                <RotateCcw size={12} /> Request Return
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seller Orders */}
            {order.sellerOrders?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Seller Breakdown
                  </h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {order.sellerOrders.map((so) => {
                    const isExpanded = expandedSellers[so._id];
                    return (
                      <div key={so._id}>
                        <button
                          type="button"
                          onClick={() => toggleSeller(so._id)}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Store size={14} className="text-gray-400" />
                            <span className="text-sm font-medium">
                              {so.seller?.name || "Unknown Seller"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              ₹{so.totalPrice?.toFixed(2)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={14} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={14} className="text-gray-400" />
                            )}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-4 space-y-2">
                            {so.items?.map((si) => (
                              <div
                                key={si._id}
                                className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{si.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Qty: {si.quantity} &middot;{" "}
                                    <StatusBadge status={si.orderStatus} />
                                  </p>
                                </div>
                                <p className="font-medium whitespace-nowrap ml-3">
                                  ₹{(si.price * si.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="mt-6 flex justify-end">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>

      {/* Cancel Dialog */}
      {cancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setCancelDialog(null);
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
                  setCancelDialog(null);
                  setCancelReason("");
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <img
                src={cancelDialog.product?.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
                alt={cancelDialog.name}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="font-medium text-sm line-clamp-1">{cancelDialog.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {cancelDialog.quantity} &middot; ₹
                  {(cancelDialog.price * cancelDialog.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Refund preview */}
            {order.isPaid && order.paymentMethod !== "Cash on Delivery" && (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                  <ShieldCheck size={13} /> Refund of ₹
                  {(cancelDialog.price * cancelDialog.quantity).toFixed(2)} will be
                  initiated to your original payment method.
                </p>
              </div>
            )}
            {order.isPaid && isCOD && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Banknote size={13} /> Refund of ₹
                  {(cancelDialog.price * cancelDialog.quantity).toFixed(2)} will be
                  processed to your bank account within 5-7 business days.
                </p>
              </div>
            )}

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
                placeholder="Please tell us why you're cancelling…"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCancelDialog(null);
                  setCancelReason("");
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Keep Item
              </button>
              <button
                type="button"
                onClick={handleCancelItem}
                disabled={!cancelReason.trim() || isCancelling}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {isCancelling ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Dialog */}
      {returnDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setReturnDialog(null);
              setReturnReason("");
            }}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Request Return
              </h3>
              <button
                type="button"
                onClick={() => {
                  setReturnDialog(null);
                  setReturnReason("");
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <img
                src={returnDialog.product?.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
                alt={returnDialog.name}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="font-medium text-sm line-clamp-1">{returnDialog.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {returnDialog.quantity} &middot; Refund: ₹
                  {(returnDialog.price * returnDialog.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Refund method info */}
            <div
              className={`rounded-lg p-3 text-xs ${
                isCOD
                  ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900"
                  : "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900"
              }`}
            >
              <p
                className={`font-semibold ${
                  isCOD
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {isCOD ? (
                  <>
                    <Banknote size={13} className="inline -mt-0.5 mr-1" />
                    Refund will be processed to your bank account once approved.
                  </>
                ) : (
                  <>
                    <CreditCard size={13} className="inline -mt-0.5 mr-1" />
                    Refund will be credited to your original payment method once approved.
                  </>
                )}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Returns must be requested within 7 days of delivery. The seller will review your request.
              </p>
            </div>

            <div>
              <label
                htmlFor="return-reason"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Reason for return
              </label>
              <textarea
                id="return-reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={3}
                placeholder="Please describe why you want to return this item…"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setReturnDialog(null);
                  setReturnReason("");
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnRequest}
                disabled={!returnReason.trim() || isReturning}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {isReturning ? "Submitting…" : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;
