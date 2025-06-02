import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-900">
      {/* Left: Info/Brand Section */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md text-center space-y-6"
        >
          <img
            src="https://illustrations.popsy.co/gray/ecommerce.svg"
            alt="E-commerce Illustration"
            className="w-60 mx-auto mb-4 drop-shadow-lg"
          />

          <h1 className="text-4xl font-bold">Welcome to ShopEase</h1>

          <p className="text-lg">
            Discover the best products at unbeatable prices. Join thousands of happy customers who trust ShopEase for a seamless shopping experience.
          </p>

          <ul className="list-disc list-inside text-left text-sm opacity-90">
            <li>Fast & secure checkout</li>
            <li>Exclusive member discounts</li>
            <li>Easy returns and support</li>
          </ul>
        </motion.div>
      </div>

      {/* Right: Auth Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-900"
      >
        <div className="w-full max-w-md">
          <Outlet />
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            {location.pathname.includes('login') ? (
              <>
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-blue-600 hover:underline">
                  Register
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/auth/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
