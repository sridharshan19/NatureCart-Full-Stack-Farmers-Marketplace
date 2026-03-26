import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { getFarmerOrders } from "../services/orderService";
import { formatCurrency, getErrorMessage, getStoredUser } from "../utils/helpers";

const isRevenueStatus = (status) => ["confirmed", "completed"].includes(status);

const getStartOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diff);
  return start;
};

export default function FarmerIncome() {
  const [searchParams] = useSearchParams();
  const user = getStoredUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();
  const selectedIncomeView = searchParams.get("income") || "daily";

  useEffect(() => {
    const loadIncome = async () => {
      try {
        const orderData = await getFarmerOrders();
        setOrders(orderData);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadIncome();
  }, []);

  const incomeSummary = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return orders.reduce(
      (accumulator, order) => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;

        order.products.forEach((product) => {
          const status = product.status || order.scopedStatus || order.status;

          if (!isRevenueStatus(status)) {
            return;
          }

          const lineRevenue = Number(product.price || 0) * Number(product.quantity || 0);
          accumulator.total += lineRevenue;

          if (orderDate && orderDate >= startOfToday) {
            accumulator.daily += lineRevenue;
          }

          if (orderDate && orderDate >= startOfWeek) {
            accumulator.weekly += lineRevenue;
          }

          if (orderDate && orderDate >= startOfMonth) {
            accumulator.monthly += lineRevenue;
          }

          if (orderDate && orderDate >= startOfYear) {
            accumulator.yearly += lineRevenue;
          }
        });

        return accumulator;
      },
      { total: 0, daily: 0, weekly: 0, monthly: 0, yearly: 0 }
    );
  }, [orders]);

  if (!user || user.role !== "farmer") {
    return (
      <div className="rounded-[2rem] bg-white/85 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-slate-900">Farmer income only</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          This page is available only for farmer accounts.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-full bg-[#0f766e] px-5 py-3 font-semibold text-white"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-hero p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-200">
          Farmer income
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          {selectedIncomeView.charAt(0).toUpperCase() + selectedIncomeView.slice(1)} income overview
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-teal-50/90">
          This page contains only farmer income details.
        </p>
      </section>

      {loading ? <Loader label="Loading farmer income..." /> : null}

      {!loading ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Total Income</p>
              <p className="mt-2 text-3xl font-bold text-teal-700">
                {formatCurrency(incomeSummary.total)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow ${
                selectedIncomeView === "daily" ? "ring-2 ring-emerald-400 ring-offset-2" : ""
              }`}
            >
              <p className="text-sm text-slate-500">Daily Income</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {formatCurrency(incomeSummary.daily)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow ${
                selectedIncomeView === "weekly" ? "ring-2 ring-sky-400 ring-offset-2" : ""
              }`}
            >
              <p className="text-sm text-slate-500">Weekly Income</p>
              <p className="mt-2 text-3xl font-bold text-sky-700">
                {formatCurrency(incomeSummary.weekly)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow ${
                selectedIncomeView === "monthly" ? "ring-2 ring-violet-400 ring-offset-2" : ""
              }`}
            >
              <p className="text-sm text-slate-500">Monthly Income</p>
              <p className="mt-2 text-3xl font-bold text-violet-700">
                {formatCurrency(incomeSummary.monthly)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow ${
                selectedIncomeView === "yearly" ? "ring-2 ring-amber-400 ring-offset-2" : ""
              }`}
            >
              <p className="text-sm text-slate-500">Yearly Income</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">
                {formatCurrency(incomeSummary.yearly)}
              </p>
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
              Income focus
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {selectedIncomeView === "daily"
                ? "Today's earnings"
                : selectedIncomeView === "weekly"
                  ? "This week's earnings"
                  : selectedIncomeView === "monthly"
                    ? "This month's earnings"
                    : "This year's earnings"}
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              {selectedIncomeView === "daily"
                ? "Use this view to check what your confirmed and completed orders earned today."
                : selectedIncomeView === "weekly"
                  ? "Use this view to track your current week's confirmed and completed earnings."
                  : selectedIncomeView === "monthly"
                    ? "Use this view to review your confirmed and completed earnings for the current month."
                    : "Use this view to review your confirmed and completed earnings for the current year."}
            </p>
            <p className="mt-6 text-4xl font-bold text-slate-900">
              {selectedIncomeView === "daily"
                ? formatCurrency(incomeSummary.daily)
                : selectedIncomeView === "weekly"
                  ? formatCurrency(incomeSummary.weekly)
                  : selectedIncomeView === "monthly"
                    ? formatCurrency(incomeSummary.monthly)
                    : formatCurrency(incomeSummary.yearly)}
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
