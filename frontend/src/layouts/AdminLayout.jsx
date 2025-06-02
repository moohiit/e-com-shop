import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import { Menu, X, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const { darkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Manage Users' },
    { to: '/admin/products', label: 'Manage Products' },
    { to: '/admin/categories', label: 'Manage Categories' },
    { to: '/admin/orders', label: 'Manage Orders' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>

      {/* Topbar for Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow sticky top-0 z-30">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 dark:text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-screen w-64 bg-white dark:bg-gray-800 shadow-lg z-40 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        <div className="px-6 py-4 text-2xl font-bold border-b dark:border-gray-700">Admin Panel</div>
        <nav className="p-4 flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="mt-8 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-md"
          >
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>

      {/* Overlay for Mobile Menu */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 pt-16 md:pt-6">
        <Outlet />
      </main>
    </div>
  )
}
