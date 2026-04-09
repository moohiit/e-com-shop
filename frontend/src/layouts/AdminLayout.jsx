import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Boxes,
  Tags,
  UserCheck,
} from "lucide-react";
import { logoutUser } from "../features/auth/authSlice";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const sections = [
    {
      heading: "Overview",
      items: [
        {
          to: "/admin/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      heading: "Catalog",
      items: [
        { to: "/admin/products", label: "Manage Products", icon: Boxes },
        { to: "/admin/categories", label: "Manage Categories", icon: Tags },
      ],
    },
    {
      heading: "People",
      items: [
        { to: "/admin/users", label: "Manage Users", icon: Users },
        {
          to: "/admin/seller-applications",
          label: "Seller Applications",
          icon: UserCheck,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm">
            A
          </div>
          <h1 className="text-base font-semibold">Admin Panel</h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          className="text-gray-700 dark:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <DashboardSidebar
        brand={{ title: "Admin Panel", subtitle: "ShopEase Console", accent: "blue" }}
        sections={sections}
        user={user}
        onLogout={handleLogout}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto pt-16 md:pt-0 px-4 md:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
