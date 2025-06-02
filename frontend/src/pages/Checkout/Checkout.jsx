import { useState } from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';
import AddressForm from '../../components/checkout/AddressForm';
import PaymentForm from '../../components/checkout/PaymentForm';
import OrderReview from '../../components/checkout/OrderReview';
import { motion } from 'framer-motion';

const steps = ['Shipping Address', 'Payment Details', 'Review Order'];

export const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  const getStepContent = (step) => {
    switch (step) {
      case 0: return <AddressForm onNext={handleNext} />;
      case 1: return <PaymentForm onBack={handleBack} onNext={handleNext} />;
      case 2: return <OrderReview onBack={handleBack} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12"
    >
      <Stepper activeStep={activeStep} alternativeLabel className="mb-8">
        {steps.map(label => (
          <Step key={label}>
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