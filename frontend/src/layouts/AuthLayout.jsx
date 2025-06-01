import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Outlet />
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          {location.pathname.includes('login') ? (
            <>Don't have an account? <Link to="/auth/register" className="text-blue-600">Register</Link></>
          ) : (
            <>Already have an account? <Link to="/auth/login" className="text-blue-600">Login</Link></>
          )}
        </p>
      </div>
    </div>
  )
}