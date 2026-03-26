import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import Reviews from "../pages/Reviews";
import Dashboard from "../pages/Dashboard";
import FarmerIncome from "../pages/FarmerIncome";
import AdminDashboard from "../pages/AdminDashboard";
import AdminAnalyticsPage from "../pages/AdminAnalyticsPage";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { USER_ROLES } from "../utils/constants";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route path="/products" element={<Products />} />
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.consumer]} />}>
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[USER_ROLES.admin, USER_ROLES.farmer, USER_ROLES.consumer]}
          />
        }
      >
        <Route path="/orders" element={<Orders />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.farmer]} />}>
        <Route path="/income" element={<FarmerIncome />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.admin]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
