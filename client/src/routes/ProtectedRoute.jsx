import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "../utils/helpers";

export default function ProtectedRoute({ allowedRoles }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
