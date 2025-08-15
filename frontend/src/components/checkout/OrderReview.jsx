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