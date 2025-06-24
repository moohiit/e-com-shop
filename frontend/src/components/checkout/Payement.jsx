import React from 'react';
import { toast } from 'react-hot-toast';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '../../features/payment/paymentApi';

export default function RazorpayCheckoutButton({ orderId, amount, user }) {
  const [createRazorpayOrder] = useCreateOrderMutation();
  const [verifyRazorpayPayment] = useVerifyPaymentMutation(); 

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load.');
      return;
    }

    try {
      // Step 1: Create Razorpay Order from backend
      const response = await createRazorpayOrder({ orderId }).unwrap();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay public key
        amount: response.amount,
        currency: response.currency,
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: response.razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            // Step 2: Verify payment on backend
            await verifyRazorpayPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              orderId: response.orderId,
              email: user.email,
            }).unwrap();

            toast.success('Payment Successful!');
            // You can redirect or refresh the order here
          } catch (error) {
            console.error(error);
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate payment.');
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
    >
      Pay ₹{amount}
    </button>
  );
}
