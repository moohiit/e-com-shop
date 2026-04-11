import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, MapPin, Home, Building2 } from "lucide-react";
import AddressForm from "../../components/checkout/AddressForm";
import AddressList from "../../components/checkout/AddressList";
import { useGetAddressesQuery } from "../../features/address/addressApiSlice";

const ManageAddresses = () => {
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const { data, refetch } = useGetAddressesQuery();

  const addresses = data?.addresses || [];
  const defaultCount = addresses.filter((a) => a.isDefault).length;
  const homeCount = addresses.filter((a) => a.addressType === "home").length;
  const officeCount = addresses.filter((a) => a.addressType === "office").length;

  const toggleForm = () => {
    setEditAddress(null);
    setShowForm((v) => !v);
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setShowForm(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Gradient hero */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/80">
                  Delivery
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Saved Addresses
                </h1>
              </div>
            </div>
            <p className="text-sm text-white/90 max-w-lg">
              Add the places where you'd like ShopEase to deliver. Your default
              address is used automatically at checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-sm shadow-lg hover:bg-gray-50 transition-colors"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Close" : "Add New Address"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatTile
          label="Total"
          value={addresses.length}
          icon={MapPin}
          accent="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
        />
        <StatTile
          label="Home"
          value={homeCount}
          icon={Home}
          accent="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
        />
        <StatTile
          label="Office"
          value={officeCount}
          icon={Building2}
          accent="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300"
        />
      </div>

      {defaultCount === 0 && addresses.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              No default address set
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Mark one address as default so ShopEase can preselect it at
              checkout.
            </p>
          </div>
        </div>
      )}

      {/* Form (collapsible) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="address-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 md:p-6">
              <h2 className="text-base font-bold mb-4 text-gray-900 dark:text-white">
                {editAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <AddressForm
                existingAddress={editAddress}
                onClose={() => {
                  setShowForm(false);
                  setEditAddress(null);
                }}
                refetchAddresses={refetch}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MapPin size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            No addresses yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add your first delivery address and we'll use it automatically at
            checkout.
          </p>
          <button
            type="button"
            onClick={toggleForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} /> Add Your First Address
          </button>
        </div>
      ) : (
        <AddressList
          onAddressSelect={() => {}}
          onEdit={(addr) => handleEdit(addr)}
        />
      )}
    </div>
  );
};

function StatTile({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-1 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

export default ManageAddresses;
