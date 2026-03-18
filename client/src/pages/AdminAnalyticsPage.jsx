import { useEffect, useMemo, useState } from "react";
import AnalyticsCard from "../components/AnalyticsCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import {
  downloadAdminAnalyticsCsv,
  getAdminAnalytics,
} from "../services/analyticsService";
import { getFarmers } from "../services/authService";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

const getMaxValue = (items, field) =>
  Math.max(...items.map((item) => Number(item[field] || 0)), 1);

const ProgressRow = ({ label, value, maxValue, helper, tone = "teal" }) => {
  const toneMap = {
    teal: "bg-teal-600",
    amber: "bg-amber-500",
    slate: "bg-slate-700",
  };

  return (
    <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{helper}</p>
      </div>
      <div className="h-3 rounded-full bg-slate-200">
        <div
          className={`h-3 rounded-full ${toneMap[tone] || toneMap.teal}`}
          style={{ width: `${Math.max((Number(value || 0) / maxValue) * 100, 8)}%` }}
        />
      </div>
    </div>
  );
};

const MiniLineChart = ({ data }) => {
  if (!data.length) {
    return <p className="text-sm text-slate-500">No sales trend data found.</p>;
  }

  const width = 640;
  const height = 240;
  const padding = 28;
  const maxValue = Math.max(...data.map((item) => Number(item.totalSales || 0)), 1);

  const points = data
    .map((item, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y =
        height -
        padding -
        (Number(item.totalSales || 0) / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <polyline
          fill="none"
          stroke="#0f766e"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {data.map((item, index) => {
          const x =
            padding +
            (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
          const y =
            height -
            padding -
            (Number(item.totalSales || 0) / maxValue) * (height - padding * 2);

          return (
            <g key={item._id}>
              <circle cx={x} cy={y} r="5" fill="#b45309" />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fill="#475569"
              >
                {item._id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const MiniBarChart = ({ data, labelKey, valueKey, formatter, barTone = "bg-teal-600" }) => {
  if (!data.length) {
    return <p className="text-sm text-slate-500">No chart data found.</p>;
  }

  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div className="space-y-3 rounded-[1.5rem] bg-slate-50 p-4">
      {data.map((item) => (
        <div key={`${item[labelKey]}-${item[valueKey]}`} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="font-semibold text-slate-900">{item[labelKey]}</p>
            <p className="text-slate-500">{formatter(item[valueKey])}</p>
          </div>
          <div className="h-4 rounded-full bg-slate-200">
            <div
              className={`h-4 rounded-full ${barTone}`}
              style={{
                width: `${Math.max((Number(item[valueKey] || 0) / maxValue) * 100, 8)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [filters, setFilters] = useState({
    farmerId: "",
    date: "",
  });

  const fetchAnalytics = async (activeFilters = filters) => {
    try {
      const result = await getAdminAnalytics(activeFilters);
      setData(result);
      setMessage("");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [analytics, farmerData] = await Promise.all([
          getAdminAnalytics(filters),
          getFarmers(),
        ]);
        setData(analytics);
        setFarmers(Array.isArray(farmerData) ? farmerData : []);
        setMessage("");
      } catch (error) {
        setMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const topProductMax = useMemo(
    () => getMaxValue(data?.topProducts || [], "totalSold"),
    [data]
  );
  const sortedTopProducts = useMemo(
    () =>
      [...(data?.topProducts || [])].sort(
        (left, right) => Number(right.totalSold || 0) - Number(left.totalSold || 0)
      ),
    [data]
  );
  const topFarmerMax = useMemo(
    () => getMaxValue(data?.topFarmers || [], "totalRevenue"),
    [data]
  );

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      const { blob, filename } = await downloadAdminAnalyticsCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    await fetchAnalytics(filters);
  };

  const handleResetFilters = async () => {
    const nextFilters = { farmerId: "", date: "" };
    setFilters(nextFilters);
    setLoading(true);
    await fetchAnalytics(nextFilters);
  };

  if (loading) {
    return <Loader label="Loading admin analytics..." />;
  }

  if (message) {
    return (
      <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
        <p className="text-sm text-rose-700">{message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
        <p className="text-sm text-slate-600">Analytics data is not available right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#111827_0%,#0f766e_55%,#b45309_100%)] p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Admin report</p>
        <h1 className="mt-3 text-4xl font-bold">NatureCart analytics overview</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-100/85">
          Review marketplace revenue, order movement, top products, and leading farmers
          using current order data from the backend.
        </p>
        <Button
          onClick={handleDownloadCsv}
          className="mt-6 bg-white !text-slate-900 hover:!bg-slate-100"
        >
          {downloading ? "Downloading CSV..." : "Download CSV Report"}
        </Button>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <AnalyticsCard
          title="Revenue"
          value={formatCurrency(data.revenue)}
          subtitle="Confirmed and completed order value"
          accent="teal"
        />
        <AnalyticsCard
          title="Orders"
          value={data.totalOrders}
          subtitle="Total orders recorded in the system"
          accent="slate"
        />
        <AnalyticsCard
          title="Trend Points"
          value={data.salesTrend.length}
          subtitle="Daily sales entries available for review"
          accent="amber"
        />
      </section>

      <section className="rounded-[1.75rem] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
              Highest seller
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {data.highestSoldProduct?.name || "No product data yet"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {data.highestSoldProduct
                ? `${data.highestSoldProduct.totalSold} units sold | ${formatCurrency(
                    data.highestSoldProduct.totalRevenue
                  )} generated`
                : "Once orders are placed, the best-selling item will appear here."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#0f766e_0%,#115e59_55%,#b45309_100%)] px-6 py-5 text-white shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100">
              Ranking view
            </p>
            <p className="mt-2 text-2xl font-black">
              {data.highestSoldProduct?.totalSold || 0}
            </p>
            <p className="text-sm text-white/80">Top quantity sold across current filters</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Filter analytics</h2>
            <p className="mt-2 text-sm text-slate-600">
              Review orders for a particular farmer and inspect orders received on a
              selected day.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:min-w-[420px]">
            <select
              value={filters.farmerId}
              onChange={(event) =>
                setFilters((current) => ({ ...current, farmerId: event.target.value }))
              }
              className="w-full rounded-2xl border border-[#d7d2c8] bg-[#fffaf4] p-3 text-slate-800 shadow-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
            >
              <option value="">All farmers</option>
              {farmers.map((farmer) => (
                <option key={farmer._id} value={farmer._id}>
                  {farmer.farmName || farmer.name}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={filters.date}
              onChange={(event) =>
                setFilters((current) => ({ ...current, date: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
          <Button
            onClick={handleResetFilters}
            className="bg-white !text-slate-800 border border-slate-200 hover:!bg-slate-100"
          >
            Reset
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">Sales trend</h2>
          <p className="mt-2 text-sm text-slate-600">
            Daily order value based on MongoDB order history.
          </p>
          <div className="mt-5">
            <MiniLineChart data={data.salesTrend} />
          </div>
          <div className="mt-5 space-y-3">
            {data.salesTrend.length ? (
              data.salesTrend.map((point) => (
                <ProgressRow
                  key={point._id}
                  label={point._id}
                  value={point.totalSales}
                  maxValue={getMaxValue(data.salesTrend, "totalSales")}
                  helper={`${formatCurrency(point.totalSales)} | ${point.totalOrders} orders`}
                  tone="teal"
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">No sales trend data found.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">Order status breakdown</h2>
          <p className="mt-2 text-sm text-slate-600">
            Track how many orders are pending, confirmed, and completed.
          </p>
          <div className="mt-5">
            <MiniBarChart
              data={data.statusBreakdown}
              labelKey="_id"
              valueKey="count"
              formatter={(value) => `${value} orders`}
              barTone="bg-amber-500"
            />
          </div>
          <div className="mt-5 space-y-3">
            {data.statusBreakdown.length ? (
              data.statusBreakdown.map((statusItem) => (
                <ProgressRow
                  key={statusItem._id}
                  label={statusItem._id}
                  value={statusItem.count}
                  maxValue={getMaxValue(data.statusBreakdown, "count")}
                  helper={`${statusItem.count} orders`}
                  tone="amber"
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">No status data found.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">Top products</h2>
          <p className="mt-2 text-sm text-slate-600">
            Best-selling products sorted from highest to lowest units sold.
          </p>
          <div className="mt-5">
            <MiniBarChart
              data={sortedTopProducts}
              labelKey="_id"
              valueKey="totalSold"
              formatter={(value) => `${value} sold`}
              barTone="bg-slate-700"
            />
          </div>
          <div className="mt-5 space-y-3">
            {sortedTopProducts.length ? (
              sortedTopProducts.map((product, index) => (
                <ProgressRow
                  key={product._id}
                  label={`${index + 1}. ${product._id}`}
                  value={product.totalSold}
                  maxValue={topProductMax}
                  helper={`${product.totalSold} sold | ${formatCurrency(product.totalRevenue)}`}
                  tone="slate"
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">No top product data found.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">Top farmers</h2>
          <p className="mt-2 text-sm text-slate-600">
            Farmers contributing the highest revenue through completed order items.
          </p>
          <div className="mt-5">
            <MiniBarChart
              data={data.topFarmers}
              labelKey="name"
              valueKey="totalRevenue"
              formatter={(value) => formatCurrency(value)}
              barTone="bg-teal-600"
            />
          </div>
          <div className="mt-5 space-y-3">
            {data.topFarmers.length ? (
              data.topFarmers.map((farmer) => (
                <ProgressRow
                  key={farmer._id}
                  label={farmer.name}
                  value={farmer.totalRevenue}
                  maxValue={topFarmerMax}
                  helper={`${formatCurrency(farmer.totalRevenue)} | ${farmer.totalUnits} units`}
                  tone="teal"
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">No top farmer data found.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900">Orders received</h2>
        <p className="mt-2 text-sm text-slate-600">
          {filters.date
            ? `Showing orders received on ${filters.date}${
                filters.farmerId ? " for the selected farmer" : ""
              }.`
            : "Showing the most recent orders for the selected filter set."}
        </p>

        <div className="mt-5 space-y-3">
          {data.ordersReceived?.length ? (
            data.ordersReceived.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.consumerId?.name || "Unknown"} ({order.consumerId?.email || "No email"})
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    <p>
                      Pickup: {order.pickupDate} at {order.pickupTime}
                    </p>
                    <p>Status: {order.status}</p>
                    <p>Total: {formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No orders match the selected farmer/date filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
