// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ThemeToggle from './ThemeToggle';
import { logout } from '../features/auth/authSlice';

export default function Header() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => dispatch(logout());

  return (
    <header className="flex items-center justify-between p-4 shadow-md bg-white dark:bg-gray-900">
      <Link to="/" className="text-xl font-bold">E-Shop</Link>
      <nav className="flex items-center gap-4">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        {user?.role === 'admin' && <Link to="/admin/dashboard">Admin</Link>}
        {user?.role === 'seller' && <Link to="/seller/dashboard">Seller</Link>}
        {user?.role === 'user' && <Link to="/cart">Cart</Link>}
        <ThemeToggle />
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
