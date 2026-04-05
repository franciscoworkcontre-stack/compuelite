import { Resend } from "resend";

const FROM = "Compuelite <pedidos@compuelite.cl>";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface OrderConfirmationData {
  orderNumber: string;
  orderId: string;
  toEmail: string;
  toName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  shippingMethod: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    region: string;
  };
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#aaa;font-size:13px">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#666;font-size:13px;text-align:center">×${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#fff;font-size:13px;text-align:right;font-family:monospace">${formatCLP(item.unitPrice * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;max-width:560px">

        <!-- Header -->
        <tr><td style="background:#080808;padding:24px 32px;border-bottom:1px solid #141414">
          <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#333">Compuelite</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.05em">Pedido confirmado</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 6px;font-size:13px;color:#555">Hola <strong style="color:#aaa">${data.toName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.6">
            Recibimos tu pedido. Te enviaremos los datos de transferencia para confirmar el pago y procesar el despacho.
          </p>

          <!-- Order number -->
          <div style="background:#080808;border:1px solid #1a1a1a;border-radius:8px;padding:14px 20px;margin-bottom:24px">
            <p style="margin:0;font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.12em">Número de pedido</p>
            <p style="margin:4px 0 0;font-size:16px;font-family:monospace;color:#00ff66;font-weight:700">${data.orderNumber}</p>
          </div>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
            ${itemsHtml}
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td style="font-size:12px;color:#555;padding:4px 0">Subtotal</td>
              <td style="font-size:12px;color:#888;text-align:right;font-family:monospace;padding:4px 0">${formatCLP(data.subtotal)}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#555;padding:4px 0">Despacho</td>
              <td style="font-size:12px;color:#888;text-align:right;font-family:monospace;padding:4px 0">${data.shippingCost === 0 ? "Gratis" : formatCLP(data.shippingCost)}</td>
            </tr>
            ${data.discount > 0 ? `<tr>
              <td style="font-size:12px;color:#00ff66;padding:4px 0">Descuento</td>
              <td style="font-size:12px;color:#00ff66;text-align:right;font-family:monospace;padding:4px 0">-${formatCLP(data.discount)}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size:12px;color:#555;padding:4px 0">IVA (19%)</td>
              <td style="font-size:12px;color:#666;text-align:right;font-family:monospace;padding:4px 0">${formatCLP(data.tax)}</td>
            </tr>
            <tr>
              <td style="font-size:15px;color:#fff;font-weight:700;padding:10px 0 0;border-top:1px solid #1a1a1a">Total</td>
              <td style="font-size:15px;color:#00ff66;font-weight:700;text-align:right;font-family:monospace;padding:10px 0 0;border-top:1px solid #1a1a1a">${formatCLP(data.total)}</td>
            </tr>
          </table>

          <!-- Shipping info -->
          <div style="background:#080808;border:1px solid #1a1a1a;border-radius:8px;padding:14px 20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.12em">Datos de entrega</p>
            <p style="margin:0;font-size:13px;color:#888">${data.shippingAddress.name}</p>
            <p style="margin:2px 0;font-size:13px;color:#666">${data.shippingAddress.line1}</p>
            <p style="margin:2px 0;font-size:13px;color:#666">${data.shippingAddress.city}, ${data.shippingAddress.region}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#444">${data.shippingMethod}</p>
          </div>

          <!-- CTA -->
          <div style="text-align:center">
            <a href="${process.env.NEXTAUTH_URL}/pedido/${data.orderId}"
               style="display:inline-block;background:#00ff66;color:#000;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;padding:12px 28px;border-radius:8px">
              Ver mi pedido
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #141414;text-align:center">
          <p style="margin:0;font-size:11px;color:#333">Compuelite · Construye tu PC ideal</p>
          <p style="margin:4px 0 0;font-size:11px;color:#282828">¿Dudas? Contáctanos en soporte@compuelite.cl</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: data.toEmail,
    subject: `Pedido ${data.orderNumber} recibido — Compuelite`,
    html,
  });
}

// ─── Low Stock Alert ────────────────────────────────────────────────────────

export async function sendLowStockAlert(data: {
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
}) {
  const resend = getResend();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!resend || !adminEmail) return;

  const html = `
<!DOCTYPE html><html lang="es"><body style="margin:0;padding:20px;background:#080808;font-family:Arial,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#0f0f0f;border:1px solid #222;border-radius:12px;padding:24px">
    <p style="margin:0 0 4px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.12em">Compuelite — Alerta de stock</p>
    <h2 style="margin:0 0 20px;color:#ff6600;font-size:18px">⚠️ Stock bajo detectado</h2>
    <div style="background:#1a0a00;border:1px solid #ff6600/30;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="margin:0;font-size:14px;color:#fff;font-weight:bold">${data.productName}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#888;font-family:monospace">SKU: ${data.sku}</p>
    </div>
    <table style="width:100%">
      <tr>
        <td style="font-size:12px;color:#666;padding:4px 0">Stock actual</td>
        <td style="font-size:14px;color:#ff6600;font-weight:bold;text-align:right;font-family:monospace">${data.currentStock} unidades</td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#666;padding:4px 0">Umbral configurado</td>
        <td style="font-size:12px;color:#555;text-align:right;font-family:monospace">${data.threshold} unidades</td>
      </tr>
    </table>
    <div style="margin-top:20px;text-align:center">
      <a href="${process.env.NEXTAUTH_URL}/admin/productos" style="display:inline-block;background:#ff6600;color:#fff;font-size:12px;font-weight:bold;text-decoration:none;padding:10px 24px;border-radius:8px">Ver en admin</a>
    </div>
  </div>
</body></html>`;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Stock bajo] ${data.productName} — ${data.currentStock} unidades restantes`,
    html,
  });
}

// ─── Payment Confirmed ───────────────────────────────────────────────────────

export async function sendPaymentConfirmed(data: {
  toEmail: string;
  toName: string;
  orderNumber: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const html = `
<!DOCTYPE html><html lang="es"><body style="margin:0;padding:20px;background:#080808;font-family:Arial,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#0f0f0f;border:1px solid #222;border-radius:12px;padding:28px">
    <p style="margin:0 0 4px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.12em">Compuelite</p>
    <h2 style="margin:0 0 20px;color:#00ff66;font-size:20px">✅ Pago confirmado</h2>
    <p style="font-size:13px;color:#888;margin:0 0 20px">Hola <strong style="color:#aaa">${data.toName}</strong>, confirmamos el pago de tu pedido. Comenzamos a prepararlo.</p>
    <div style="background:#080808;border:1px solid #1a1a1a;border-radius:8px;padding:14px 20px;margin-bottom:20px">
      <p style="margin:0;font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.12em">Pedido</p>
      <p style="margin:4px 0 0;font-size:16px;font-family:monospace;color:#00ff66;font-weight:700">${data.orderNumber}</p>
    </div>
    <table style="width:100%;margin-bottom:20px">
      <tr>
        <td style="font-size:12px;color:#555;padding:4px 0">Monto pagado</td>
        <td style="font-size:14px;color:#fff;font-weight:bold;text-align:right;font-family:monospace">${formatCLP(data.amount)}</td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#555;padding:4px 0">Método de pago</td>
        <td style="font-size:12px;color:#888;text-align:right">${data.paymentMethod}</td>
      </tr>
    </table>
    <div style="text-align:center">
      <a href="${process.env.NEXTAUTH_URL}/pedido/${data.orderId}" style="display:inline-block;background:#00ff66;color:#000;font-size:12px;font-weight:900;text-decoration:none;padding:12px 28px;border-radius:8px">Ver mi pedido</a>
    </div>
  </div>
</body></html>`;

  await resend.emails.send({
    from: FROM,
    to: data.toEmail,
    subject: `Pago confirmado — Pedido ${data.orderNumber}`,
    html,
  });
}

// ─── Order Shipped ───────────────────────────────────────────────────────────

export async function sendOrderShipped(data: {
  toEmail: string;
  toName: string;
  orderNumber: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const html = `
<!DOCTYPE html><html lang="es"><body style="margin:0;padding:20px;background:#080808;font-family:Arial,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#0f0f0f;border:1px solid #222;border-radius:12px;padding:28px">
    <p style="margin:0 0 4px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.12em">Compuelite</p>
    <h2 style="margin:0 0 20px;color:#fff;font-size:20px">🚚 Tu pedido está en camino</h2>
    <p style="font-size:13px;color:#888;margin:0 0 20px">Hola <strong style="color:#aaa">${data.toName}</strong>, tu pedido fue despachado.</p>
    <div style="background:#080808;border:1px solid #1a1a1a;border-radius:8px;padding:14px 20px;margin-bottom:20px">
      <p style="margin:0;font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.12em">Pedido</p>
      <p style="margin:4px 0 0;font-size:16px;font-family:monospace;color:#00ff66;font-weight:700">${data.orderNumber}</p>
    </div>
    <table style="width:100%;margin-bottom:20px">
      <tr><td style="font-size:12px;color:#555;padding:4px 0">Carrier</td><td style="font-size:12px;color:#aaa;text-align:right">${data.carrier}</td></tr>
      <tr><td style="font-size:12px;color:#555;padding:4px 0">Número de seguimiento</td><td style="font-size:13px;color:#fff;font-family:monospace;text-align:right;font-weight:bold">${data.trackingNumber}</td></tr>
      ${data.estimatedDelivery ? `<tr><td style="font-size:12px;color:#555;padding:4px 0">Entrega estimada</td><td style="font-size:12px;color:#888;text-align:right">${data.estimatedDelivery}</td></tr>` : ""}
    </table>
    <div style="text-align:center">
      ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display:inline-block;background:#fff;color:#000;font-size:12px;font-weight:900;text-decoration:none;padding:12px 28px;border-radius:8px;margin-right:8px">Rastrear envío</a>` : ""}
      <a href="${process.env.NEXTAUTH_URL}/pedido/${data.orderId}" style="display:inline-block;background:#1a1a1a;color:#fff;font-size:12px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:8px">Ver pedido</a>
    </div>
  </div>
</body></html>`;

  await resend.emails.send({
    from: FROM,
    to: data.toEmail,
    subject: `Tu pedido ${data.orderNumber} está en camino 🚚`,
    html,
  });
}

// ─── Order Delivered ─────────────────────────────────────────────────────────

export async function sendOrderDelivered(data: {
  toEmail: string;
  toName: string;
  orderNumber: string;
  orderId: string;
  productSlug?: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const html = `
<!DOCTYPE html><html lang="es"><body style="margin:0;padding:20px;background:#080808;font-family:Arial,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#0f0f0f;border:1px solid #222;border-radius:12px;padding:28px">
    <p style="margin:0 0 4px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.12em">Compuelite</p>
    <h2 style="margin:0 0 20px;color:#00ff66;font-size:20px">📦 Pedido entregado</h2>
    <p style="font-size:13px;color:#888;margin:0 0 20px">Hola <strong style="color:#aaa">${data.toName}</strong>, tu pedido <strong style="color:#fff">${data.orderNumber}</strong> fue entregado. ¡Esperamos que lo disfrutes!</p>
    <p style="font-size:13px;color:#555;margin:0 0 20px">¿Cómo fue tu experiencia? Deja una reseña y ayuda a otros compradores.</p>
    <div style="text-align:center">
      ${data.productSlug ? `<a href="${process.env.NEXTAUTH_URL}/productos/${data.productSlug}#reviews" style="display:inline-block;background:#00ff66;color:#000;font-size:12px;font-weight:900;text-decoration:none;padding:12px 28px;border-radius:8px;margin-right:8px">Dejar reseña</a>` : ""}
      <a href="${process.env.NEXTAUTH_URL}/pedido/${data.orderId}" style="display:inline-block;background:#1a1a1a;color:#fff;font-size:12px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:8px">Ver pedido</a>
    </div>
  </div>
</body></html>`;

  await resend.emails.send({
    from: FROM,
    to: data.toEmail,
    subject: `Tu pedido fue entregado — ¿nos dejas una reseña?`,
    html,
  });
}
