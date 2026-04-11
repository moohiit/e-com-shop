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
import { MessageCircle, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { logoutUser } from "../../features/auth/authSlice";
import { usePurchaseMode, clearPurchaseMode } from "../../hooks/usePurchaseMode";

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Purchase mode: shared via hook so route guards stay in sync
  const [purchaseMode, , togglePurchaseMode] = usePurchaseMode();

  // Only show purchase-mode toggle for seller and admin
  const isNonUserRole = user?.role === "seller" || user?.role === "admin";
  // Show shopping UI when: (a) user is role=user, or (b) purchase mode is on
  const showShoppingUI = !user || user.role === "user" || purchaseMode;

  const handleLogout = () => {
    try {
      clearPurchaseMode();
      dispatch(logoutUser());
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const buyerNavLinks = [
    { name: "Home", path: "/", icon: <FaHome className="mr-2" /> },
    { name: "Shop", path: "/products", icon: <FaStore className="mr-2" /> },
    { name: "About", path: "/about", icon: <FaInfoCircle className="mr-2" /> },
    { name: "Contact", path: "/contact", icon: <FaPhoneAlt className="mr-2" /> },
  ];

  const sellerNavLinks = [
    { name: "Dashboard", path: "/seller/dashboard", icon: <FaTachometerAlt className="mr-2" /> },
    { name: "Products", path: "/seller/products", icon: <FaStore className="mr-2" /> },
    { name: "Orders", path: "/seller/orders", icon: <ShoppingBag size={14} className="mr-2" /> },
  ];

  const adminNavLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt className="mr-2" /> },
    { name: "Users", path: "/admin/users", icon: <FaUser className="mr-2" /> },
    { name: "Products", path: "/admin/products", icon: <FaStore className="mr-2" /> },
  ];

  // When a seller/admin is NOT in purchase mode, swap buyer links for role links
  const navLinks = showShoppingUI
    ? buyerNavLinks
    : user?.role === "admin"
    ? adminNavLinks
    : sellerNavLinks;

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      {/* Purchase mode banner for seller/admin */}
      {isNonUserRole && purchaseMode && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-1.5 text-xs font-medium">
          <ShoppingBag size={12} className="inline mr-1" />
          Purchase mode is active — you're shopping as a buyer.{" "}
          <button
            type="button"
            onClick={togglePurchaseMode}
            className="underline hover:no-underline font-semibold ml-1"
          >
            Switch back
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/" className="flex items-center">
              <motion.img
                src={logo}
                alt="ShopEase"
                className="w-12 drop-shadow-2xl bg-transparent dark:bg-transparent"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ backgroundColor: "transparent" }}
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

          {/* SearchBar — product search is a buyer feature */}
          {showShoppingUI && (
            <div className="hidden md:block w-1/3 mx-4">
              <SearchBar />
            </div>
          )}

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* Purchase mode toggle — only for seller/admin */}
            {isNonUserRole && (
              <button
                type="button"
                onClick={togglePurchaseMode}
                title={purchaseMode ? "Exit purchase mode" : "Switch to purchase mode"}
                aria-label={purchaseMode ? "Exit purchase mode" : "Switch to purchase mode"}
                className={`relative p-1.5 rounded-lg transition-all ${
                  purchaseMode
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <ArrowLeftRight size={18} />
              </button>
            )}

            {/* Chat link */}
            {user && (
              <Link
                to="/chat"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Messages"
              >
                <MessageCircle size={18} />
              </Link>
            )}

            {/* Cart & Wishlist — shown for user role always, and for seller/admin in purchase mode */}
            {showShoppingUI && (
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
                <button
                  type="button"
                  aria-haspopup="menu"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                >
                  <FaUser size={16} />
                  <span className="font-medium">
                    {user?.name?.split(" ")[0] || "Unknown"}
                  </span>
                </button>
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-md shadow-md py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <FaUser className="inline mr-2" />
                    My Profile
                  </Link>

                  {/* Shopping links in dropdown — for all roles */}
                  {showShoppingUI && (
                    <>
                      <Link
                        to="/my-orders"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <ShoppingBag size={14} className="inline mr-2" />
                        My Orders
                      </Link>
                      <Link
                        to="/addresses"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <FaHome className="inline mr-2" />
                        My Addresses
                      </Link>
                    </>
                  )}

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

                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
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
            {showShoppingUI && (
              <div className="mb-4">
                <SearchBar />
              </div>
            )}
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

              {/* Purchase mode toggle — mobile */}
              {isNonUserRole && (
                <button
                  type="button"
                  onClick={togglePurchaseMode}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    purchaseMode
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <ArrowLeftRight size={16} className="mr-2" />
                  {purchaseMode ? "Exit Purchase Mode" : "Purchase Mode"}
                </button>
              )}

              {/* Shopping icons — mobile */}
              {showShoppingUI && (
                <div className="flex items-center space-x-4 px-3 py-2">
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
                  {user && (
                    <Link
                      to="/chat"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <MessageCircle size={18} />
                    </Link>
                  )}
                </div>
              )}

              {user ? (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2"
                  >
                    My Profile
                  </Link>
                  {showShoppingUI && (
                    <>
                      <Link
                        to="/my-orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2"
                      >
                        My Addresses
                      </Link>
                    </>
                  )}
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
                    className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400"
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
