import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "../utils/helpers";

export default function GuestRoute() {
  const user = getStoredUser();

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
