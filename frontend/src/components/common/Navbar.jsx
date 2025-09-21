import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../theme/ThemeProvider";
import { motion } from "framer-motion";
import logo from "../../assets/Logo/logo.png";
import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaHome,
  FaStore,
  FaInfoCircle,
  FaPhoneAlt,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaTachometerAlt,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { logoutUser } from "../../features/auth/authSlice";

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist); // Get wishlist from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    try {
      dispatch(logoutUser());
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: <FaHome className="mr-2" /> },
    { name: "Shop", path: "/products", icon: <FaStore className="mr-2" /> },
    { name: "About", path: "/about", icon: <FaInfoCircle className="mr-2" /> },
    {
      name: "Contact",
      path: "/contact",
      icon: <FaPhoneAlt className="mr-2" />,
    },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/" className="flex items-center">
              <motion.img
                src={logo}
                alt="E-commerce Illustration"
                className="w-12 drop-shadow-2xl bg-transparent dark:bg-transparent"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  backgroundColor: "transparent",
                }}
              />
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* SearchBar */}
          <div className="hidden md:block w-1/3 mx-4">
            <SearchBar />
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-5">
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {user && user.role === "user" && (
              <>
                <Link to="/wishlist" className="relative group">
                  <FaHeart
                    size={18}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-pink-500 transition-colors"
                  />
                  {wishlistItems?.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative group">
                  <FaShoppingCart
                    size={18}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors"
                  />
                  {cartItems?.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FaUser size={16} />
                  <span className="font-medium">
                    {user?.name?.split(" ")[0] || "Unknown"}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-md py-1 z-50 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <FaUser className="inline mr-2" />
                    My Profile
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <FaTachometerAlt className="inline mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === "seller" && (
                    <Link
                      to="/seller/dashboard"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <FaTachometerAlt className="inline mr-2" />
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <FaSignOutAlt className="inline mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  <FaSignInAlt className="mr-1" />
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaUserPlus className="mr-1" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4"
          >
            <div className="mb-4">
              <SearchBar />
            </div>
            <nav className="flex flex-col space-y-2 pb-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                      isActive
                        ? "font-medium text-blue-600 dark:text-blue-400"
                        : ""
                    }`
                  }
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}

              <button
                onClick={toggleTheme}
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {darkMode ? (
                  <FaSun className="mr-2" />
                ) : (
                  <FaMoon className="mr-2" />
                )}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>

              {user && user.role === "user" && (
                <div className="flex items-center space-x-4 px-3">
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative"
                  >
                    <FaHeart size={18} />
                    {wishlistItems?.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative"
                  >
                    <FaShoppingCart size={18} />
                    {cartItems?.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {user ? (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2"
                  >
                    My Profile
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === "seller" && (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2"
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700 px-3">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-blue-600 text-white rounded-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Navbar;