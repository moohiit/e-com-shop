import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { useClearCartApiMutation } from "../../features/cart/cartApiSlice";
import { useCreateOrderMutation } from "../../features/order/orderApi";
import {
  useInitiatePaymentMutation,
  useVerifyAndCreateOrderMutation,
} from "../../features/transaction/transactionApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  calculateCartPricing,
  calculateLinePricing,
} from "../../utils/pricing";
import {
  MapPin,
  CreditCard,
  Banknote,
  ChevronLeft,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";

const OrderReview = ({ onBack, selectedAddress }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const paymentMethod = useSelector((state) => state.cart.paymentMethod);
  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();
  const [initiatePayment, { isLoading: isInitiating }] =
    useInitiatePaymentMutation();
  const [verifyAndCreateOrder] = useVerifyAndCreateOrderMutation();
  const [clearCartApi] = useClearCartApiMutation();

  const { itemsPrice, totalDiscount, shippingPrice, taxPrice, totalPrice } =
    calculateCartPricing(cartItems);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const buildOrderData = () => ({
    orderItems: cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    })),
    shippingAddress: selectedAddress._id,
    paymentMethod,
  });

  const clearCartEverywhere = () => {
    dispatch(clearCart());
    if (user) clearCartApi().catch(() => {});
  };

  const handleOrderPlacement = async () => {
    if (paymentMethod === "Cash on Delivery") {
      try {
        const response = await createOrder(buildOrderData()).unwrap();
        clearCartEverywhere();
        toast.success("Order placed successfully!");
        navigate("/order-success", {
          state: { orderId: response.order._id, totalPrice },
        });
      } catch (err) {
        toast.error(err?.data?.message || "Failed to place order");
      }
    } else {
      await handleRazorpayPayment();
    }
  };

  const handleRazorpayPayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }

    try {
      const { razorpayOrderId, amount, currency } = await initiatePayment({
        amount: totalPrice,
      }).unwrap();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "ShopEase",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const result = await verifyAndCreateOrder({
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderData: buildOrderData(),
              email: user.email,
            }).unwrap();

            clearCartEverywhere();
            toast.success("Payment successful! Order placed.");
            navigate("/order-success", {
              state: { orderId: result.order._id, totalPrice },
            });
          } catch (error) {
            toast.error(
              error?.data?.message ||
                "Payment verified but order creation failed. Contact support."
            );
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          email: user.email,
          contact: selectedAddress.mobileNumber,
        },
        theme: { color: "#3b82f6" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to initiate payment");
    }
  };

  const isCOD = paymentMethod === "Cash on Delivery";
  const busy = isOrdering || isInitiating;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Review Your Order
      </h3>

      {/* Ship-to + payment summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Address */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1 mb-2">
            <MapPin size={13} /> Ship to
          </p>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {selectedAddress.fullName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {selectedAddress.flatOrBuilding}, {selectedAddress.locality},{" "}
            {selectedAddress.city}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {selectedAddress.state} — {selectedAddress.pincode}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Phone: {selectedAddress.mobileNumber}
          </p>
        </div>

        {/* Payment */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1 mb-2">
            {isCOD ? <Banknote size={13} /> : <CreditCard size={13} />}{" "}
            Payment method
          </p>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {paymentMethod}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isCOD
              ? "Pay when your order is delivered"
              : "Secure online payment via Razorpay"}
          </p>
        </div>
      </div>

      {/* Items list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {cartItems.map((item) => {
          const { itemTotal } = calculateLinePricing(item);
          const unitPrice = Number(item.finalPrice ?? item.basePrice ?? 0);
          const hasDiscount = (item.discountPercentage || 0) > 0;

          return (
            <div key={item._id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <img
                src={item.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
                alt={item.name}
                className="w-14 h-14 rounded-lg object-cover border border-gray-100 dark:border-gray-800 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                  {item.name}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ₹{unitPrice.toFixed(2)} x {item.quantity}
                  </span>
                  {hasDiscount && (
                    <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">
                      {Math.round(item.discountPercentage)}% off
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap self-center">
                ₹{itemTotal.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Price breakdown */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium">₹{itemsPrice.toFixed(2)}</span>
        </div>
        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1">
              <Tag size={13} /> Discount
            </span>
            <span className="font-medium">−₹{totalDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="font-medium">₹{taxPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Truck size={13} /> Delivery
          </span>
          <span
            className={`font-medium ${
              shippingPrice === 0 ? "text-green-600 dark:text-green-400" : ""
            }`}
          >
            {shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toFixed(2)}`}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5">
          <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        {isCOD && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Pay ₹{totalPrice.toFixed(2)} at the time of delivery
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={handleOrderPlacement}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {busy ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShieldCheck size={18} />
          )}
          {isCOD ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default OrderReview;
