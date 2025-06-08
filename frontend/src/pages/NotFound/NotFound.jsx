import { Link, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <FaExclamationTriangle size={50} className="text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Sorry, the page you are looking for does not exist.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Go Back
        </button>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
