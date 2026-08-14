export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    const {
      customerEmail, customerName, orderId, items,
      subtotal, deliveryFee, discount, total, address
    } = body;

    if (!customerEmail || !orderId || !Array.isArray(items) || !address) {
      return res.status(400).json({ error: "Missing order information" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.ORDER_NOTIFICATION_EMAIL;

    if (!apiKey || !ownerEmail) {
      return res.status(500).json({ error: "Email service is not configured" });
    }

    const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[c]));

    const rows = items.map((item) => `
      <tr>
        <td style="padding:8px 0">${esc(item.name)}</td>
        <td style="padding:8px;text-align:center">${Number(item.quantity)}</td>
        <td style="padding:8px;text-align:right">₹${Number(item.amount).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#20261f">
        <h1 style="font-family:Georgia,serif">Prime Panache</h1>
        <p>Hello ${esc(customerName || "there")},</p>
        <p>Thank you for shopping with Prime Panache. Your order has been received.</p>
        <h2>Order #${esc(orderId)}</h2>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <hr>
        <p>Subtotal: ₹${Number(subtotal).toLocaleString("en-IN")}<br>
        Delivery: ₹${Number(deliveryFee).toLocaleString("en-IN")}<br>
        Discount: −₹${Number(discount || 0).toLocaleString("en-IN")}</p>
        <h3>Total: ₹${Number(total).toLocaleString("en-IN")}</h3>
        <h3>Shipping address</h3>
        <p>${esc(address.name)}<br>${esc(address.address)}<br>
        ${esc(address.city)}, ${esc(address.state)} - ${esc(address.pin)}<br>
        Phone: ${esc(address.phone)}</p>
        <p>We will update you when your order is dispatched.</p>
      </div>`;

    const ownerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#20261f">
        <h1>🔔 New Prime Panache Order</h1>
        <h2>#${esc(orderId)}</h2>
        <p><b>Customer:</b> ${esc(customerName || "")}<br>
        <b>Email:</b> ${esc(customerEmail)}<br>
        <b>Phone:</b> ${esc(address.phone)}</p>
        <h3>Items</h3>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p>Subtotal: ₹${Number(subtotal).toLocaleString("en-IN")}<br>
        Delivery: ₹${Number(deliveryFee).toLocaleString("en-IN")}<br>
        Discount: −₹${Number(discount || 0).toLocaleString("en-IN")}<br>
        <b>Total: ₹${Number(total).toLocaleString("en-IN")}</b></p>
        <h3>Shipping address</h3>
        <p>${esc(address.name)}<br>${esc(address.address)}<br>
        ${esc(address.city)}, ${esc(address.state)} - ${esc(address.pin)}<br>
        Phone: ${esc(address.phone)}</p>
      </div>`;

    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    // Test sender. Replace with a verified Prime Panache domain before production.
    const from = "Prime Panache <onboarding@resend.dev>";

    const send = (payload) => fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const owner = await send({
      from,
      to: [ownerEmail],
      subject: `New Prime Panache Order #${orderId}`,
      html: ownerHtml
    });

    if (!owner.ok) {
      return res.status(502).json({
        error: "Owner email failed",
        detail: await owner.text()
      });
    }

    const customer = await send({
      from,
      to: [customerEmail],
      subject: `Order confirmed — Prime Panache #${orderId}`,
      html: customerHtml
    });

    if (!customer.ok) {
      return res.status(200).json({
        ownerEmailSent: true,
        customerEmailSent: false,
        customerEmailError: await customer.text()
      });
    }

    return res.status(200).json({
      ownerEmailSent: true,
      customerEmailSent: true
    });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected email error" });
  }
}
