// OrderReview.jsx
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { useCreateOrderMutation } from "../../features/order/orderApi";
import {
  useCreateTransactionMutation,
  useVerifyTransactionMutation,
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
          seller: item?.seller?._id, // Include seller ID
        })),
        shippingAddress: selectedAddress._id, // Store Address ID
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };

      const createdOrder = await createOrder(orderData).unwrap();

      if (paymentMethod === "Cash on Delivery") {
        dispatch(clearCart());
        toast.success("Order placed successfully (Cash on Delivery)");
        // Redirect to order success page if you have one
      } else {
        handleRazorpayPayment(createdOrder._id);
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
              email: response.email, // Optional: If collected on frontend
            }).unwrap();

            dispatch(clearCart());
            navigate("/order-success", {
              state: { orderId, totalPrice },
            });
            toast.success("Payment Successful! Order Placed.");
            // Redirect to order success page if needed
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          email: user.email, // Optional: Pass user email here
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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Order</h3>
      <div>
        {cartItems.map((item) => (
          <div key={item._id} className="flex justify-between py-2 border-b">
            <span>
              {item.name} (x{item.quantity})
            </span>
            <span>₹{item.discountPrice * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-right">
        <p>Items Price: ₹{itemsPrice}</p>
        <p>Shipping Price: {shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</p>
        <p>Tax Price: ₹{taxPrice}</p>
        <p className="font-semibold">Total Price: ₹{totalPrice}</p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-600 text-white py-2 px-4 rounded"
        >
          Back
        </button>
        <button
          onClick={handleOrderPlacement}
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default OrderReview;
