import { useSelector, useDispatch } from 'react-redux';
import { clearCart, selectCartItems, selectCartTotalAmount, selectShippingAddress, selectPaymentMethod } from '../../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const OrderReview = ({ onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const shippingAddress = useSelector(selectShippingAddress);
  const paymentMethod = useSelector(selectPaymentMethod);

  const handlePlaceOrder = () => {
    // Simulate order placement
    dispatch(clearCart());
    toast.success('Order placed successfully!');
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

      <div>
        <h3 className="font-medium mb-2">Shipping Address:</h3>
        <p>{shippingAddress.fullName}</p>
        <p>{shippingAddress.address}, {shippingAddress.city}</p>
        <p>{shippingAddress.postalCode}, {shippingAddress.country}</p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Payment Method:</h3>
        <p>{paymentMethod}</p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Products:</h3>
        {items.map(item => (
          <div key={item._id} className="flex justify-between border-b py-2">
            <span>{item.name} (x{item.quantity})</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="text-lg font-bold flex justify-between border-t pt-2">
        <span>Total:</span>
        <span>₹{totalAmount}</span>
      </div>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          type="button"
          onClick={onBack}
          className="bg-gray-600 text-white py-2 px-4 rounded"
        >
          Back
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          type="button"
          onClick={handlePlaceOrder}
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          Place Order
        </motion.button>
      </div>
    </div>
  );
};

export default OrderReview;
