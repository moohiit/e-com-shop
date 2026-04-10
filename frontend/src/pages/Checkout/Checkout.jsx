import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  ClipboardCheck,
  Check,
  ChevronRight,
  ShieldCheck,
  Lock,
} from "lucide-react";
import AddressForm from "../../components/checkout/AddressForm";
import PaymentForm from "../../components/checkout/PaymentForm";
import OrderReview from "../../components/checkout/OrderReview";
import AddressList from "../../components/checkout/AddressList";
import { useGetAddressesQuery } from "../../features/address/addressApiSlice";
import { saveShippingAddress } from "../../features/cart/cartSlice";
import { calculateCartPricing } from "../../utils/pricing";

const STEPS = [
  { label: "Shipping", icon: MapPin },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: ClipboardCheck },
];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const { data: response, isLoading, refetch } = useGetAddressesQuery();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const addresses = response?.addresses || [];

  const { totalPrice, totalDiscount } = calculateCartPricing(items || []);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find((a) => a.isDefault);
      if (def) {
        setSelectedAddress(def);
        dispatch(saveShippingAddress(def));
      }
    }
  }, [addresses, selectedAddress, dispatch]);

  // Cart empty guard
  if (!items || items.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add some products before checking out.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleNext = () => setActiveStep((p) => p + 1);
  const handleBack = () => setActiveStep((p) => p - 1);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    dispatch(saveShippingAddress(address));
    setAddingNew(false);
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setSelectedAddress(null);
  };

  // ----- Step content -----
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {addresses.length > 0 && !addingNew && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select a shipping address
                    </h3>
                    <AddressList onAddressSelect={handleAddressSelect} />

                    {selectedAddress && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4"
                      >
                        <p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-2 flex items-center gap-1">
                          <MapPin size={13} /> Delivering to
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAddress.fullName} — {selectedAddress.mobileNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedAddress.flatOrBuilding}, {selectedAddress.locality},{" "}
                          {selectedAddress.city}, {selectedAddress.state} —{" "}
                          {selectedAddress.pincode}
                        </p>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddNew}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        + Add new address
                      </button>
                      {selectedAddress && (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Deliver here
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {addresses.length === 0 && !addingNew && (
                  <div className="text-center py-8 space-y-4">
                    <MapPin
                      size={40}
                      className="mx-auto text-gray-400 dark:text-gray-600"
                    />
                    <p className="text-gray-500 dark:text-gray-400">
                      No saved addresses. Please add one to continue.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddNew}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Add address
                    </button>
                  </div>
                )}

                {addingNew && (
                  <AddressForm
                    existingAddress={null}
                    onClose={() => setAddingNew(false)}
                    refetchAddresses={refetch}
                  />
                )}
              </>
            )}
          </div>
        );

      case 1:
        return <PaymentForm onBack={handleBack} onNext={handleNext} />;

      case 2:
        return (
          <OrderReview
            onBack={handleBack}
            selectedAddress={selectedAddress}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Custom stepper */}
        <nav aria-label="Checkout progress" className="mb-8">
          <ol className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < activeStep;
              const isCurrent = idx === activeStep;
              const isLast = idx === STEPS.length - 1;

              return (
                <li
                  key={step.label}
                  className="flex items-center flex-1 last:flex-initial"
                >
                  <div className="flex flex-col items-center gap-1.5 relative z-10">
                    <div
                      className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {!isLast && (
                    <div className="flex-1 mx-2 md:mx-4">
                      <div
                        className={`h-0.5 rounded-full transition-colors ${
                          isCompleted
                            ? "bg-green-500"
                            : "bg-gray-200 dark:bg-gray-800"
                        }`}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step content card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-8 shadow-sm"
        >
          {renderStepContent()}
        </motion.div>

        {/* Bottom trust bar */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Lock size={13} /> SSL Encrypted
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={13} /> Secure Payments
          </span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
