import { AppRouter } from './routes/AppRouter'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './theme/ThemeProvider'

export default function App() {
  const { darkMode } = useTheme()

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <AppRouter />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </div>
  )
}