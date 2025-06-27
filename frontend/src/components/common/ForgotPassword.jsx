import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSendOtpMutation, useVerifyOtpMutation, useResetPasswordMutation } from "../../features/auth/authApi";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: resettingPassword }] = useResetPasswordMutation();

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await sendOtp({ email }).unwrap();
      toast.success(res.message || "OTP sent successfully.");
      setStep(2);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyOtp({ email, otp }).unwrap();
      toast.success(res.message || "OTP verified.");
      setStep(3);
    } catch (err) {
      toast.error(err?.data?.message || "Invalid OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await resetPassword({ email, otp, newPassword }).unwrap();
      toast.success(res.message || "Password reset successfully.");
      navigate("/auth/login");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block mb-1">Enter your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={sendingOtp}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {sendingOtp ? "Sending OTP..." : "Send OTP"}
          </motion.button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block mb-1">Enter OTP sent to {email}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={verifyingOtp}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {verifyingOtp ? "Verifying..." : "Verify OTP"}
          </motion.button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block mb-1">Enter New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={resettingPassword}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {resettingPassword ? "Resetting..." : "Reset Password"}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
