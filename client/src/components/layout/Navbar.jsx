import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthStorage, getStoredUser } from "../../utils/helpers";

const navLinkClassName = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-[linear-gradient(135deg,#fff7d8_0%,#ffffff_100%)] text-slate-900 shadow-lg"
      : "text-slate-800/90 hover:bg-white/50 hover:text-slate-900"
  }`;

export default function Navbar() {
  const [isIncomeMenuOpen, setIsIncomeMenuOpen] = useState(false);
  const location = useLocation();
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

  const incomeLinks = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ];

  const isIncomeActive =
    isFarmer &&
    location.pathname === "/income" &&
    new URLSearchParams(location.search).get("income");

  return (
    <nav className="brand-shell sticky top-0 z-30 text-slate-900">
      <div className="page-frame flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grain-ring flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-[linear-gradient(135deg,#ffd986_0%,#ffffff_100%)] text-lg font-black text-emerald-800">
              NC
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-amber-700">
                Farm commerce
              </p>
              <p className="text-xl font-black tracking-[0.18em] text-emerald-950">NATURECART</p>
            </div>
          </Link>

          {user ? (
            <span className="hidden rounded-full border border-white/60 bg-white/65 px-3 py-1 text-[0.68rem] uppercase tracking-[0.28em] text-emerald-800 md:inline-flex">
              {user.role}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navLinkClassName}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClassName}>
              Products
            </NavLink>
            {isConsumer ? (
              <NavLink to="/cart" className={navLinkClassName}>
                My Cart
              </NavLink>
            ) : null}
            {isConsumer ? (
              <NavLink to="/checkout" className={navLinkClassName}>
                Checkout
              </NavLink>
            ) : null}
            {user ? (
              <NavLink to="/orders" className={navLinkClassName}>
                {ordersLabel}
              </NavLink>
            ) : null}
            {isAdmin || isFarmer ? (
              <NavLink to="/reviews" className={navLinkClassName}>
                {reviewsLabel}
              </NavLink>
            ) : null}
            {user ? (
              <NavLink to="/dashboard" className={navLinkClassName}>
                {dashboardLabel}
              </NavLink>
            ) : null}
            {isFarmer ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsIncomeMenuOpen((current) => !current)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isIncomeActive
                      ? "bg-[linear-gradient(135deg,#fff7d8_0%,#ffffff_100%)] text-slate-900 shadow-lg"
                      : "text-slate-800/90 hover:bg-white/50 hover:text-slate-900"
                  }`}
                >
                  Income
                </button>

                {isIncomeMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+0.6rem)] z-40 min-w-40 rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur">
                    {incomeLinks.map((link) => (
                      <Link
                        key={link.value}
                        to={`/income?income=${link.value}`}
                        onClick={() => setIsIncomeMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {isAdmin ? (
              <NavLink to="/admin" className={navLinkClassName}>
                Admin Insights
              </NavLink>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="hidden text-xs uppercase tracking-[0.28em] text-slate-600 md:block">
              Farmer to pickup in one workflow
            </p>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/18 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 hover:-translate-y-0.5"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-white/60 bg-white/35 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white/60"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[linear-gradient(135deg,#fff1be_0%,#ffffff_100%)] px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 hover:-translate-y-0.5"
                >
                  Start Selling
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
