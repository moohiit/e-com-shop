import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { saveShippingAddress } from '../../features/cart/cartSlice';
import { motion } from 'framer-motion';

const AddressForm = ({ onNext }) => {
  const dispatch = useDispatch();
  const [address, setAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress(address));
    onNext();
  };

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={address.fullName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={address.address}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>City</label>
        <input
          type="text"
          name="city"
          value={address.city}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Postal Code</label>
        <input
          type="text"
          name="postalCode"
          value={address.postalCode}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Country</label>
        <input
          type="text"
          name="country"
          value={address.country}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded"
      >
        Continue
      </motion.button>
    </motion.form>
  );
};

export default AddressForm;
