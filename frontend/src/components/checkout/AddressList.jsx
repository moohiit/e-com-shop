import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Home,
  Building2,
  MapPin,
  Pencil,
  Trash2,
  Phone,
  Star,
  Check,
} from "lucide-react";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
} from "../../features/address/addressApiSlice";
import Loader from "../common/LoadingSpinner";

const typeMeta = {
  home: {
    label: "Home",
    icon: Home,
    accent:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  office: {
    label: "Office",
    icon: Building2,
    accent:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
};

const defaultMeta = {
  label: "Other",
  icon: MapPin,
  accent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const AddressList = ({ onAddressSelect, onEdit }) => {
  const { data: response, isLoading, refetch } = useGetAddressesQuery();
  const [selectedId, setSelectedId] = useState(null);
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [deletingId, setDeletingId] = useState(null);

  const addresses = response?.addresses || [];

  const handleSelect = (address) => {
    setSelectedId(address._id);
    if (onAddressSelect) onAddressSelect(address);
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteAddress(id).unwrap();
      toast.success("Address deleted");
      if (id === selectedId) setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <Loader />;

  if (addresses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center">
          <MapPin size={20} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No addresses found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => {
        const meta = typeMeta[address.addressType] || defaultMeta;
        const Icon = meta.icon;
        const selected = selectedId === address._id;
        const selectable = typeof onAddressSelect === "function";

        return (
          <motion.div
            key={address._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => handleSelect(address)}
            className={`relative p-5 rounded-2xl border-2 transition-all bg-white dark:bg-gray-900 shadow-sm ${
              selectable ? "cursor-pointer" : ""
            } ${
              selected
                ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/40 shadow-md"
                : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md"
            }`}
          >
            {/* Selected tick */}
            {selected && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow">
                <Check size={14} />
              </div>
            )}

            {/* Top: type + default chip */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${meta.accent}`}
              >
                <Icon size={12} />
                {meta.label}
              </div>
              {address.isDefault && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  <Star size={10} className="fill-white" /> Default
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
              {address.fullName}
            </h3>

            {/* Address lines */}
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p className="line-clamp-2">
                {address.flatOrBuilding}, {address.locality}
              </p>
              <p>
                {address.city}, {address.state} - {address.pincode}
              </p>
              {address.country && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {address.country}
                </p>
              )}
              {address.landmark && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Landmark: {address.landmark}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Phone size={14} className="text-gray-400" />
              <span className="font-medium">{address.mobileNumber}</span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(address);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(address._id);
                }}
                disabled={isDeleting && deletingId === address._id}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
              >
                <Trash2 size={12} />
                {isDeleting && deletingId === address._id
                  ? "Deleting…"
                  : "Delete"}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AddressList;
