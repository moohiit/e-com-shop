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

  const calculatePrices = () => {
    const itemsPrice = cartItems.reduce(
      (acc, item) => acc + item.discountPrice * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = +(0.18 * itemsPrice).toFixed(2);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  };

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
          price: item.discountPrice,
          seller: item?.seller?._id,
          image: item.images[0]?.imageUrl,
        })),
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
      } else {
        handleRazorpayPayment(response.order._id);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to place order");
    }
  };

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
            await verifyTransaction({
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
              email: user.email,
            }).unwrap();
            
            dispatch(clearCart());
            navigate("/order-success", {
              state: { orderId, totalPrice },
            });
            toast.success("Payment Successful! Order Placed.");
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          email: user.email,
          contact: selectedAddress.mobileNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Razorpay payment initiation failed:", err);
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Review Your Order</h3>
      
      {/* Shipping Address */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <FaShippingFast className="mr-2" /> Shipping Address
        </h4>
        <div className="text-gray-600 dark:text-gray-400">
          <p>{selectedAddress.fullName}</p>
          <p>{selectedAddress.flatOrBuilding}, {selectedAddress.locality}</p>
          <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
          <p>{selectedAddress.country}</p>
          <p className="mt-2">Phone: {selectedAddress.mobileNumber}</p>
          {selectedAddress.landmark && <p>Landmark: {selectedAddress.landmark}</p>}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          {paymentMethod === "Cash on Delivery" ? (
            <FaMoneyBillWave className="mr-2" />
          ) : (
            <FaCreditCard className="mr-2" />
          )}
          Payment Method
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          {paymentMethod === "Cash on Delivery" 
            ? "Cash on Delivery (Pay when you receive your order)"
            : "Online Payment (Credit/Debit Card, UPI, Net Banking)"}
        </p>
      </div>

      {/* Order Items */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <FaBox className="mr-2" /> Order Items ({cartItems.length})
        </h4>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-start border-b border-gray-200 dark:border-gray-600 pb-4">
              <img 
                src={item.images[0]?.imageUrl} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <h5 className="font-medium text-gray-800 dark:text-gray-200">{item.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.quantity} × ₹{item.discountPrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Seller: {item.seller?.name || "ShopEase"}
                </p>
              </div>
              <div className="text-gray-800 dark:text-gray-200 font-medium">
                ₹{(item.discountPrice * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-800 dark:text-gray-200">₹{itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
            <span className="text-gray-800 dark:text-gray-200">
              {shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tax (18%)</span>
            <span className="text-gray-800 dark:text-gray-200">₹{taxPrice.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-800 dark:text-gray-200">Total</span>
              <span className="text-blue-600 dark:text-blue-400">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
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