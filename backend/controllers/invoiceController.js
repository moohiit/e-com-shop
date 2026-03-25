import PDFDocument from "pdfkit";
import Order from "../models/Order.js";

const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate([
      { path: "user", select: "name email" },
      {
        path: "shippingAddress",
        select:
          "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
      },
      {
        path: "orderItems.product",
        select: "name brand",
      },
    ]);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only order owner or admin can download
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    // --- Header ---
    doc.fontSize(24).font("Helvetica-Bold").text("ShopEase", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("Tax Invoice / Receipt", { align: "center" });
    doc.moveDown(0.5);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#2563eb");
    doc.moveDown(0.5);

    // --- Order Info ---
    const topY = doc.y;
    doc.fontSize(10).font("Helvetica-Bold").text("Invoice Details", 50, topY);
    doc.font("Helvetica").fontSize(9);
    doc.text(`Order ID: ${order._id}`, 50, doc.y + 4);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`);
    doc.text(`Payment: ${order.paymentMethod}`);
    doc.text(`Status: ${order.isPaid ? "Paid" : "Pending"}`);

    // --- Billing / Shipping ---
    doc.font("Helvetica-Bold").fontSize(10).text("Ship To", 320, topY);
    doc.font("Helvetica").fontSize(9);
    const addr = order.shippingAddress;
    if (addr) {
      doc.text(addr.fullName, 320, doc.y + 4, { width: 225 });
      doc.text(`${addr.flatOrBuilding}, ${addr.locality}`, 320, doc.y, { width: 225 });
      doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 320, doc.y, { width: 225 });
      doc.text(`Phone: ${addr.mobileNumber}`, 320, doc.y, { width: 225 });
    }

    // Customer info
    doc.moveDown(1.5);
    doc.font("Helvetica-Bold").fontSize(10).text("Customer", 50);
    doc.font("Helvetica").fontSize(9);
    doc.text(`${order.user.name} (${order.user.email})`);

    doc.moveDown(1);

    // --- Items Table ---
    const tableTop = doc.y;
    const col = { name: 50, qty: 300, price: 360, tax: 430, total: 490 };

    // Table header
    doc.rect(50, tableTop, 495, 20).fill("#2563eb");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("Product", col.name + 5, tableTop + 5, { width: 240 });
    doc.text("Qty", col.qty + 5, tableTop + 5, { width: 50 });
    doc.text("Price", col.price + 5, tableTop + 5, { width: 60 });
    doc.text("Tax", col.tax + 5, tableTop + 5, { width: 55 });
    doc.text("Total", col.total + 5, tableTop + 5, { width: 50 });

    doc.fillColor("#333333").font("Helvetica").fontSize(9);
    let rowY = tableTop + 24;

    for (const item of order.orderItems) {
      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }

      const bg = order.orderItems.indexOf(item) % 2 === 0 ? "#f8fafc" : "#ffffff";
      doc.rect(50, rowY - 2, 495, 18).fill(bg);
      doc.fillColor("#333333");

      const itemName = item.name || "Unknown";
      const cancelled = item.isCancelled ? " [Cancelled]" : "";

      doc.text(itemName + cancelled, col.name + 5, rowY, { width: 240 });
      doc.text(String(item.quantity), col.qty + 5, rowY, { width: 50 });
      doc.text(formatCurrency(item.basePrice), col.price + 5, rowY, { width: 60 });
      doc.text(formatCurrency(item.taxAmount * item.quantity), col.tax + 5, rowY, { width: 55 });
      doc.text(formatCurrency(item.price * item.quantity), col.total + 5, rowY, { width: 50 });

      rowY += 20;
    }

    // --- Price Summary ---
    rowY += 10;
    doc.moveTo(50, rowY).lineTo(545, rowY).stroke("#e2e8f0");
    rowY += 10;

    const summaryX = 380;
    const valX = 490;

    const summaryLines = [
      ["Items Price", formatCurrency(order.itemsPrice)],
    ];

    if (order.totalDiscount > 0) {
      summaryLines.push(["Discount", `-${formatCurrency(order.totalDiscount)}`]);
    }

    summaryLines.push(["Tax", formatCurrency(order.taxPrice)]);
    summaryLines.push(["Shipping", order.shippingPrice === 0 ? "Free" : formatCurrency(order.shippingPrice)]);

    doc.font("Helvetica").fontSize(9);
    for (const [label, value] of summaryLines) {
      doc.text(label, summaryX, rowY);
      doc.text(value, valX, rowY, { width: 55, align: "right" });
      rowY += 16;
    }

    // Total
    doc.moveTo(summaryX, rowY).lineTo(545, rowY).stroke("#2563eb");
    rowY += 6;
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Total", summaryX, rowY);
    doc.text(formatCurrency(order.totalPrice), valX, rowY, { width: 55, align: "right" });

    // --- Footer ---
    doc.moveDown(3);
    doc.font("Helvetica").fontSize(8).fillColor("#94a3b8");
    doc.text("This is a computer-generated invoice and does not require a signature.", 50, doc.y, {
      align: "center",
      width: 495,
    });
    doc.text("Thank you for shopping with ShopEase!", { align: "center", width: 495 });

    doc.end();
  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to generate invoice" });
  }
};
