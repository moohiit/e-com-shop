import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Boxes,
  Tags,
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/auth/login', { replace: true })
  }

  const links = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', to: '/admin/users', icon: <Users size={20} /> },
    { name: 'Products', to: '/admin/products', icon: <Boxes size={20} /> },
    { name: 'Categories', to: '/admin/categories', icon: <Tags size={20} /> },
  ]

  return (
    <>
      {/* Mobile Top-bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 dark:text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed z-30 md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform md:translate-x-0 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:block`}
      >
        <div className="px-6 py-4 text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700">
          Admin Panel
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isActive ? 'bg-gray-200 dark:bg-gray-700 font-medium' : 'text-gray-700 dark:text-gray-300'
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Overlay for small screen */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black opacity-40 z-10 md:hidden"
        />
      )}
    </>
  )
}
