const analyticsService = require("../services/analyticsService");

const buildReportFileName = (dateFilter) => {
  const suffix = dateFilter || new Date().toISOString().slice(0, 10);
  return `naturecart-analytics-report-${suffix}.csv`;
};

const escapeCsvValue = (value) => {
  const normalizedValue =
    value === null || value === undefined ? "" : String(value);

  if (
    normalizedValue.includes(",") ||
    normalizedValue.includes('"') ||
    normalizedValue.includes("\n")
  ) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
};

const sectionToCsv = (title, rows) => {
  const csvRows = [[title]];

  if (!rows.length) {
    csvRows.push(["No data"]);
  } else {
    const headers = Object.keys(rows[0]);
    csvRows.push(headers);
    rows.forEach((row) => {
      csvRows.push(headers.map((header) => row[header]));
    });
  }

  return csvRows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getAnalyticsSummary(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopProducts();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.exportAnalyticsCsv = async (req, res, next) => {
  try {
    const data = await analyticsService.getAnalyticsSummary(req.query);
    const sections = [
      sectionToCsv("Summary", [
        {
          generatedAt: new Date().toISOString(),
          revenue: data.revenue,
          totalOrders: data.totalOrders,
          highestSoldProduct: data.highestSoldProduct?.name || "",
          highestSoldUnits: data.highestSoldProduct?.totalSold || 0,
          farmerId: data.appliedFilters.farmerId,
          date: data.appliedFilters.date,
        },
      ]),
      sectionToCsv("Status Breakdown", data.statusBreakdown),
      sectionToCsv("Sales Trend", data.salesTrend),
      sectionToCsv(
        "Top Products",
        data.topProducts.map((product, index) => ({
          rank: index + 1,
          productName: product._id,
          totalSold: product.totalSold,
          totalRevenue: product.totalRevenue,
        }))
      ),
      sectionToCsv(
        "Top Farmers",
        data.topFarmers.map((farmer, index) => ({
          rank: index + 1,
          name: farmer.name,
          email: farmer.email,
          totalRevenue: farmer.totalRevenue,
          totalUnits: farmer.totalUnits,
        }))
      ),
      sectionToCsv(
        "Orders Received",
        data.ordersReceived.map((order) => ({
          orderId: order._id,
          consumer: order.consumerId?.name || "Unknown",
          email: order.consumerId?.email || "",
          pickupDate: order.pickupDate,
          pickupTime: order.pickupTime,
          status: order.status,
          totalAmount: order.totalAmount,
          items: (order.products || [])
            .map((product) => `${product.productName} x${product.quantity}`)
            .join(" | "),
          createdAt: order.createdAt,
        }))
      ),
    ];

    const csv = sections.join("\n\n");
    const fileName = buildReportFileName(data.appliedFilters.date);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
