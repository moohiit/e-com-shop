import { FaLock } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const AccessDenied = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <FaLock size={50} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  )
}

export default AccessDenied
