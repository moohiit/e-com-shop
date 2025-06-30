import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Stepper, Step, StepLabel } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddressForm from '../../components/checkout/AddressForm';
import PaymentForm from '../../components/checkout/PaymentForm';
import OrderReview from '../../components/checkout/OrderReview';
import AddressList from '../../components/checkout/AddressList';
import { useGetAddressesQuery } from '../../features/address/addressApiSlice';
import { saveShippingAddress } from '../../features/cart/cartSlice';

const steps = ['Shipping Address', 'Payment Details', 'Review Order'];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const { data: response, isLoading, refetch } = useGetAddressesQuery();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const addresses = response?.addresses || [];

  // Automatically select default address if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        dispatch(saveShippingAddress(defaultAddress));
      }
    }
  }, [addresses, selectedAddress, dispatch]);

  // If cart is empty, redirect or show a message
  if (!items || items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen text-center p-4"
      >
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty!</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Go to Shopping
        </button>
      </motion.div>
    );
  }

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    dispatch(saveShippingAddress(address));
    setAddingNew(false);
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setSelectedAddress(null);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            {isLoading ? (
              <p>Loading addresses...</p>
            ) : (
              <>
                {addresses.length > 0 && !addingNew && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select a Shipping Address</h3>
                    <AddressList
                      onAddressSelect={handleAddressSelect}
                    />

                    {selectedAddress && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        <p><strong>Selected Address:</strong></p>
                        <p>{selectedAddress.fullName} - {selectedAddress.mobileNumber}</p>
                        <p>{selectedAddress.flatOrBuilding}, {selectedAddress.locality}, {selectedAddress.city}</p>
                        <p>{selectedAddress.state} - {selectedAddress.pincode}</p>
                        <p>Type: {selectedAddress.addressType}</p>
                      </motion.div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={handleAddNew}
                        className="bg-blue-600 text-white py-2 px-4 rounded"
                      >
                        Add New Address
                      </button>
                      {selectedAddress && (
                        <button
                          onClick={handleNext}
                          className="bg-green-600 text-white py-2 px-4 rounded"
                        >
                          Deliver to This Address
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {addresses.length === 0 && !addingNew && (
                  <div className="space-y-4">
                    <p>No saved addresses found. Please add a new address.</p>
                    <button
                      onClick={handleAddNew}
                      className="bg-blue-600 text-white py-2 px-4 rounded"
                    >
                      Add Address
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
        return <OrderReview onBack={handleBack} selectedAddress={selectedAddress} />;

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12"
    >
      <Stepper activeStep={activeStep} alternativeLabel className="mb-8">
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        {getStepContent(activeStep)}
      </div>
    </motion.div>
  );
};

export default Checkout;
