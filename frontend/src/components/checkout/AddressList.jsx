import { useState } from 'react';
import { useGetAddressesQuery, useDeleteAddressMutation } from '../../features/address/addressApiSlice';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AddressList = ({ onAddressSelect }) => {
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
          className={`p-4 border rounded-lg cursor-pointer ${selectedId === address._id ? 'border-blue-600' : 'border-gray-300'}`}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleSelect(address)}
        >
          <div className="flex justify-between">
            <div>
              <p><strong>{address.fullName}</strong> - {address.mobileNumber}</p>
              <p>{address.flat}, {address.locality}, {address.city}</p>
              <p>{address.state} - {address.pincode}</p>
              {address.landmark && <p>Landmark: {address.landmark}</p>}
              <p>Type: {address.addressType}</p>
              {address.isDefault && <span className="text-green-600 font-medium">Default</span>}
            </div>
            <div className="space-x-2">
              {/* You can link this to an Address Edit form */}
              <button className="text-blue-600" onClick={(e) => { e.stopPropagation(); /* Trigger edit */ }}>Edit</button>
              <button className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(address._id); }}>Delete</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AddressList;
