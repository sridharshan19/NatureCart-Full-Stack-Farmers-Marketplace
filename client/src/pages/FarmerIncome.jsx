import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { getFarmerOrders } from "../services/orderService";
import { formatCurrency, getErrorMessage, getStoredUser } from "../utils/helpers";
import { generateFarmerSalesReport, exportFarmerSalesCsv } from "../utils/invoiceGenerator";

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
  const { showError, showSuccess } = useToast();
  const selectedIncomeView = searchParams.get("income") || "daily";

  useEffect(() => {
    const loadIncome = async () => {
      try {
        const orderData = await getFarmerOrders();
        setOrders(orderData || []);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadIncome();
  }, [showError]);

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

        (order.products || []).forEach((product) => {
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

  const handleDownloadPdfReport = () => {
    try {
      generateFarmerSalesReport(user, orders, selectedIncomeView);
      showSuccess("Farmer sales report PDF generated successfully.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleExportCsv = () => {
    try {
      exportFarmerSalesCsv(user, orders, selectedIncomeView);
      showSuccess("Farmer sales CSV data exported successfully.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

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
      <section className="hero-farmer p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
              🌾 Farmer Financial Center
            </span>
            <h1 className="mt-3 text-4xl font-bold font-serif">
              {selectedIncomeView.charAt(0).toUpperCase() + selectedIncomeView.slice(1)} Income & Sales Report
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-white/90">
              Track farm revenue, generate official tax invoice reports, and review product sales history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button
              onClick={handleDownloadPdfReport}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg"
            >
              📄 Download Sales Statement (PDF)
            </Button>
            <Button
              onClick={handleExportCsv}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-lg"
            >
              📊 Export CSV
            </Button>
          </div>
        </div>
      </section>

      {loading ? <Loader label="Loading farmer income & sales records..." /> : null}

      {!loading ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow border border-emerald-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {formatCurrency(incomeSummary.total)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow border border-slate-100 ${
                selectedIncomeView === "daily" ? "ring-2 ring-emerald-500 ring-offset-2" : ""
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Daily Income</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {formatCurrency(incomeSummary.daily)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow border border-slate-100 ${
                selectedIncomeView === "weekly" ? "ring-2 ring-sky-500 ring-offset-2" : ""
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Weekly Income</p>
              <p className="mt-2 text-3xl font-bold text-sky-700">
                {formatCurrency(incomeSummary.weekly)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow border border-slate-100 ${
                selectedIncomeView === "monthly" ? "ring-2 ring-violet-500 ring-offset-2" : ""
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Monthly Income</p>
              <p className="mt-2 text-3xl font-bold text-violet-700">
                {formatCurrency(incomeSummary.monthly)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-white p-5 shadow border border-slate-100 ${
                selectedIncomeView === "yearly" ? "ring-2 ring-amber-500 ring-offset-2" : ""
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Yearly Income</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">
                {formatCurrency(incomeSummary.yearly)}
              </p>
            </div>
          </section>

          {/* Sales History Itemized Table */}
          <section className="rounded-[1.75rem] bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
                  Sales History Ledger
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 font-serif">
                  Product Sales & Customer Invoices
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadPdfReport}
                  className="bg-amber-700 hover:bg-amber-800 text-xs text-white"
                >
                  📄 PDF Invoice Report
                </Button>
                <Button
                  onClick={handleExportCsv}
                  className="bg-slate-200 text-slate-800 hover:bg-slate-300 text-xs"
                >
                  📊 CSV Spreadsheet
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs uppercase text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Order Date</th>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Produce Sold</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total Revenue</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.flatMap((order) =>
                    (order.products || []).map((product, pIdx) => {
                      const status = product.status || order.scopedStatus || order.status;
                      const lineTotal = Number(product.price || 0) * Number(product.quantity || 0);

                      return (
                        <tr key={`${order._id}-${pIdx}`} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-medium text-slate-800">
                            {order.pickupDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A")}
                          </td>
                          <td className="p-3 font-mono text-xs font-bold text-amber-800">
                            #{order._id?.slice(-8).toUpperCase() || "N/A"}
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-900">{order.consumerId?.name || "Customer"}</p>
                            <p className="text-xs text-slate-400">{order.consumerId?.email || ""}</p>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{product.productName || "Fresh Produce"}</td>
                          <td className="p-3 text-center font-bold">{product.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(product.price || 0)}</td>
                          <td className="p-3 text-right font-black text-emerald-800">
                            {formatCurrency(lineTotal)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                                status === "completed"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : status === "confirmed"
                                  ? "bg-sky-100 text-sky-900"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {!orders.length ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500">
                        No sales history records available yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

