import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import InfoPage from "./InfoPage";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse our catalog, add items to your cart, and proceed to checkout. You can pay online via Razorpay (UPI, cards, net banking) or choose Cash on Delivery where available.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery. All online payments are processed securely through Razorpay.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is placed, you can view its status anytime under My Orders. We also send order updates to your registered email.",
  },
  {
    q: "Can I cancel an order after placing it?",
    a: "Yes — you can cancel any item that hasn't shipped yet from the order details page. Refunds for prepaid orders are processed automatically to your original payment method.",
  },
  {
    q: "Do you deliver across India?",
    a: "Yes, we ship to all serviceable pincodes across India. Delivery times vary by location; you'll see an estimated delivery date at checkout.",
  },
  {
    q: "How do I return a product?",
    a: "You can request a return within 7 days of delivery from the order details page. See our Returns page for the full policy.",
  },
  {
    q: "How do I become a seller on ShopEase?",
    a: "Click 'Sell on ShopEase' in the header and submit a seller application. Our team reviews applications and grants seller access once approved.",
  },
  {
    q: "Is my personal information safe?",
    a: "Absolutely. We use industry-standard encryption and never share your data with third parties. Read our Privacy Policy for details.",
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <InfoPage
      title="Frequently Asked Questions"
      subtitle="Quick answers to the questions our customers ask most often."
    >
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className="w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium pr-4">{faq.q}</span>
                {isOpen ? (
                  <FiChevronUp className="shrink-0 text-blue-600 dark:text-blue-400" />
                ) : (
                  <FiChevronDown className="shrink-0 text-gray-500" />
                )}
              </button>
              {isOpen && (
                <div className="p-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </InfoPage>
  );
};

export default FAQs;
