import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  useLoginMutation,
  useResendVerificationMutation,
} from "../../features/auth/authApi";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../features/auth/authSlice";
import { useState } from "react";

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

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();

      if (!response || !response.success) {
        throw new Error("Login failed, please try again.");
      }

      dispatch(loginSuccess(response));
      toast.success(response.message || "Logged in successfully!");
      navigate("/");
    } catch (err) {
      const backendError = err?.data?.message || err?.message || "Login failed";

      toast.error(backendError);

      // Handle unverified email
      if (err?.data?.allowResend && data.email) {
        setShowResend(true);
        setResendEmail(data.email);
      }
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification({ email: resendEmail }).unwrap();
      toast.success("Verification email resent successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.data?.message || "Failed to resend verification email."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-1">Email</label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </motion.button>
      </form>

      {showResend && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-red-500 mb-2 text-center">
            Your email is not verified.
          </p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend Verification Email"}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Login;
