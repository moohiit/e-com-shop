import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Store,
  CheckCircle2,
} from "lucide-react";
import { useRegisterMutation } from "../../features/auth/authApi";

const ROLE_OPTIONS = [
  {
    value: "user",
    label: "Shopper",
    description: "Discover and buy products",
    icon: ShoppingBag,
  },
  {
    value: "seller",
    label: "Seller",
    description: "List products and manage orders",
    icon: Store,
  },
];

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
  { label: "Too weak", color: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  { label: "Weak", color: "bg-rose-400", text: "text-rose-600 dark:text-rose-400" },
  { label: "Fair", color: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-600 dark:text-lime-400" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
];

const Register = () => {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { role: "user" } });
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const pwdValue = watch("password") || "";
  const selectedRole = watch("role") || "user";
  const strength = useMemo(() => scorePassword(pwdValue), [pwdValue]);
  const meta = STRENGTH_META[strength];

  const onSubmit = async (data) => {
    try {
      const response = await registerUser(data).unwrap();
      if (response.success) {
        toast.success(response.message || "Registration successful!");
        navigate("/verify-notice", { state: { email: response.user.email } });
      }
    } catch (err) {
      toast.error(err.data?.message || "Registration failed");
    }
  };

  const inputWrap = (hasError) =>
    `relative flex items-center rounded-xl border transition-all ${
      hasError
        ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900/30"
        : "border-gray-300 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
    } bg-white dark:bg-gray-900`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="register-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Full name
        </label>
        <div className={inputWrap(!!errors.name)}>
          <User size={16} className="absolute left-3.5 text-gray-400" />
          <input
            id="register-name"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Name is too short" },
            })}
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none"
          />
        </div>
        {errors.name && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Email address
        </label>
        <div className={inputWrap(!!errors.email)}>
          <Mail size={16} className="absolute left-3.5 text-gray-400" />
          <input
            id="register-email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none"
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Password
        </label>
        <div className={inputWrap(!!errors.password)}>
          <Lock size={16} className="absolute left-3.5 text-gray-400" />
          <input
            id="register-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.password.message}
          </p>
        )}

        {/* Strength meter */}
        {pwdValue && (
          <div className="mt-2">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < strength ? meta.color : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <p className={`mt-1 text-[11px] font-medium ${meta.text}`}>
              Password strength: {meta.label}
            </p>
          </div>
        )}
      </div>

      {/* Role picker */}
      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          I want to join as
        </p>
        <input type="hidden" {...register("role")} />
        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = selectedRole === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() =>
                  setValue("role", opt.value, { shouldDirty: true })
                }
                className={`relative text-left p-3.5 rounded-xl border-2 transition-all ${
                  active
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                    active
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <p
                  className={`text-sm font-semibold ${
                    active
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {opt.description}
                </p>
                {active && (
                  <CheckCircle2
                    size={16}
                    className="absolute top-2.5 right-2.5 text-blue-600 dark:text-blue-400"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 select-none">
        <input
          type="checkbox"
          required
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          I agree to the{" "}
          <a href="/terms" className="text-blue-600 dark:text-blue-400 font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 dark:text-blue-400 font-medium">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {/* Submit */}
      <motion.button
        whileHover={{ scale: isLoading ? 1 : 1.01 }}
        whileTap={{ scale: isLoading ? 1 : 0.99 }}
        type="submit"
        disabled={isLoading}
        className="w-full relative inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={16} />
          </>
        )}
      </motion.button>
    </form>
  );
};

export default Register;
