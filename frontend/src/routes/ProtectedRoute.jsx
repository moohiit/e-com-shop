import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

export default function ProtectedRoute({ allowedRoles, children }) {
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

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  } catch {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children || <Outlet />}</>
}

