import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const getMaxValue = (items, field) =>
  Math.max(...items.map((item) => Number(item[field] || 0)), 1);

const ProgressRow = ({ label, value, maxValue, helper, tone = "teal" }) => {
  const toneMap = {
    teal: "bg-teal-600",
    amber: "bg-amber-500",
    slate: "bg-slate-700",
  };

  return (
    <div className="space-y-2 rounded-2xl bg-slate-50 p-4 transition-all hover:shadow-md border border-slate-100">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{helper}</p>
      </div>
      <div className="h-3 rounded-full bg-slate-200">
        <div
          className={`h-3 rounded-full ${toneMap[tone] || toneMap.teal} transition-all duration-500`}
          style={{ width: `${Math.max((Number(value || 0) / maxValue) * 100, 8)}%` }}
        />
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/60 bg-white/95 p-3 shadow-xl backdrop-blur text-sm">
        <p className="font-bold text-slate-800">{label}</p>
        <p className="text-[#1f7a5c] font-semibold">
          Sales: {formatCurrency(payload[0].value)}
        </p>
        {payload[0].payload.totalOrders !== undefined && (
          <p className="text-slate-500">
            Orders: {payload[0].payload.totalOrders}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/60 bg-white/95 p-3 shadow-xl backdrop-blur text-sm">
        <p className="font-bold text-slate-800">{label}</p>
        <p className="text-[#bf6c2f] font-semibold">
          {formatter ? formatter(payload[0].value) : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const MiniLineChart = ({ data }) => {
  if (!data || !data.length) {
    return <p className="text-sm text-slate-500">No sales trend data found.</p>;
  }

  const chartData = data.map((item) => ({
    name: item._id,
    sales: item.totalSales || 0,
    totalOrders: item.totalOrders || 0,
  }));

  return (
    <div className="h-64 w-full rounded-[1.5rem] bg-slate-50 p-4 border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f7a5c" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1f7a5c" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#1f7a5c"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MiniBarChart = ({ data, labelKey, valueKey, formatter, barTone = "bg-teal-600" }) => {
  if (!data || !data.length) {
    return <p className="text-sm text-slate-500">No chart data found.</p>;
  }

  const toneMap = {
    "bg-teal-600": "#0d9488",
    "bg-amber-500": "#f59e0b",
    "bg-slate-700": "#334155",
  };
  const fillColor = toneMap[barTone] || barTone;

  const chartData = data.map((item) => ({
    name: item[labelKey],
    value: item[valueKey] || 0,
  }));

  return (
    <div className="h-64 w-full rounded-[1.5rem] bg-slate-50 p-4 border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomBarTooltip formatter={formatter} />} />
          <Bar dataKey="value" fill={fillColor} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
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
  }, [filters]);

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

  const handleDownloadPdf = () => {
    if (!data) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const dateSuffix = filters.date || new Date().toISOString().slice(0, 10);
      const filename = `naturecart-analytics-report-${dateSuffix}.pdf`;

      const addHeaderFooter = (pdfDoc) => {
        const totalPages = pdfDoc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdfDoc.setPage(i);

          // Header
          pdfDoc.setFont("Helvetica", "bold");
          pdfDoc.setFontSize(9);
          pdfDoc.setTextColor(15, 118, 110); // Teal
          pdfDoc.text("NC NATURECART", 15, 12);
          
          pdfDoc.setFont("Helvetica", "normal");
          pdfDoc.setTextColor(100, 116, 139); // Slate-500
          pdfDoc.text("Fresh Trade, Clear Operations", 45, 12);
          pdfDoc.setLineWidth(0.2);
          pdfDoc.setDrawColor(226, 232, 240); // border-slate-200
          pdfDoc.line(15, 15, 195, 15);

          // Footer
          pdfDoc.line(15, 280, 195, 280);
          pdfDoc.setFontSize(8);
          pdfDoc.setTextColor(100, 116, 139);
          pdfDoc.text("NatureCart - Fresh Trade, Clear Operations", 15, 285);
          pdfDoc.text(`Page ${i} of ${totalPages}`, 175, 285);
        }
      };

      // Page 1 Content
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("NatureCart Analytics Report", 15, 28);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 34);

      // Filters
      const dateText = filters.date ? `Date Filter: ${filters.date}` : "Date Filter: All Dates";
      let farmerText = "Farmer Filter: All Farmers";
      if (filters.farmerId && farmers.length) {
        const matching = farmers.find((f) => f._id === filters.farmerId);
        if (matching) {
          farmerText = `Farmer Filter: ${matching.farmName || matching.name}`;
        }
      }
      doc.setFont("Helvetica", "normal");
      doc.text(`${dateText}  |  ${farmerText}`, 15, 39);

      // Summary Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 118, 110); // Teal
      doc.text("Executive Summary", 15, 48);
      
      // Summary Box Background
      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(15, 52, 180, 24, "F");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      
      doc.text("Total Revenue", 20, 58);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(formatCurrency(data.revenue || 0), 20, 64);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Total Orders", 70, 58);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(String(data.totalOrders || 0), 70, 64);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Top Selling Product", 115, 58);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      const topProdStr = `${data.highestSoldProduct?.name || "N/A"} (${data.highestSoldProduct?.totalSold || 0} units)`;
      doc.text(topProdStr, 115, 64);

      let currentY = 86;

      // Table 1: Top Products
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 118, 110);
      doc.text("Top Products by Sales Volume", 15, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Rank", "Product Name", "Total Units Sold", "Gross Revenue"]],
        body: (data.topProducts || []).map((prod, index) => [
          index + 1,
          prod._id,
          prod.totalSold,
          formatCurrency(prod.totalRevenue),
        ]),
        theme: "striped",
        headStyles: { fillColor: [15, 118, 110] },
        styles: { fontSize: 8.5 },
        margin: { left: 15, right: 15 },
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // Table 2: Top Farmers
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 118, 110);
      doc.text("Top Farmer Partners", 15, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Rank", "Farmer Name", "Email Address", "Units Sold", "Total Revenue"]],
        body: (data.topFarmers || []).map((farmer, index) => [
          index + 1,
          farmer.name,
          farmer.email,
          farmer.totalUnits,
          formatCurrency(farmer.totalRevenue),
        ]),
        theme: "striped",
        headStyles: { fillColor: [15, 118, 110] },
        styles: { fontSize: 8.5 },
        margin: { left: 15, right: 15 },
      });

      // Add a page break for orders
      doc.addPage();
      currentY = 24;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 118, 110);
      doc.text("Recent Customer Orders Received", 15, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Order ID", "Consumer", "Email", "Pickup Coordinates", "Status", "Amount", "Items"]],
        body: (data.ordersReceived || []).map((o) => [
          `#${o._id.slice(-8)}`,
          o.consumerId?.name || "Unknown",
          o.consumerId?.email || "",
          `${o.pickupDate} ${o.pickupTime}`,
          o.status,
          formatCurrency(o.totalAmount),
          (o.products || []).map((p) => `${p.productName} (x${p.quantity})`).join(", "),
        ]),
        theme: "striped",
        headStyles: { fillColor: [15, 118, 110] },
        styles: { fontSize: 7.5 },
        columnStyles: {
          6: { cellWidth: 45 }
        },
        margin: { left: 15, right: 15 },
      });

      // Apply headers and footers to all pages
      addHeaderFooter(doc);

      doc.save(filename);
    } catch (err) {
      setMessage("Failed to generate PDF: " + getErrorMessage(err));
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
      <section className="soft-hero p-8 text-slate-900">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Admin report</p>
        <h1 className="mt-3 text-4xl font-bold">NatureCart analytics overview</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-700">
          Review marketplace revenue, order movement, top products, and leading farmers
          using current order data from the backend.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={handleDownloadCsv}
            className="bg-white !text-slate-900 hover:!bg-slate-100"
          >
            {downloading ? "Downloading CSV..." : "Download CSV Report"}
          </Button>
          <Button
            onClick={handleDownloadPdf}
            className="bg-[#0f766e] text-white hover:bg-[#0d6e58]"
          >
            Download PDF Report
          </Button>
        </div>
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

      <section className="surface-panel p-6">
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
          <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#d8f5e8_0%,#97d9be_52%,#ffd29a_100%)] px-6 py-5 text-slate-900 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
              Ranking view
            </p>
            <p className="mt-2 text-2xl font-black">
              {data.highestSoldProduct?.totalSold || 0}
            </p>
            <p className="text-sm text-slate-700">Top quantity sold across current filters</p>
          </div>
        </div>
      </section>

      <section className="surface-panel p-6">
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
        <div className="surface-panel p-6">
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

        <div className="surface-panel p-6">
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
        <div className="surface-panel p-6">
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

        <div className="surface-panel p-6">
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

      <section className="surface-panel p-6">
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
