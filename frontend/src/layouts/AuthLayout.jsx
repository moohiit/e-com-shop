import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTruck, FiShield, FiStar } from "react-icons/fi";
import logo from "../assets/Logo/logo.png";

export default function AuthLayout() {
  const location = useLocation();
  const path = location.pathname;

  const isLoginPage = path.includes("login");
  const isRegisterPage = path.includes("register");
  const isForgotPasswordPage = path.includes("forgot-password");

  let headerTitle = "";
  let headerSubtitle = "";
  let footerText = "";
  let footerLink = "";
  let footerLinkText = "";

  if (isLoginPage) {
    headerTitle = "Sign In";
    headerSubtitle = "Enter your credentials to access your account";
    footerText = "Don't have an account?";
    footerLink = "/auth/register";
    footerLinkText = "Sign up";
  } else if (isRegisterPage) {
    headerTitle = "Create Account";
    headerSubtitle = "Fill in your details to get started";
    footerText = "Already have an account?";
    footerLink = "/auth/login";
    footerLinkText = "Sign in";
  } else if (isForgotPasswordPage) {
    headerTitle = "Forgot Password";
    headerSubtitle = "Enter your email to reset your password";
    footerText = "Remember your password?";
    footerLink = "/auth/login";
    footerLinkText = "Sign in";
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-900">
      {/* Left: Brand/Info Section */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-20"></div>
        </div>

        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-400/20 blur-xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-purple-400/20 blur-xl"></div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md px-8 text-center space-y-8 z-10"
        >
          <motion.img
            src={logo}
            alt="E-commerce Illustration"
            className="w-72 mx-auto drop-shadow-2xl bg-transparent dark:bg-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <h1 className="text-4xl font-bold leading-tight">
            {isLoginPage && "Welcome Back!"}
            {isRegisterPage && "Join ShopEase Today"}
            {isForgotPasswordPage && "Reset Your Password"}
          </h1>

          <p className="text-lg opacity-90">
            {isLoginPage &&
              "Sign in to access your personalized shopping experience, order history, and saved items."}
            {isRegisterPage &&
              "Create an account to enjoy exclusive deals, faster checkout, and personalized recommendations."}
            {isForgotPasswordPage &&
              "Don't worry! We'll help you recover your account securely."}
          </p>

          <ul className="space-y-3 text-left">
            {[
              {
                icon: <FiTruck className="w-5 h-5" />,
                text: "Fast & free delivery",
              },
              {
                icon: <FiShield className="w-5 h-5" />,
                text: "Secure payments",
              },
              {
                icon: <FiStar className="w-5 h-5" />,
                text: "Exclusive member benefits",
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <span className="text-yellow-300">{item.icon}</span>
                <span className="opacity-90">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right: Auth Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-400/10"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-purple-500/10 dark:bg-purple-400/10"></div>

        <div className="w-full max-w-md px-6 py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-800/20">
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {headerTitle}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {headerSubtitle}
            </p>
          </div>

          {/* Form Content */}
          <Outlet />

          {/* Footer Links */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {footerText}{" "}
              <Link
                to={footerLink}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>

          {/* Forgot Password Link on Login Page */}
          {isLoginPage && (
            <div className="mt-4 text-center">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          {/* Social Auth */}
          {!isForgotPasswordPage && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.667-4.146-2.675-6.735-2.675-5.523 0-10 4.477-10 10s4.477 10 10 10c8.396 0 10-7.496 10-10 0-0.67-0.069-1.325-0.189-1.961h-9.811z"></path>
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                  </svg>
                  Facebook
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
