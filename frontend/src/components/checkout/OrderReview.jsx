import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { useCreateOrderMutation } from "../../features/order/orderApi";
import {
  useCreateTransactionMutation,
  useVerifyTransactionMutation,
} from "../../features/transaction/transactionApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaBox, FaShippingFast, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

const OrderReview = ({ onBack, selectedAddress }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const paymentMethod = useSelector((state) => state.cart.paymentMethod);

  const [createOrder] = useCreateOrderMutation();
  const [createTransaction] = useCreateTransactionMutation();
  const [verifyTransaction] = useVerifyTransactionMutation();

  // Calculate order prices (items, shipping, tax, total)
  const calculatePrices = () => {
    const itemsPrice = cartItems.reduce(
      (acc, item) => acc + item.actualPrice * item.quantity,
      0
    );
    const taxPrice = cartItems.reduce(
      (acc, item) => acc + item.taxes * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice = Number(
      (
        cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) +
        shippingPrice
      ).toFixed(2)
    );

    return { itemsPrice, taxPrice, shippingPrice, totalPrice };
  };

  // Load Razorpay SDK script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculatePrices();

  // Handle order placement (create order and initiate payment if needed)
  const handleOrderPlacement = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price, // Total price including taxes
          actualPrice: item.actualPrice,
          taxes: item.taxes,
          taxPercentage: item.taxPercentage,
          seller: item?.seller?._id,
        })),
        shippingAddress: selectedAddress._id,
        shippingAddress: selectedAddress._id,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };

      const response = await createOrder(orderData).unwrap();
      if (paymentMethod === "Cash on Delivery") {
        dispatch(clearCart());
        toast.success("Order placed successfully (Cash on Delivery)");
        navigate("/order-success", {
          state: { orderId: response.order._id, totalPrice },
        });
        navigate("/order-success", {
          state: { orderId: response.order._id, totalPrice },
        });
      } else {
        handleRazorpayPayment(response.order._id);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to place order");
      console.error("Order placement error:", err);
    }
  };

  // Handle Razorpay payment initiation and verification
  const handleRazorpayPayment = async (orderId) => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }

    try {
      const { razorpayOrderId, amount, currency } = await createTransaction({
        orderId,
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
            const verificationResponse = await verifyTransaction({
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
              email: user.email,
              email: user.email,
            }).unwrap();

            dispatch(clearCart());
            navigate("/order-success", {
              state: { orderId, totalPrice },
            });
            toast.success("Payment successful! Order placed.");
          } catch (error) {
            toast.error(error?.data?.message || "Payment verification failed");
            console.error("Payment verification error:", error);
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          email: user.email,
          email: user.email,
          contact: selectedAddress.mobileNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        toast.error("Payment failed. Please try again.");
        console.error("Razorpay payment failure:", response.error);
      });
      razorpay.open();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to initiate payment");
      console.error("Razorpay payment initiation failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Order</h3>
      <div>
        {cartItems.map((item) => (
          <div key={item._id} className="flex flex-col py-2 border-b">
            <div className="flex justify-between">
              <span>{item.name} (x{item.quantity})</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Base Price: ₹{(item.actualPrice * item.quantity).toFixed(2)}</p>
              <p>Taxes ({item.taxPercentage}%): ₹{(item.taxes * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-right">
        <p>Items Price: ₹{itemsPrice.toFixed(2)}</p>
        <p>Shipping Price: {shippingPrice === 0 ? "Free" : `₹${shippingPrice.toFixed(2)}`}</p>
        <p>Tax Price: ₹{taxPrice.toFixed(2)}</p>
        <p className="font-semibold">Total Price: ₹{totalPrice.toFixed(2)}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FaArrowLeft /> Back
        </motion.button>
        <motion.button
          onClick={handleOrderPlacement}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
        >
          {paymentMethod === "Cash on Delivery" ? "Place Order" : "Proceed to Payment"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OrderReview;