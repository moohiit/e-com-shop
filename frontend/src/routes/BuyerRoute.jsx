import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePurchaseMode } from "../hooks/usePurchaseMode";

/**
 * Guards buyer-facing routes. Anonymous visitors and "user" role pass through.
 * Sellers/admins only pass when purchase mode is active; otherwise they are
 * redirected to their own dashboard so they stay in their role context.
 */
export default function BuyerRoute({ children, requireAuth = false }) {
  const { user, token } = useSelector((state) => state.auth);
  const [purchaseMode] = usePurchaseMode();
  const location = useLocation();

  if (requireAuth && (!token || !user)) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (user && user.role !== "user" && !purchaseMode) {
    const target =
      user.role === "seller" ? "/seller/dashboard" : "/admin/dashboard";
    return <Navigate to={target} replace />;
  }

  return <>{children || <Outlet />}</>;
}
