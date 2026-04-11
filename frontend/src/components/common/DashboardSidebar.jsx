import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, ChevronRight, ShoppingBag } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";
import { usePurchaseMode } from "../../hooks/usePurchaseMode";

/**
 * Shared sidebar for Admin and Seller dashboards.
 *
 * Props:
 *   brand:        { title: string, subtitle?: string, accent?: 'blue' | 'amber' }
 *   sections:     [{ heading?: string, items: [{ to, label, icon, end? }] }]
 *   user:         { name?, email?, role? }
 *   onLogout:     () => void
 *   isOpen:       boolean (mobile drawer)
 *   onClose:      () => void
 */

const accentMap = {
  blue: {
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    activeBg: "bg-gradient-to-r from-blue-600 to-indigo-600",
    activeRing: "shadow-blue-500/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
    badge: "bg-blue-500",
  },
  amber: {
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    activeBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    activeRing: "shadow-amber-500/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300",
    badge: "bg-amber-500",
  },
};

const initialsFor = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const DashboardSidebar = ({
  brand,
  sections = [],
  user,
  onLogout,
  isOpen,
  onClose,
}) => {
  const { darkMode, toggleTheme } = useTheme();
  const accent = accentMap[brand?.accent || "blue"];
  const [purchaseMode, setPurchaseMode] = usePurchaseMode();
  const navigate = useNavigate();

  const enterPurchaseMode = () => {
    setPurchaseMode(true);
    onClose?.();
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 z-40 flex flex-col
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          shadow-xl md:shadow-none transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Brand header */}
        <div
          className={`relative px-5 py-5 bg-gradient-to-br ${accent.gradient} text-white overflow-hidden`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg shadow-inner">
              {brand?.title?.[0] || "S"}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate">
                {brand?.title}
              </h1>
              {brand?.subtitle && (
                <p className="text-xs text-white/80 truncate">{brand.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* User card */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full ${accent.iconBg} flex items-center justify-center font-semibold text-sm shrink-0`}
              >
                {initialsFor(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || ""}
                </p>
              </div>
              {user.role && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${accent.badge}`}
                >
                  {user.role}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation — scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.heading && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.heading}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? `${accent.activeBg} text-white shadow-lg ${accent.activeRing}`
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex items-center gap-3 min-w-0">
                            {Icon && (
                              <Icon
                                size={18}
                                className={`shrink-0 transition-transform group-hover:scale-110 ${
                                  isActive ? "" : "text-gray-500 dark:text-gray-400 group-hover:text-current"
                                }`}
                              />
                            )}
                            <span className="truncate">{item.label}</span>
                          </span>
                          <ChevronRight
                            size={14}
                            className={`shrink-0 transition-all ${
                              isActive
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0"
                            }`}
                          />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer — purchase mode + theme toggle + logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button
            type="button"
            onClick={enterPurchaseMode}
            aria-label="Switch to purchase mode"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <ShoppingBag size={18} />
            <span>{purchaseMode ? "Purchase Mode Active" : "Switch to Purchase Mode"}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="flex items-center gap-3">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </span>
            {/* Pill toggle indicator */}
            <span
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                darkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                  darkMode ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
