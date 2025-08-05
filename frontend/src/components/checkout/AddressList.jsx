import { useState } from 'react';
import { useGetAddressesQuery, useDeleteAddressMutation } from '../../features/address/addressApiSlice';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AddressList = ({ onAddressSelect, onEdit }) => {
  const { data: response, isLoading, refetch } = useGetAddressesQuery();
  const [selectedId, setSelectedId] = useState(null);
  const [deleteAddress] = useDeleteAddressMutation();

  const handleSelect = (address) => {
    setSelectedId(address._id);
    onAddressSelect(address);
  };
  const addresses = response?.addresses || [];
  const handleDelete = async (id) => {
    try {
      await deleteAddress(id).unwrap();
      toast.success('Address deleted successfully');
      if (id === selectedId) setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete address');
    }
  };

  if (isLoading) return <p>Loading addresses...</p>;

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <motion.div
          key={address._id}
          className={`p-4 border rounded-lg cursor-pointer ${
            selectedId === address._id ? "border-blue-600" : "border-gray-300"
          } dark:border-gray-700`}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleSelect(address)}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <p>
                <strong>{address.fullName}</strong> - {address.mobileNumber}
              </p>
              <p>
                {address.flatOrBuilding}, {address.locality}, {address.city}
              </p>
              <p>
                {address.state} - {address.pincode}, {address.country}
              </p>
              {address.landmark && <p>Landmark: {address.landmark}</p>}
              <p>Type: {address.addressType}</p>
              {address.isDefault && (
                <span className="text-green-600 font-medium">Default</span>
              )}
            </div>
            <div className="flex gap-2 items-start sm:items-center">
              <button
                className="text-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(address);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(address._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AddressList;
