// src/routes/RequireRole.jsx
export default function RequireRole({ role, children }) {
  const user = useSelector(state => state.auth.user);
  return user?.role === role ? children : <div>Access Denied</div>;
}
