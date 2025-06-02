import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Home from '../pages/Home/Home'

export default function RoleBasedRedirect() {
  const { user } = useSelector(state => state.auth)

  if (user?.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />
  }

  if (user?.role === 'user') {
    return <Navigate to="/dashboard" replace />
  }

  return <Home />
}
