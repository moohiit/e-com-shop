const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #2563eb; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px 24px; color: #333333; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 12px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .order-table th { background-color: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 13px; color: #64748b; }
    .order-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .total-row td { font-weight: 700; border-top: 2px solid #2563eb; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-processing { background-color: #dbeafe; color: #1d4ed8; }
    .status-shipped { background-color: #fef3c7; color: #b45309; }
    .status-delivered { background-color: #d1fae5; color: #065f46; }
    .status-cancelled { background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ShopEase</h1>
    </div>
    <div class="body">
      <h2 style="margin-top:0;">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
      <p>If you have any questions, contact us at support@shopease.com</p>
    </div>
  </div>
</body>
</html>
`;

const formatCurrency = (amount) =>
  `₹${Number(amount).toFixed(2)}`;

const buildItemsTable = (items, showStatus = false) => {
  const statusCol = showStatus ? "<th>Status</th>" : "";
  const rows = items
    .map((item) => {
      const statusTd = showStatus
        ? `<td><span class="status-badge status-${item.orderStatus?.toLowerCase() || "processing"}">${item.orderStatus || "Processing"}</span></td>`
        : "";
      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.price * item.quantity)}</td>
          ${statusTd}
        </tr>`;
    })
    .join("");

  return `
    <table class="order-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          ${statusCol}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

const buildPriceSummary = (order) => `
  <table class="order-table">
    <tr><td>Items Price</td><td style="text-align:right">${formatCurrency(order.itemsPrice)}</td></tr>
    ${order.totalDiscount > 0 ? `<tr><td>Discount</td><td style="text-align:right; color:#dc2626;">-${formatCurrency(order.totalDiscount)}</td></tr>` : ""}
    <tr><td>Tax</td><td style="text-align:right">${formatCurrency(order.taxPrice)}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right">${order.shippingPrice === 0 ? "Free" : formatCurrency(order.shippingPrice)}</td></tr>
    <tr class="total-row"><td>Total</td><td style="text-align:right">${formatCurrency(order.totalPrice)}</td></tr>
  </table>`;

// ─── Order Confirmation ───
export const orderConfirmationEmail = (order, userName) => {
  const paymentInfo =
    order.paymentMethod === "Cash on Delivery"
      ? `<p style="background-color:#fef3c7; padding:12px; border-radius:6px;">Payment Method: <strong>Cash on Delivery</strong> — Please keep ${formatCurrency(order.totalPrice)} ready at the time of delivery.</p>`
      : `<p style="background-color:#d1fae5; padding:12px; border-radius:6px;">Payment: <strong>Paid via ${order.paymentMethod}</strong></p>`;

  const content = `
    <p>Hi ${userName},</p>
    <p>Thank you for your order! Your order <strong>#${order._id}</strong> has been placed successfully.</p>
    ${paymentInfo}
    <h3>Order Items</h3>
    ${buildItemsTable(order.orderItems)}
    ${buildPriceSummary(order)}
    <p>We'll notify you when your items are shipped.</p>
  `;

  return {
    subject: `Order Confirmed — #${order._id}`,
    html: baseTemplate("Order Confirmed!", content),
  };
};

// ─── Item Shipped ───
export const orderShippedEmail = (order, userName, itemName) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>Great news! An item from your order <strong>#${order._id}</strong> has been shipped.</p>
    <p style="background-color:#fef3c7; padding:12px; border-radius:6px;">
      <strong>${itemName}</strong> is now on its way!
    </p>
    <h3>Order Items</h3>
    ${buildItemsTable(order.orderItems, true)}
    <p>You will receive another email when your item is delivered.</p>
  `;

  return {
    subject: `Item Shipped — ${itemName} (Order #${order._id})`,
    html: baseTemplate("Your Item Has Shipped!", content),
  };
};

// ─── Item Delivered ───
export const orderDeliveredEmail = (order, userName, itemName) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>Your item from order <strong>#${order._id}</strong> has been delivered!</p>
    <p style="background-color:#d1fae5; padding:12px; border-radius:6px;">
      <strong>${itemName}</strong> — Delivered successfully
    </p>
    <h3>Order Items</h3>
    ${buildItemsTable(order.orderItems, true)}
    <p>We hope you enjoy your purchase. If you have any issues, please don't hesitate to contact us.</p>
  `;

  return {
    subject: `Item Delivered — ${itemName} (Order #${order._id})`,
    html: baseTemplate("Item Delivered!", content),
  };
};

// ─── Item Cancelled ───
export const orderCancelledEmail = (order, userName, itemName, reason) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>An item from your order <strong>#${order._id}</strong> has been cancelled.</p>
    <p style="background-color:#fee2e2; padding:12px; border-radius:6px;">
      <strong>${itemName}</strong> — Cancelled
      ${reason ? `<br/>Reason: ${reason}` : ""}
    </p>
    <h3>Order Items</h3>
    ${buildItemsTable(order.orderItems, true)}
    ${order.isPaid ? `<p>If you paid online, the refund will be processed within 5-7 business days.</p>` : ""}
    <p>We apologize for any inconvenience.</p>
  `;

  return {
    subject: `Item Cancelled — ${itemName} (Order #${order._id})`,
    html: baseTemplate("Item Cancelled", content),
  };
};

// ─── Seller Application Status ───
export const sellerApplicationStatusEmail = (userName, status, businessName, adminNote) => {
  const isApproved = status === "Approved";
  const statusBg = isApproved ? "#d1fae5" : "#fee2e2";
  const statusColor = isApproved ? "#065f46" : "#991b1b";

  const content = `
    <p>Hi ${userName},</p>
    <p>Your seller application for <strong>${businessName}</strong> has been reviewed.</p>
    <p style="background-color:${statusBg}; color:${statusColor}; padding:12px; border-radius:6px; font-weight:600;">
      Status: ${status}
    </p>
    ${adminNote ? `<p><strong>Admin Note:</strong> ${adminNote}</p>` : ""}
    ${isApproved
      ? `<p>Congratulations! Your account has been upgraded to <strong>Seller</strong>. You can now log in and start listing products.</p>
         <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/auth/login" class="btn">Go to Seller Dashboard</a>`
      : `<p>Unfortunately, your application was not approved at this time. You may submit a new application with updated information.</p>`
    }
  `;

  return {
    subject: `Seller Application ${status} — ${businessName}`,
    html: baseTemplate(`Application ${status}`, content),
  };
};
