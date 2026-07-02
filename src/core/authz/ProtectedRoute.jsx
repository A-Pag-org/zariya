import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ACTIONS } from "./actions";
import { useCan } from "./useCan";

// Route guard. Two layers:
//   <RequireAuth>            — redirects anonymous users to /sign-in
//   <RequireModuleAccess>    — renders 403 when the user lacks module:view
export function RequireAuth() {
  const { user, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return null;
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireModuleAccess({ moduleId, children }) {
  const canDo = useCan();

  if (!canDo(ACTIONS.VIEW, moduleId)) {
    return <Navigate to="/forbidden" replace />;
  }
  return children ?? <Outlet />;
}
