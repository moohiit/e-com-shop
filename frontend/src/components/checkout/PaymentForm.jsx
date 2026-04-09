import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { savePaymentMethod } from '../../features/cart/cartSlice';
import { motion } from 'framer-motion';
import { CreditCard, Banknote } from 'lucide-react';

const paymentOptions = [
  {
    value: 'Online Payment',
    label: 'Online Payment',
    description: 'Pay securely via Razorpay (UPI, Cards, Net Banking)',
    icon: CreditCard,
  },
  {
    value: 'Cash on Delivery',
    label: 'Cash on Delivery',
    description: 'Pay when your order is delivered',
    icon: Banknote,
  },
];

const PaymentForm = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState('Online Payment');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    onNext();
  };

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-4 text-lg font-semibold">Select Payment Method</label>
        <div className="space-y-3">
          {paymentOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = paymentMethod === option.value;
            const inputId = `payment-${option.value.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  aria-label={option.label}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600' : 'border-gray-400'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <Icon
                  size={24}
                  className={isSelected ? 'text-blue-600' : 'text-gray-500'}
                />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
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
