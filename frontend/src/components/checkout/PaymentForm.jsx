import { useState } from "react";
import { useDispatch } from "react-redux";
import { savePaymentMethod } from "../../features/cart/cartSlice";
import {
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Lock,
  Smartphone,
} from "lucide-react";

const paymentOptions = [
  {
    value: "Online Payment",
    label: "Pay Online",
    description: "UPI, Debit/Credit Cards, Net Banking via Razorpay",
    icon: CreditCard,
    color: "blue",
    badges: ["UPI", "Visa", "Mastercard"],
  },
  {
    value: "Cash on Delivery",
    label: "Cash on Delivery",
    description: "Pay with cash when your order is delivered",
    icon: Banknote,
    color: "amber",
    badges: ["Cash", "No advance"],
  },
];

const PaymentForm = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState("Online Payment");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Select Payment Method
      </h3>

      <div className="space-y-3">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = paymentMethod === option.value;
          const inputId = `pay-${option.value
            .replace(/\s+/g, "-")
            .toLowerCase()}`;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50/60 dark:bg-blue-900/20 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
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

              {/* Radio circle */}
              <div
                className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? "border-blue-600"
                    : "border-gray-400 dark:border-gray-600"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}
              </div>

              {/* Icon */}
              <div
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon size={22} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {option.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {option.description}
                </p>
                {/* Mini badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {option.badges.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                    />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Security note */}
      <div className="flex items-center gap-4 justify-center text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1">
          <Lock size={12} /> 256-bit SSL
        </span>
        <span className="inline-flex items-center gap-1">
          <ShieldCheck size={12} /> PCI DSS Compliant
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow"
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
