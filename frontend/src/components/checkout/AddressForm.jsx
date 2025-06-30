import { useState, useEffect } from "react";
import { useCreateAddressMutation, useUpdateAddressMutation } from "../../features/address/addressApiSlice";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

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

      if (refetchAddresses) refetchAddresses(); // force refresh
      if (onClose) onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save address");
    }
  };


  return (
    <motion.form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg dark:bg-gray-800">
      {/* Contact Info */}
      <div>
        <label>Full Name</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label>Mobile Number</label>
        <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>

      {/* Address Info */}
      <div>
        <label>Flat No. / Building Name</label>
        <input name="flatOrBuilding" value={form.flatOrBuilding} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label>Locality / Area / Street</label>
        <input name="locality" value={form.locality} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label>City</label>
        <input name="city" value={form.city} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label>State</label>
        <input name="state" value={form.state} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label>Pincode</label>
        <input name="pincode" value={form.pincode} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label>Landmark (Optional)</label>
        <input name="landmark" value={form.landmark} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      {/* Address Type */}
      <div>
        <label>Address Type</label>
        <select name="addressType" value={form.addressType} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="home">Home</option>
          <option value="office">Office</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Default Address */}
      <div className="flex items-center">
        <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} className="mr-2" />
        <label>Set as Default Address</label>
      </div>

      <motion.button whileHover={{ scale: 1.02 }} type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
        {existingAddress ? "Update Address" : "Add Address"}
      </motion.button>
    </motion.form>
  );
};

export default AddressForm;
