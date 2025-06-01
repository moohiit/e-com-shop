import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { user } = useSelector(state => state.auth)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return children
}