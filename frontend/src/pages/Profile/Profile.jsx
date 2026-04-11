import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Pencil,
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Check,
  Camera,
  LayoutDashboard,
  Package,
  Users,
  Tags,
  ShoppingBag,
  Heart,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { updateProfile as updateProfileAction } from "../../features/auth/authSlice";
import { useUploadSingleImageMutation } from "../../features/upload/uploadApi";
import {
  useUpdateProfileMutation,
  useUpdateProfliePasswordMutation,
} from "../../features/auth/authApi";

const roleAccent = {
  admin: {
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    ring: "ring-indigo-200 dark:ring-indigo-800",
    chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  seller: {
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    ring: "ring-amber-200 dark:ring-amber-800",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  user: {
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    ring: "ring-blue-200 dark:ring-blue-800",
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
};

const initialsFor = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const scorePassword = (pwd = "") => {
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return Math.min(score, 4);
};

const STRENGTH_META = [
  { label: "Too weak", color: "bg-rose-500", text: "text-rose-500" },
  { label: "Weak", color: "bg-rose-400", text: "text-rose-500" },
  { label: "Fair", color: "bg-amber-400", text: "text-amber-500" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-500" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" },
];

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [imagePreview, setImagePreview] = useState(user?.avatar?.imageUrl || "");
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: updatingPassword }] = useUpdateProfliePasswordMutation();
  const [uploadImage, { isLoading: uploadingImage }] = useUploadSingleImageMutation();

  const role = user?.role || "user";
  const accent = roleAccent[role] || roleAccent.user;
  const strength = scorePassword(newPassword);
  const strengthMeta = STRENGTH_META[strength];

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
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 text-gray-800 dark:text-gray-100">
      {/* Gradient hero header */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${accent.gradient} p-6 md:p-10 text-white shadow-xl`}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white/20 backdrop-blur p-1 shadow-2xl">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={user?.name}
                  className="w-full h-full rounded-full object-cover border-4 border-white/70"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/25 flex items-center justify-center text-4xl font-bold border-4 border-white/70">
                  {initialsFor(user?.name)}
                </div>
              )}
            </div>
            <label
              title="Change profile picture"
              className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
            >
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl md:text-3xl font-bold truncate">
                {user?.name || "Guest"}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck size={12} />
                {role}
              </span>
            </div>
            <p className="mt-1 text-white/90 text-sm md:text-base truncate">
              {user?.email}
            </p>
            {user?.isEmailVerified !== undefined && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
                {user.isEmailVerified ? (
                  <>
                    <Check size={13} /> Email verified
                  </>
                ) : (
                  <>
                    <X size={13} /> Email not verified
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: account + password */}
        <div className="lg:col-span-8 space-y-6">
          {/* Account info card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={16} /> Account Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Your personal details shown across ShopEase.
                </p>
              </div>
              {!editProfileMode ? (
                <button
                  type="button"
                  onClick={() => setEditProfileMode(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditProfileMode(false);
                    setName(user?.name || "");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <X size={13} /> Cancel
                </button>
              )}
            </div>

            <div className="p-5 md:p-6">
              {!editProfileMode ? (
                <div className="grid md:grid-cols-2 gap-5">
                  <Field
                    icon={User}
                    label="Full name"
                    value={user?.name || "—"}
                  />
                  <Field
                    icon={Mail}
                    label="Email"
                    value={user?.email || "—"}
                  />
                  <Field
                    icon={Shield}
                    label="Account role"
                    value={
                      <span className="capitalize">{role}</span>
                    }
                  />
                  <Field
                    icon={ShieldCheck}
                    label="Email verification"
                    value={
                      user?.isEmailVerified ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Verified
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          Pending
                        </span>
                      )
                    }
                  />
                </div>
              ) : (
                <form
                  onSubmit={handleProfileUpdate}
                  className="space-y-4 max-w-xl"
                >
                  <InputField
                    id="profile-name"
                    label="Full name"
                    icon={User}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <InputField
                    id="profile-email"
                    label="Email"
                    icon={Mail}
                    value={email}
                    type="email"
                    disabled
                    hint="Email cannot be changed."
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {updatingProfile ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Save size={15} />
                      )}
                      {updatingProfile ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditProfileMode(false);
                        setName(user?.name || "");
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Security / password card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock size={16} /> Security
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Keep your account safe with a strong password.
                </p>
              </div>
              {!changePasswordMode ? (
                <button
                  type="button"
                  onClick={() => setChangePasswordMode(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Lock size={13} /> Change Password
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordMode(false);
                    setCurrentPassword("");
                    setNewPassword("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <X size={13} /> Cancel
                </button>
              )}
            </div>

            <div className="p-5 md:p-6">
              {!changePasswordMode ? (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Password protected
                    </p>
                    <p className="text-xs">
                      For your security, we never display your current password.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 max-w-xl"
                >
                  <PasswordField
                    id="current-password"
                    label="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    show={showCurrent}
                    onToggle={() => setShowCurrent((v) => !v)}
                  />
                  <div>
                    <PasswordField
                      id="new-password"
                      label="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      show={showNew}
                      onToggle={() => setShowNew((v) => !v)}
                    />
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                i < strength
                                  ? strengthMeta.color
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                        <p
                          className={`mt-1 text-[11px] font-medium ${strengthMeta.text}`}
                        >
                          Password strength: {strengthMeta.label}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {updatingPassword ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Save size={15} />
                      )}
                      {updatingPassword ? "Saving…" : "Update Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChangePasswordMode(false);
                        setCurrentPassword("");
                        setNewPassword("");
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right column: quick links */}
        <div className="lg:col-span-4">
          <QuickLinks role={role} accent={accent} />
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 flex items-center justify-center shrink-0">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function InputField({ id, label, icon: Icon, hint, disabled, ...rest }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border transition-all ${
          disabled
            ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
        }`}
      >
        <Icon size={16} className="absolute left-3.5 text-gray-400" />
        <input
          id={id}
          disabled={disabled}
          className={`w-full pl-10 pr-3.5 py-2.5 bg-transparent text-sm rounded-xl focus:outline-none ${
            disabled
              ? "text-gray-500 cursor-not-allowed"
              : "text-gray-900 dark:text-gray-100"
          }`}
          {...rest}
        />
      </div>
      {hint && (
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>
      <div className="relative flex items-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30">
        <Lock size={16} className="absolute left-3.5 text-gray-400" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          placeholder="••••••••"
          className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function QuickLinks({ role, accent }) {
  const config = {
    admin: {
      title: "Admin Panel",
      subtitle: "Manage the entire platform.",
      links: [
        { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/users", label: "Manage Users", icon: Users },
        { to: "/admin/products", label: "Products", icon: Package },
        { to: "/admin/categories", label: "Categories", icon: Tags },
      ],
    },
    seller: {
      title: "Seller Panel",
      subtitle: "Grow your business.",
      links: [
        { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/seller/products", label: "Manage Products", icon: Package },
        { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
        { to: "/seller/inventory", label: "Inventory", icon: Tags },
      ],
    },
    user: {
      title: "Your Activity",
      subtitle: "Quick shortcuts for your account.",
      links: [
        { to: "/my-orders", label: "Order History", icon: ShoppingBag },
        { to: "/wishlist", label: "Wishlist", icon: Heart },
        { to: "/addresses", label: "Manage Addresses", icon: MapPin },
      ],
    },
  };

  const cfg = config[role] || config.user;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden sticky top-24">
      <div
        className={`relative overflow-hidden p-5 bg-gradient-to-br ${accent.gradient} text-white`}
      >
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <h3 className="text-base font-bold">{cfg.title}</h3>
          <p className="text-xs text-white/85 mt-0.5">{cfg.subtitle}</p>
        </div>
      </div>
      <ul className="p-3 space-y-1">
        {cfg.links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={14} />
                </span>
                {label}
              </span>
              <ArrowRight
                size={14}
                className="text-gray-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
