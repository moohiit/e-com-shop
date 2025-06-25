import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SellerLayout from "../layouts/SellerLayout";
import RoleBasedRedirect from "./RoleBasedRedirect";
import AdminLayout from "../layouts/AdminLayout";
import VerifyNotice from "../pages/Email/VerifyNotice";
import VerifyEmail from "../pages/Email/VerifyEmail";
import EmailVerifiedSuccess from "../pages/Email/EmailVerifiedSuccess";
import EmailVerificationFailed from "../pages/Email/EmailVerificationFailed";

const Home = lazy(() => import("../pages/Home/Home"));
const ProductListing = lazy(() => import("../pages/Products/ProductListing"));
const ProductDetail = lazy(() => import("../pages/Products/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Checkout = lazy(() => import("../pages/Checkout/Checkout"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const About = lazy(() => import("../pages/About/About"));
const Contact = lazy(() => import("../pages/Contact/Contact"));
const Wishlist = lazy(() => import("../pages/Wishlist/Wishlist"));
const Orders = lazy(() => import("../pages/Orders/Orders"));
const SellerDashboard = lazy(() => import("../pages/Seller/Dashboard"));
const ManageProducts = lazy(() => import("../pages/Seller/ManageProducts"));
const AddProduct = lazy(() => import("../pages/Seller/AddProduct"));
const ManageOrders = lazy(() => import("../pages/Seller/ManageOrders"));
const ManageCategories = lazy(() => import("../pages/Seller/ManageCategories"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const ManageUsers = lazy(() => import("../pages/Admin/ManageUsers"));
const AdminProducts = lazy(() => import("../pages/Admin/AdminProducts"));
const AdminCategories = lazy(() => import("../pages/Admin/AdminCategories"));
export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* User Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<RoleBasedRedirect />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["user", "seller", "admin"]} />
            }
          >
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="user-dashboard" element={<Dashboard />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Route>

        {/* Seller Routes */}
        <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
          <Route path="/seller" element={<SellerLayout />}>
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="categories" element={<ManageCategories />} />
          </Route>
        </Route>
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>

        <Route path="/verify-notice" element={<VerifyNotice />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/email-verified-success" element={<EmailVerifiedSuccess />} />
        <Route path="/email-verification-failed" element={<EmailVerificationFailed />} />
        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
        {/* Fallback route */}
      </Routes>
    </Suspense>
  );
}
