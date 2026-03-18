import { Link, useNavigate } from "react-router-dom";
import { clearAuthStorage, getStoredUser } from "../../utils/helpers";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isConsumer = user?.role === "consumer";
  const isAdmin = user?.role === "admin";
  const isFarmer = user?.role === "farmer";
  const ordersLabel = isConsumer
    ? "Track Orders"
    : user
      ? "Manage Orders"
      : "Orders";
  const reviewsLabel = isAdmin ? "Farmer Reviews" : "Customer Reviews";
  const dashboardLabel = isAdmin ? "Admin Workspace" : isFarmer ? "Farmer Workspace" : "Dashboard";

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/login");
  };

  return (
    <nav className="border-b border-white/30 bg-[linear-gradient(135deg,#111827_0%,#0f766e_55%,#b45309_100%)] px-4 py-4 text-white shadow-2xl">
      <div className="container mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="text-2xl font-black tracking-[0.2em] text-amber-100">
          NATURECART
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-100">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {isConsumer ? <Link to="/cart">My Cart</Link> : null}
          {isConsumer ? <Link to="/checkout">Checkout</Link> : null}
          {user ? <Link to="/orders">{ordersLabel}</Link> : null}
          {isAdmin || isFarmer ? <Link to="/reviews">{reviewsLabel}</Link> : null}
          {user ? <Link to="/dashboard">{dashboardLabel}</Link> : null}
          {isAdmin ? <Link to="/admin">Admin Insights</Link> : null}

          {user ? (
            <>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em]">
                {user.role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link
                to="/register"
                className="rounded-full bg-white px-4 py-2 font-semibold text-slate-900"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
