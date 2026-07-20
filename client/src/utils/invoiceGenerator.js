import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./helpers";

export const generateOrderInvoice = (order, role = "consumer") => {
  if (!order) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const orderShortId = order._id ? order._id.slice(-8).toUpperCase() : "N/A";
  const filename = `naturecart-invoice-${orderShortId}.pdf`;

  // Colors
  const primaryColor = [15, 118, 110]; // #0f766e Teal
  const darkTextColor = [15, 23, 42]; // #0f172a Slate-900
  const lightTextColor = [71, 85, 105]; // #475569 Slate-600
  const accentBorder = [226, 232, 240]; // #e2e8f0 Slate-200

  // Top Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("NATURECART", 15, 16);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241); // Teal-100
  doc.text("Direct Farm Produce Marketplace - Order Tax Receipt", 15, 22);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", 160, 16, { align: "right" });
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`#NC-${orderShortId}`, 160, 22, { align: "right" });

  let currentY = 38;

  // Metadata Box (2 columns: Customer Details | Order Coordinates)
  doc.setDrawColor(...accentBorder);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(15, currentY, 180, 32, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("CUSTOMER DETAILS", 20, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkTextColor);
  doc.text(order.consumerId?.name || "Consumer", 20, currentY + 14);
  doc.setTextColor(...lightTextColor);
  doc.text(`Email: ${order.consumerId?.email || "N/A"}`, 20, currentY + 20);
  doc.text(`Role: ${role.toUpperCase()}`, 20, currentY + 26);

  // Right side: Order info
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("PICKUP COORDINATES", 115, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkTextColor);
  doc.text(`Date: ${order.pickupDate || "N/A"}`, 115, currentY + 14);
  doc.text(`Time Slot: ${order.pickupTime || "N/A"}`, 115, currentY + 20);
  doc.setTextColor(...lightTextColor);
  doc.text(`Payment: Cash / Pay on Pickup (Offline)`, 115, currentY + 26);

  currentY += 40;

  // Items Table Header Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkTextColor);
  doc.text("Order Items", 15, currentY);
  currentY += 4;

  const tableBody = (order.products || []).map((p, idx) => {
    const qty = Number(p.quantity || 0);
    const price = Number(p.price || 0);
    const subtotal = qty * price;
    const farmerName =
      typeof p.farmerId === "object"
        ? p.farmerId?.farmName || p.farmerId?.name
        : "Local Farm";

    return [
      idx + 1,
      p.productName || "Fresh Produce",
      farmerName,
      `Rs. ${price.toFixed(2)}`,
      `${qty} ${p.unit || "kg"}`,
      `Rs. ${subtotal.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["#", "Product Name", "Farm Sourced", "Unit Price", "Qty", "Total"]],
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      textColor: darkTextColor,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 15, halign: "center" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // Order Total Summary
  doc.setDrawColor(...accentBorder);
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(115, currentY, 80, 24, "F");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...lightTextColor);
  doc.text("Total Items:", 120, currentY + 8);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(...darkTextColor);
  doc.text(`${(order.products || []).length} items`, 190, currentY + 8, { align: "right" });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("Grand Total:", 120, currentY + 17);
  doc.setFontSize(13);
  doc.text(formatCurrency(order.totalAmount || 0), 190, currentY + 17, { align: "right" });

  currentY += 34;

  // Important Notice Box
  doc.setDrawColor(254, 215, 170); // amber-200
  doc.setFillColor(255, 251, 235); // amber-50
  doc.rect(15, currentY, 180, 20, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(154, 52, 18); // amber-800
  doc.text("PAYMENT NOTICE & PICKUP INSTRUCTIONS", 20, currentY + 6);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(194, 65, 12);
  doc.text(
    "Please bring exact cash or pay directly to the farmer during pickup handoff. Show this invoice receipt to confirm your order.",
    20,
    currentY + 13
  );

  // Footer
  doc.setLineWidth(0.2);
  doc.setDrawColor(...accentBorder);
  doc.line(15, 280, 195, 280);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...lightTextColor);
  doc.text("NatureCart Farmers Marketplace • Support Local Producers • NatureCart Inc.", 15, 285);
  doc.text("Official Digital Receipt", 195, 285, { align: "right" });

  doc.save(filename);
};

export const generateFarmerSalesReport = (farmerUser, orders = [], timeframe = "All Time") => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const farmName = farmerUser?.farmName || farmerUser?.name || "Verified Farm";
  const filename = `NatureCart_Farmer_Sales_Report_${timeframe}.pdf`;

  // Colors: Warm Harvest Green & Amber
  const primaryColor = [27, 67, 50]; // #1b4332 Forest Green
  const goldColor = [217, 119, 6]; // #d97706 Amber
  const darkTextColor = [15, 23, 42]; // Slate-900
  const lightTextColor = [71, 85, 105]; // Slate-600
  const accentBorder = [226, 232, 240];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("NATURECART", 15, 16);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(253, 230, 138); // Amber-200
  doc.text("Official Farmer Sales & Invoice Summary Report", 15, 23);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("SALES STATEMENT", 195, 16, { align: "right" });
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Period: ${timeframe.toUpperCase()}`, 195, 23, { align: "right" });

  let currentY = 38;

  // Farm Details Box
  doc.setDrawColor(...accentBorder);
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 28, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...goldColor);
  doc.text("FARM PRODUCER PROFILE", 20, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  doc.text(`Farm Name: ${farmName}`, 20, currentY + 14);
  doc.setTextColor(...lightTextColor);
  doc.text(`Farmer Email: ${farmerUser?.email || "N/A"}`, 20, currentY + 20);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...goldColor);
  doc.text("REPORT AUDIT STAMP", 115, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  doc.text(`Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 115, currentY + 14);
  doc.setTextColor(...lightTextColor);
  doc.text(`Location: ${farmerUser?.location || "Local Producer Zone"}`, 115, currentY + 20);

  currentY += 35;

  // Flatten orders for farmer products
  let totalRevenue = 0;
  let totalItemsSold = 0;
  const rows = [];
  let rowIdx = 1;

  (orders || []).forEach((order) => {
    const orderDate = order.pickupDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A");
    const orderShortId = order._id ? `#NC-${order._id.slice(-6).toUpperCase()}` : "N/A";
    const customerName = order.consumerId?.name || "Consumer";

    (order.products || []).forEach((product) => {
      const status = product.status || order.scopedStatus || order.status;
      if (status === "confirmed" || status === "completed") {
        const qty = Number(product.quantity || 0);
        const price = Number(product.price || 0);
        const lineTotal = qty * price;

        totalRevenue += lineTotal;
        totalItemsSold += qty;

        rows.push([
          rowIdx++,
          orderDate,
          orderShortId,
          customerName,
          product.productName || "Produce",
          `${qty} ${product.unit || "kg"}`,
          `Rs. ${price.toFixed(2)}`,
          `Rs. ${lineTotal.toFixed(2)}`,
        ]);
      }
    });
  });

  // Summary Metrics Banner
  doc.setDrawColor(...goldColor);
  doc.setFillColor(254, 243, 199); // amber-100
  doc.rect(15, currentY, 180, 18, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("Summary Highlights:", 20, currentY + 7);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 70, currentY + 7);
  doc.text(`Fulfilled Orders: ${orders.length}`, 130, currentY + 7);
  doc.text(`Produce Sold: ${totalItemsSold} units`, 20, currentY + 14);

  currentY += 24;

  // Render Table
  autoTable(doc, {
    startY: currentY,
    head: [["#", "Date", "Order #", "Customer", "Produce Item", "Qty", "Unit Price", "Total Revenue"]],
    body: rows.length ? rows : [["-", "N/A", "N/A", "No confirmed sales recorded for this timeframe", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      textColor: darkTextColor,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { cellWidth: 35 },
      4: { cellWidth: 40 },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 21, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // Footer
  doc.setLineWidth(0.2);
  doc.setDrawColor(...accentBorder);
  doc.line(15, 280, 195, 280);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...lightTextColor);
  doc.text("NatureCart Farmers Marketplace • Official Farmer Income & Sales Tax Statement", 15, 285);
  doc.text("Confidential Farm Report", 195, 285, { align: "right" });

  doc.save(filename);
};

export const exportFarmerSalesCsv = (farmerUser, orders = [], timeframe = "All Time") => {
  const farmName = farmerUser?.farmName || farmerUser?.name || "Farmer";
  const filename = `NatureCart_Sales_Report_${farmName}_${timeframe}.csv`;

  const headers = ["Order Date", "Order ID", "Customer Name", "Customer Email", "Produce Item", "Quantity", "Unit Price (Rs)", "Line Revenue (Rs)", "Status"];
  const rows = [];

  (orders || []).forEach((order) => {
    const orderDate = order.pickupDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A");
    const orderShortId = order._id ? `#NC-${order._id.slice(-6).toUpperCase()}` : "N/A";
    const customerName = order.consumerId?.name || "Consumer";
    const customerEmail = order.consumerId?.email || "N/A";

    (order.products || []).forEach((product) => {
      const status = product.status || order.scopedStatus || order.status || "N/A";
      const qty = Number(product.quantity || 0);
      const price = Number(product.price || 0);
      const lineTotal = qty * price;

      rows.push([
        `"${orderDate}"`,
        `"${orderShortId}"`,
        `"${customerName.replace(/"/g, '""')}"`,
        `"${customerEmail.replace(/"/g, '""')}"`,
        `"${(product.productName || "Produce").replace(/"/g, '""')}"`,
        qty,
        price.toFixed(2),
        lineTotal.toFixed(2),
        `"${status}"`,
      ]);
    });
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

