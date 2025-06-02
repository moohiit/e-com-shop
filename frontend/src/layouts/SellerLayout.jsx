import { Outlet, NavLink } from 'react-router-dom'
import { useTheme } from '../theme/ThemeProvider'
import { LogOut } from 'lucide-react'

export default function SellerLayout() {
  const { darkMode } = useTheme()

  const navItems = [
    { to: '/seller/dashboard', label: 'Dashboard' },
    { to: '/seller/products', label: 'Manage Products' },
    { to: '/seller/add-product', label: 'Add Product' },
    { to: '/seller/orders', label: 'Manage Orders' },
    { to: '/seller/categories', label: 'Manage Categories' },
  ]

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-4 hidden md:block">
        <div className="text-2xl font-bold mb-6">Seller Panel</div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/auth/login'
          }}
          className="mt-10 flex items-center gap-2 text-sm text-red-600 hover:underline"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
