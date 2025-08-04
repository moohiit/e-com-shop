import { useState } from "react";
import AddressForm from "../../components/checkout/AddressForm";
import AddressList from "../../components/checkout/AddressList";
import { useGetAddressesQuery } from "../../features/address/addressApiSlice";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";

const ManageAddresses = () => {
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const { refetch } = useGetAddressesQuery();

  const toggleForm = () => {
    setEditAddress(null);
    setShowForm(!showForm);
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setShowForm(true);
  };

  return (
    <div className="p-4 sm:p-6 dark:text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Addresses</h2>
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close" : "Add New Address"}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6"
        >
          <AddressForm
            existingAddress={editAddress}
            onClose={() => {
              setShowForm(false);
              setEditAddress(null);
            }}
            refetchAddresses={refetch}
          />
        </motion.div>
      )}

      <AddressList
        onAddressSelect={() => {}}
        onEdit={(addr) => handleEdit(addr)}
      />
    </div>
  );
};

export default ManageAddresses;
