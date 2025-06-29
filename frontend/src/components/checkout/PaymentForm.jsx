import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { savePaymentMethod } from '../../features/cart/cartSlice';
import { motion } from 'framer-motion';

const PaymentForm = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    onNext();
  };

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 font-medium">Select Payment Method:</label>
        <div className="space-y-2">
          <div>
            <input
              type="radio"
              id="cod"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={paymentMethod === 'Cash on Delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="cod" className="ml-2">
              Cash on Delivery
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="online"
              name="paymentMethod"
              value="Online Payment"
              checked={paymentMethod === 'Online Payment'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="online" className="ml-2">
              Online Payment (Simulated)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
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
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Continue
        </motion.button>
      </div>
    </motion.form>
  );
};

export default PaymentForm;
