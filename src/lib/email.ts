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
