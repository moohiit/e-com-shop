import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useRegisterMutation } from '../../features/auth/authApi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    try {
      await registerUser(data).unwrap();
      toast.success('Registered successfully!');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.data?.message || 'Registration failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-center mb-8">Create an Account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-1">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            {...register('email', { required: 'Email is required' })}
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            {...register('password', { required: 'Password is required' })}
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Role (optional)</label>
          <select
            {...register('role')}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            defaultValue="user"
          >
            <option value="" disabled>
              Select role (optional)
            </option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Register;
