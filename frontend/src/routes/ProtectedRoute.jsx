import { jwtDecode } from 'jwt-decode'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  const { token, user } = useSelector(state => state.auth)
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  try {
    const decoded = jwtDecode(token)
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token')
      return <Navigate to="/auth/login" state={{ from: location }} replace />
    }
  } catch {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
