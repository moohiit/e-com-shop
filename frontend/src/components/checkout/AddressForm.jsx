import { useState, useEffect } from "react";
import { 
  useCreateAddressMutation, 
  useUpdateAddressMutation 
} from "../../features/address/addressApiSlice";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { FaHome, FaBuilding, FaMapMarkerAlt } from "react-icons/fa";

const AddressForm = ({ existingAddress, onClose, refetchAddresses }) => {
  const [createAddress] = useCreateAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();

  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    flatOrBuilding: "",
    locality: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    landmark: "",
    addressType: "home",
    isDefault: false,
  });

  useEffect(() => {
    if (existingAddress) {
      setForm(existingAddress);
    }
  }, [existingAddress]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingAddress) {
        await updateAddress({ id: existingAddress._id, addressData: form }).unwrap();
        toast.success("Address updated successfully");
      } else {
        await createAddress(form).unwrap();
        toast.success("Address added successfully");
      }
      if (refetchAddresses) refetchAddresses();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save address");
    }
  };

  const getAddressTypeIcon = () => {
    switch(form.addressType) {
      case 'home': return <FaHome className="mr-2" />;
      case 'office': return <FaBuilding className="mr-2" />;
      default: return <FaMapMarkerAlt className="mr-2" />;
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        {existingAddress ? "Edit Address" : "Add New Address"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mobile Number
          </label>
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        {/* Address Info */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Flat/Building
          </label>
          <input
            name="flatOrBuilding"
            value={form.flatOrBuilding}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Locality/Street
          </label>
          <input
            name="locality"
            value={form.locality}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            City
          </label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            State
          </label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Country
          </label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pincode
          </label>
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Landmark (Optional)
          </label>
          <input
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Address Type
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {getAddressTypeIcon()}
            </div>
            <select
              name="addressType"
              value={form.addressType}
              onChange={handleChange}
              className="pl-10 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Set as Default Address
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onClose && (
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </motion.button>
        )}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          {existingAddress ? "Update Address" : "Add Address"}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default AddressForm;