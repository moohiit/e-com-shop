import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useUploadSingleImageMutation } from "../../features/upload/uploadApi";
import {
  useUpdateProfileMutation,
  useUpdateProfliePasswordMutation,
} from "../../features/auth/authApi";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: updatingPassword }] = useUpdateProfliePasswordMutation();
  const [uploadImage, { isLoading: uploadingImage }] = useUploadSingleImageMutation();

  const [imagePreview, setImagePreview] = useState(user?.avatar?.imageUrl || "");

  const [editProfileMode, setEditProfileMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

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
      const res = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();
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
        toast.success(updateRes.message || "Profile image updated!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Image upload failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Profile Image */}
        <div className="relative">
          <img
            src={imagePreview}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
          />
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
            {uploadingImage ? <Loader2 className="animate-spin w-5 h-5" /> : "✎"}
          </label>
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-2">
          <p><span className="font-semibold">Email:</span> {user?.email}</p>
          <p><span className="font-semibold">Role:</span> {user?.role}</p>
          <p><span className="font-semibold">Name:</span> {user?.name}</p>

          {!editProfileMode && (
            <button
              onClick={() => setEditProfileMode(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}

          {editProfileMode && (
            <form onSubmit={handleProfileUpdate} className="space-y-4 mt-4">
              <div>
                <label className="block mb-1 text-sm">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Email</label> 
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingProfile ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={() => setEditProfileMode(false)}
                className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      {!changePasswordMode && (
        <button
          onClick={() => setChangePasswordMode(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Change Password
        </button>
      )}

      {changePasswordMode && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-2">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updatingPassword ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => setChangePasswordMode(false)}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Role-based Section */}
      {user?.role === "admin" && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mt-10">
          <h3 className="font-semibold text-lg mb-2">Admin Panel Quick Links</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><Link to="/admin" className="text-blue-600 hover:underline dark:text-blue-400">Dashboard</Link></li>
            <li><Link to="/admin/users" className="text-blue-600 hover:underline dark:text-blue-400">Manage Users</Link></li>
            <li><Link to="/admin/categories" className="text-blue-600 hover:underline dark:text-blue-400">Manage Categories</Link></li>
          </ul>
        </div>
      )}

      {user?.role === "seller" && (
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded mt-10">
          <h3 className="font-semibold text-lg mb-2">Seller Quick Links</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><Link to="/seller" className="text-yellow-700 hover:underline dark:text-yellow-300">Dashboard</Link></li>
            <li><Link to="/seller/products" className="text-yellow-700 hover:underline dark:text-yellow-300">Manage Products</Link></li>
            <li><Link to="/seller/orders" className="text-yellow-700 hover:underline dark:text-yellow-300">View Orders</Link></li>
          </ul>
        </div>
      )}

      {user?.role === "user" && (
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded mt-10">
          <h3 className="font-semibold text-lg mb-2">Your Activity</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><Link to="/orders" className="text-green-700 hover:underline dark:text-green-300">Order History</Link></li>
            <li><Link to="/wishlist" className="text-green-700 hover:underline dark:text-green-300">Wishlist</Link></li>
            <li><Link to="/profile" className="text-green-700 hover:underline dark:text-green-300">Account Settings</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}
