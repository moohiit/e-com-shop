import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  MailWarning,
  ArrowRight,
} from "lucide-react";
import {
  useLoginMutation,
  useResendVerificationMutation,
} from "../../features/auth/authApi";
import { loginSuccess } from "../../features/auth/authSlice";
import { reloadCartForUser } from "../../features/cart/cartSlice";
import { reloadWishlistForUser } from "../../features/wishlist/wishlistSlice";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();
      if (!response || !response.success) {
        throw new Error("Login failed, please try again.");
      }
      if (response.user && !response.user.isEmailVerified) {
        setShowResend(true);
        setResendEmail(data.email);
        throw new Error("Email not verified. Please verify your email.");
      }
      dispatch(loginSuccess(response));
      dispatch(reloadCartForUser());
      dispatch(reloadWishlistForUser());
      toast.success(response.message || "Logged in successfully!");
      navigate("/");
    } catch (err) {
      const backendError = err?.data?.message || err?.message || "Login failed";
      toast.error(backendError);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification({ email: resendEmail }).unwrap();
      toast.success("Verification email resent successfully!");
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to resend verification email."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="login-email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Email address
        </label>
        <div
          className={`relative flex items-center rounded-xl border transition-all ${
            errors.email
              ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900/30"
              : "border-gray-300 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
          } bg-white dark:bg-gray-900`}
        >
          <Mail
            size={16}
            className="absolute left-3.5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="login-email"
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
          htmlFor="login-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Password
        </label>
        <div
          className={`relative flex items-center rounded-xl border transition-all ${
            errors.password
              ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900/30"
              : "border-gray-300 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
          } bg-white dark:bg-gray-900`}
        >
          <Lock
            size={16}
            className="absolute left-3.5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="login-password"
            {...register("password", { required: "Password is required" })}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
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
      </div>

      {/* Remember + forgot */}
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Remember me
        </label>
        <Link
          to="/auth/forgot-password"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Forgot password?
        </Link>
      </div>

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
            Signing in…
          </>
        ) : (
          <>
            Sign In
            <ArrowRight size={16} />
          </>
        )}
      </motion.button>

      {/* Resend verification */}
      {showResend && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-3.5"
        >
          <MailWarning
            size={18}
            className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Email not verified
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              We sent a verification link to{" "}
              <span className="font-medium">{resendEmail}</span>. Haven't got
              it?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
            >
              {isResending && <Loader2 size={12} className="animate-spin" />}
              {isResending ? "Resending…" : "Resend verification email"}
            </button>
          </div>
        </motion.div>
      )}
    </form>
  );
};

export default Login;
