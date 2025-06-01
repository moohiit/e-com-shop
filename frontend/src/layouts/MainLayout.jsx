import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { useTheme } from '../theme/ThemeProvider'

export default function MainLayout() {
  const { darkMode } = useTheme()

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Navbar />
      <main className="flex-grow pt-16"> {/* pt-16 to account for fixed navbar */}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}