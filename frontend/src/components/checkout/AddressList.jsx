import { useState } from 'react';
import { 
  useGetAddressesQuery, 
  useDeleteAddressMutation 
} from '../../features/address/addressApiSlice';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaHome, FaBuilding, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import Loader  from '../../components/common/LoadingSpinner';

const AddressList = ({ onAddressSelect, onEdit }) => {
  const { data: response, isLoading, refetch } = useGetAddressesQuery();
  const [selectedId, setSelectedId] = useState(null);
  const [deleteAddress] = useDeleteAddressMutation();

  const handleSelect = (address) => {
    setSelectedId(address._id);
    if (onAddressSelect) onAddressSelect(address);
  };

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

  const addresses = response?.addresses || [];

  const getAddressTypeIcon = (type) => {
    switch(type) {
      case 'home': return <FaHome className="mr-1" />;
      case 'office': return <FaBuilding className="mr-1" />;
      default: return <FaMapMarkerAlt className="mr-1" />;
    }
  };

  if (isLoading) return <Loader />;

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No addresses found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <motion.div
          key={address._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedId === address._id 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" 
              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
          onClick={() => handleSelect(address)}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {address.fullName}
                  {address.isDefault && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                      Default
                    </span>
                  )}
                </h3>
                <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  {getAddressTypeIcon(address.addressType)}
                  {address.addressType}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {address.flatOrBuilding}, {address.locality}, {address.city}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {address.state} - {address.pincode}, {address.country}
              </p>
              {address.landmark && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Landmark: {address.landmark}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Mobile: {address.mobileNumber}
              </p>
            </div>

            <div className="flex sm:flex-col gap-2 sm:gap-1 items-start sm:items-end">
              <button
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(address);
                }}
              >
                <FaEdit className="mr-1" /> Edit
              </button>
              <button
                className="flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(address._id);
                }}
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AddressList;