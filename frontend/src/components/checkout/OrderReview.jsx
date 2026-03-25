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

const OrderReview = ({ onBack, selectedAddress }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const paymentMethod = useSelector((state) => state.cart.paymentMethod);
  const [createOrder] = useCreateOrderMutation();
  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyAndCreateOrder] = useVerifyAndCreateOrderMutation();
  const [clearCartApi] = useClearCartApiMutation();

  const calculatePrices = () => {
    const itemsPrice = cartItems.reduce(
      (acc, item) => acc + (item.basePrice || 0) * item.quantity,
      0
    );
    const totalDiscount = cartItems.reduce(
      (acc, item) => acc + (item.discountAmount || 0) * item.quantity,
      0
    );
    const taxPrice = cartItems.reduce(
      (acc, item) => acc + (item.taxAmount || 0) * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice = Number(
      (itemsPrice - totalDiscount + taxPrice + shippingPrice).toFixed(2)
    );
    return { itemsPrice, totalDiscount, taxPrice, shippingPrice, totalPrice };
  };

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

  const { itemsPrice, totalDiscount, shippingPrice, taxPrice, totalPrice } =
    calculatePrices();

  const buildOrderData = () => ({
    orderItems: cartItems.map((item) => ({
      product: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.finalPrice,
      basePrice: item.basePrice,
      discountPercentage: item.discountPercentage || 0,
      discountAmount: item.discountAmount || 0,
      taxPercentage: item.taxPercentage || 0,
      taxAmount: item.taxAmount || 0,
      seller: item?.seller?._id || item.seller,
    })),
    shippingAddress: selectedAddress._id,
    paymentMethod,
    itemsPrice,
    totalDiscount,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  const clearCartEverywhere = () => {
    dispatch(clearCart());
    if (user) clearCartApi().catch(() => {});
  };

  // Handle order placement
  const handleOrderPlacement = async () => {
    if (paymentMethod === "Cash on Delivery") {
      // COD: create order directly (no payment needed)
      try {
        const response = await createOrder(buildOrderData()).unwrap();
        clearCartEverywhere();
        toast.success("Order placed successfully (Cash on Delivery)");
        navigate("/order-success", {
          state: { orderId: response.order._id, totalPrice },
        });
      } catch (err) {
        toast.error(err?.data?.message || "Failed to place order");
      }
    } else {
      // Online payment: initiate payment FIRST, create order AFTER payment succeeds
      await handleRazorpayPayment();
    }
  };

  // Handle Razorpay payment (payment-first flow)
  const handleRazorpayPayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }

    try {
      // Step 1: Create Razorpay order (no DB order yet)
      const { razorpayOrderId, amount, currency } = await initiatePayment({
        amount: totalPrice,
      }).unwrap();

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "ShopEase",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response) => {
          // Step 3: On payment success → verify + create DB order
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
              error?.data?.message || "Payment verified but order creation failed. Contact support."
            );
            console.error("Verify and create order error:", error);
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          email: user.email,
          contact: selectedAddress.mobileNumber,
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        toast.error("Payment failed. No order was created. Please try again.");
        console.error("Razorpay payment failure:", response.error);
      });
      razorpay.open();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to initiate payment");
      console.error("Razorpay initiation failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Order</h3>
      <div>
        {cartItems.map((item) => {
          const basePrice = (item.basePrice || 0) * item.quantity;
          const discountAmount = (item.discountAmount || 0) * item.quantity;
          const taxAmount = (item.taxAmount || 0) * item.quantity;
          const itemTotal = (item.finalPrice || 0) * item.quantity;

          return (
            <div key={item._id} className="flex flex-col py-2 border-b">
              <div className="flex justify-between">
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span>₹{itemTotal.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Base Price: ₹{basePrice.toFixed(2)}</p>
                {discountAmount > 0 && (
                  <p className="text-red-500">
                    Discount ({item.discountPercentage || 0}%): ₹
                    {discountAmount.toFixed(2)}
                  </p>
                )}
                <p>
                  Taxes ({item.taxPercentage || 0}%): ₹{taxAmount.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 text-right">
        <p>Items Price: ₹{itemsPrice.toFixed(2)}</p>
        {totalDiscount > 0 && (
          <p className="text-red-500">
            Total Discount: ₹{totalDiscount.toFixed(2)}
          </p>
        )}
        <p>Tax Price: ₹{taxPrice.toFixed(2)}</p>
        <p>
          Shipping Price:{" "}
          {shippingPrice === 0 ? "Free" : `₹${shippingPrice.toFixed(2)}`}
        </p>
        <div className="border-t pt-2 mt-2">
          <p className="font-semibold text-lg">
            Total Price: ₹{totalPrice.toFixed(2)}
          </p>
        </div>
        {paymentMethod === "Cash on Delivery" && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Pay ₹{totalPrice.toFixed(2)} at the time of delivery
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={handleOrderPlacement}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          {paymentMethod === "Cash on Delivery" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default OrderReview;
