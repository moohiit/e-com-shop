import { updateProfile as updateProfileAction } from "../../features/auth/authSlice";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, Pencil } from "lucide-react";
import { useUploadSingleImageMutation } from "../../features/upload/uploadApi";
import {
  useUpdateProfileMutation,
  useUpdateProfliePasswordMutation,
} from "../../features/auth/authApi";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: updatingPassword }] = useUpdateProfliePasswordMutation();
  const [uploadImage, { isLoading: uploadingImage }] = useUploadSingleImageMutation();

  const [imagePreview, setImagePreview] = useState(user?.avatar?.imageUrl || "");
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const dispatch = useDispatch();
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ name }).unwrap();
      toast.success(res.message || "Profile updated successfully!");
      setEditProfileMode(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Both current and new passwords are required");
      return;
    }

    try {
      const res = await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success(res.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setChangePasswordMode(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to change password");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadImage({ formData, folder: "User" }).unwrap();
      setImagePreview(res.image.imageUrl || "");
      if (res.success) {
        const updateRes = await updateProfile({ avatar: res.image }).unwrap();
        console.log("Profile image updated:", updateRes);
        // Dispatch the updateProfile action to update the Redux state
        if (updateRes.success) {
          dispatch(updateProfileAction(updateRes.user));
          toast.success(updateRes.message || "Profile image updated successfully!");
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "Image upload failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-36 h-36">
            <img
              src={imagePreview}
              alt="Profile"
              className="w-36 h-36 object-cover rounded-full border-4 border-blue-600"
            />
            <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700">
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
              {uploadingImage ? <Loader2 className="animate-spin w-4 h-4" /> : <Pencil size={16} />}
            </label>
          </div>

          <div className="text-center">
            <p className="text-lg font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <p className="text-sm mt-1 capitalize text-gray-500 dark:text-gray-400">Role: {user?.role}</p>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {!editProfileMode ? (
            <button
              onClick={() => setEditProfileMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-2 border bg-gray-200 cursor-not-allowed rounded dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingProfile ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditProfileMode(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Change Password */}
          <div className="mt-8">
            {!changePasswordMode ? (
              <button
                onClick={() => setChangePasswordMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Change Password</h2>

                <div>
                  <label className="block text-sm mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updatingPassword ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangePasswordMode(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Role-specific Quick Links */}
      <div className="mt-10">
        {user?.role === "admin" && (
          <RoleLinks
            title="Admin Panel"
            links={[
              { to: "/admin/dashboard", label: "Dashboard" },
              { to: "/admin/users", label: "Manage Users" },
              { to: "/admin/categories", label: "Manage Categories" },
            ]}
            color="blue"
          />
        )}

        {user?.role === "seller" && (
          <RoleLinks
            title="Seller Panel"
            links={[
              { to: "/seller", label: "Dashboard" },
              { to: "/seller/products", label: "Manage Products" },
              { to: "/seller/orders", label: "Orders" },
            ]}
            color="yellow"
          />
        )}

        {user?.role === "user" && (
          <RoleLinks
            title="Your Activity"
            links={[
              { to: "/my-orders", label: "Order History" },
              { to: "/wishlist", label: "Wishlist" },
              { to: "/addresses", label: "Manage Addresses" },
            ]}
            color="green"
          />
        )}
      </div>
    </div>
  );
}

function RoleLinks({ title, links, color = "blue" }) {
  const bg = {
    blue: "bg-blue-50 dark:bg-blue-900",
    yellow: "bg-yellow-50 dark:bg-yellow-900",
    green: "bg-green-50 dark:bg-green-900",
  }[color];

  const text = {
    blue: "text-blue-600 dark:text-blue-300",
    yellow: "text-yellow-700 dark:text-yellow-300",
    green: "text-green-700 dark:text-green-300",
  }[color];

  return (
    <div className={`${bg} p-5 rounded-lg mb-4`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ul className="list-disc pl-5 space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={`hover:underline ${text}`}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
