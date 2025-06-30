import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { orderId, totalPrice } = location.state || {};

  if (!orderId || !totalPrice) {
    // If user lands here without order info, redirect to home
    navigate("/");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your order has been placed successfully. Thank you for shopping with us!
        </p>
        <div className="space-y-2 text-left">
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Total Amount:</strong> ₹{totalPrice}</p>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate(`/my-orders`)}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            View Order
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSuccess;
