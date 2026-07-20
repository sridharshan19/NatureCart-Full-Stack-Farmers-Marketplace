import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthStorage, getStoredUser } from "../../utils/helpers";
import { useToast } from "../common/ToastProvider";
import { getFarmerOrders, getConsumerOrders } from "../../services/orderService";

const navLinkClassName = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-[linear-gradient(135deg,#fff7d8_0%,#ffffff_100%)] text-slate-900 shadow-lg"
      : "text-slate-800/90 hover:bg-white/50 hover:text-slate-900"
  }`;

export default function Navbar() {
  const [isIncomeMenuOpen, setIsIncomeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const { showInfo } = useToast();
  const isConsumer = user?.role === "consumer";
  const isAdmin = user?.role === "admin";
  const isFarmer = user?.role === "farmer";
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);
  const ordersLabel = isConsumer
    ? "Track Orders"
    : user
      ? "Manage Orders"
      : "Orders";
  const reviewsLabel = isAdmin ? "Farmer Reviews" : "Customer Reviews";
  const dashboardLabel = isAdmin ? "Admin Workspace" : isFarmer ? "Farmer Workspace" : "Dashboard";

  const hasCheckedFarmerOrdersRef = useRef(false);
  const hasCheckedConsumerOrdersRef = useRef(false);

  useEffect(() => {
    if (!isFarmer || hasCheckedFarmerOrdersRef.current) return;

    let isMounted = true;

    const checkPendingOrders = async () => {
      try {
        const ordersList = await getFarmerOrders();
        if (!isMounted) return;

        hasCheckedFarmerOrdersRef.current = true;
        const pendingCount = ordersList.filter((o) => o.scopedStatus === "pending").length;
        if (pendingCount > 0) {
          showInfo(`🌿 You have ${pendingCount} pending order(s) waiting for confirmation!`);
        }
      } catch (err) {
        console.error("Failed to check pending orders:", err);
      }
    };

    checkPendingOrders();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isFarmer, showInfo]);

  useEffect(() => {
    if (!isConsumer || hasCheckedConsumerOrdersRef.current) return;

    let isMounted = true;

    const checkConsumerOrders = async () => {
      try {
        const ordersList = await getConsumerOrders();
        if (!isMounted) return;

        hasCheckedConsumerOrdersRef.current = true;
        const confirmedCount = ordersList.filter(
          (o) => o.scopedStatus === "confirmed" || o.status === "confirmed"
        ).length;
        if (confirmedCount > 0) {
          showInfo(`🌿 You have ${confirmedCount} confirmed order(s) ready for pickup!`);
        }
      } catch (err) {
        console.error("Failed to check consumer orders:", err);
      }
    };

    checkConsumerOrders();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isConsumer, showInfo]);

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
      <div className="page-frame flex items-center justify-between gap-4 py-3 min-h-[4.5rem]">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grain-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-[linear-gradient(135deg,#ffd986_0%,#ffffff_100%)] text-base font-black text-emerald-800">
              NC
            </span>
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.38em] text-amber-700 leading-none mb-1">
                Farm commerce
              </p>
              <p className="text-lg font-black tracking-[0.15em] text-emerald-950 leading-none">NATURECART</p>
            </div>
          </Link>

          {user ? (
            <span
              className={`hidden rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider md:inline-flex shadow-sm ${
                isFarmer
                  ? "border-amber-300 bg-amber-100 text-amber-900"
                  : isAdmin
                  ? "border-slate-300 bg-slate-200 text-slate-900"
                  : "border-emerald-300 bg-emerald-100 text-emerald-900"
              }`}
            >
              {isFarmer ? "🌾 Farmer" : isAdmin ? "🛡️ Admin" : "🛒 Consumer"}
            </span>
          ) : null}
        </div>

        {/* Center: Main Links */}
        {!isAuthPage && (
          <div className="hidden lg:flex items-center gap-1">
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
        )}

        {/* Right Side: Account Buttons & Hamburger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/18 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:-translate-y-0.5"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    location.pathname === "/login"
                      ? "bg-[#0f766e] text-white shadow-sm"
                      : "border border-white/60 bg-white/35 text-slate-800 hover:bg-white/60"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition shadow-sm ${
                    location.pathname === "/register"
                      ? "bg-[#0f766e] text-white shadow-sm"
                      : "bg-[linear-gradient(135deg,#fff1be_0%,#ffffff_100%)] text-slate-900 hover:-translate-y-0.5"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          {!isAuthPage && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="rounded-full p-2 hover:bg-white/50 lg:hidden text-slate-800"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen ? (
        <div className="border-t border-white/40 bg-white/95 px-4 py-3 shadow-inner lg:hidden flex flex-col gap-1">
          <NavLink to="/" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
            Products
          </NavLink>
          {isConsumer ? (
            <NavLink to="/cart" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
              My Cart
            </NavLink>
          ) : null}
          {isConsumer ? (
            <NavLink to="/checkout" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
              Checkout
            </NavLink>
          ) : null}
          {user ? (
            <NavLink to="/orders" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
              {ordersLabel}
            </NavLink>
          ) : null}
          {isAdmin || isFarmer ? (
            <NavLink to="/reviews" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
              {reviewsLabel}
            </NavLink>
          ) : null}
          {user ? (
            <NavLink to="/dashboard" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
              {dashboardLabel}
            </NavLink>
          ) : null}
          {isFarmer ? (
            <div className="pl-4 py-1 flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold px-2 py-1">Income Dashboard</p>
              {incomeLinks.map((link) => (
                <Link
                  key={link.value}
                  to={`/income?income=${link.value}`}
                  onClick={() => {
                    setIsIncomeMenuOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  {link.label} Income
                </Link>
              ))}
            </div>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
              Admin Insights
            </NavLink>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
