"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
type PaymentMethod = "TRANSFER" | "WEBPAY" | "FLOW" | "MERCADOPAGO";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface OrderItem {
  id: string;
  quantity: number;
  totalPrice: number;
  product: { name: string; images: { url: string }[] };
}

interface Order {
  id: string;
  orderNumber: string;
  guestEmail: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  shippingAddress: { name: string; line1: string; line2?: string; city: string; region: string };
  items: OrderItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA — simulados · conectar con trpc.admin.orders cuando haya pedidos reales
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_ORDERS: Order[] = [
  {
    id: "ord_01",
    orderNumber: "CE-2025-0142",
    guestEmail: "matias.fuentes@gmail.com",
    total: 2_490_000,
    status: "DELIVERED",
    paymentMethod: "WEBPAY",
    paymentStatus: "PAID",
    createdAt: "2025-03-28T14:22:00Z",
    shippingAddress: { name: "Matías Fuentes", line1: "Av. Providencia 1250, Depto 3B", city: "Providencia", region: "Región Metropolitana" },
    items: [
      { id: "i1", quantity: 1, totalPrice: 1_890_000, product: { name: "RTX 4070 Ti Super 16GB GDDR6X", images: [] } },
      { id: "i2", quantity: 2, totalPrice: 600_000,   product: { name: "Vengeance 32GB DDR5 5600MHz (2×16)", images: [] } },
    ],
  },
  {
    id: "ord_02",
    orderNumber: "CE-2025-0141",
    guestEmail: "carolina.morales@outlook.com",
    total: 1_680_000,
    status: "SHIPPED",
    paymentMethod: "FLOW",
    paymentStatus: "PAID",
    createdAt: "2025-04-01T09:15:00Z",
    shippingAddress: { name: "Carolina Morales", line1: "Las Condes 8430", city: "Las Condes", region: "Región Metropolitana" },
    items: [
      { id: "i3", quantity: 1, totalPrice: 1_350_000, product: { name: "Ryzen 9 7950X 16-Core 4.5GHz", images: [] } },
      { id: "i4", quantity: 1, totalPrice: 330_000,   product: { name: "Samsung 990 Pro 2TB NVMe M.2", images: [] } },
    ],
  },
  {
    id: "ord_03",
    orderNumber: "CE-2025-0140",
    guestEmail: "pedro.henriquez@empresa.cl",
    total: 890_000,
    status: "PROCESSING",
    paymentMethod: "WEBPAY",
    paymentStatus: "PAID",
    createdAt: "2025-04-03T16:40:00Z",
    shippingAddress: { name: "Pedro Henríquez", line1: "O'Higgins 220, Of. 12", city: "Valparaíso", region: "Región de Valparaíso" },
    items: [
      { id: "i5", quantity: 1, totalPrice: 890_000, product: { name: "Core i9-14900K 3.2GHz 24-Core", images: [] } },
    ],
  },
  {
    id: "ord_04",
    orderNumber: "CE-2025-0139",
    guestEmail: "ignacio.vega@gmail.com",
    total: 3_120_000,
    status: "CONFIRMED",
    paymentMethod: "TRANSFER",
    paymentStatus: "PAID",
    createdAt: "2025-04-04T11:05:00Z",
    shippingAddress: { name: "Ignacio Vega", line1: "Av. Vitacura 3650", city: "Vitacura", region: "Región Metropolitana" },
    items: [
      { id: "i6", quantity: 1, totalPrice: 2_580_000, product: { name: "RTX 4080 Super 16GB GDDR6X", images: [] } },
      { id: "i7", quantity: 1, totalPrice: 290_000,   product: { name: "B650E Carbon WiFi ATX AM5", images: [] } },
      { id: "i8", quantity: 1, totalPrice: 250_000,   product: { name: "Corsair RM850x 80+ Gold", images: [] } },
    ],
  },
  {
    id: "ord_05",
    orderNumber: "CE-2025-0138",
    guestEmail: "valentina.rios@gmail.com",
    total: 480_000,
    status: "PENDING",
    paymentMethod: "TRANSFER",
    paymentStatus: "PENDING",
    createdAt: "2025-04-05T08:30:00Z",
    shippingAddress: { name: "Valentina Ríos", line1: "Manuel Montt 1800", city: "Ñuñoa", region: "Región Metropolitana" },
    items: [
      { id: "i9",  quantity: 1, totalPrice: 280_000, product: { name: "RX 7600 XT 16GB GDDR6", images: [] } },
      { id: "i10", quantity: 2, totalPrice: 200_000, product: { name: "Kingston A2000 500GB NVMe", images: [] } },
    ],
  },
  {
    id: "ord_06",
    orderNumber: "CE-2025-0137",
    guestEmail: "sebastian.castro@hotmail.com",
    total: 670_000,
    status: "PENDING",
    paymentMethod: "TRANSFER",
    paymentStatus: "PENDING",
    createdAt: "2025-04-05T10:12:00Z",
    shippingAddress: { name: "Sebastián Castro", line1: "Gran Avenida 5400, Casa 3", city: "San Miguel", region: "Región Metropolitana" },
    items: [
      { id: "i11", quantity: 1, totalPrice: 670_000, product: { name: "Core i7-14700K 3.4GHz 20-Core", images: [] } },
    ],
  },
  {
    id: "ord_07",
    orderNumber: "CE-2025-0136",
    guestEmail: "andrea.perez@utem.cl",
    total: 195_000,
    status: "DELIVERED",
    paymentMethod: "MERCADOPAGO",
    paymentStatus: "PAID",
    createdAt: "2025-03-20T13:55:00Z",
    shippingAddress: { name: "Andrea Pérez", line1: "Dieciocho 161, Dpto 8", city: "Santiago Centro", region: "Región Metropolitana" },
    items: [
      { id: "i12", quantity: 1, totalPrice: 95_000,  product: { name: "Logitech G502 X Plus Wireless", images: [] } },
      { id: "i13", quantity: 1, totalPrice: 100_000, product: { name: "Corsair K70 RGB MK.2 TKL", images: [] } },
    ],
  },
  {
    id: "ord_08",
    orderNumber: "CE-2025-0135",
    guestEmail: "nicolas.lara@empresa.cl",
    total: 1_950_000,
    status: "DELIVERED",
    paymentMethod: "WEBPAY",
    paymentStatus: "PAID",
    createdAt: "2025-03-15T17:20:00Z",
    shippingAddress: { name: "Nicolás Lara", line1: "Apoquindo 4501, Of. 501", city: "Las Condes", region: "Región Metropolitana" },
    items: [
      { id: "i14", quantity: 1, totalPrice: 1_650_000, product: { name: "RX 7900 XTX 24GB GDDR6", images: [] } },
      { id: "i15", quantity: 1, totalPrice: 300_000,   product: { name: "Fractal Design Torrent ATX", images: [] } },
    ],
  },
  {
    id: "ord_09",
    orderNumber: "CE-2025-0134",
    guestEmail: "camila.gutierrez@gmail.com",
    total: 420_000,
    status: "CANCELLED",
    paymentMethod: "WEBPAY",
    paymentStatus: "REFUNDED",
    createdAt: "2025-03-10T09:00:00Z",
    shippingAddress: { name: "Camila Gutiérrez", line1: "Av. Maipú 2300", city: "Maipú", region: "Región Metropolitana" },
    items: [
      { id: "i16", quantity: 2, totalPrice: 420_000, product: { name: "G.Skill Trident Z5 32GB DDR5", images: [] } },
    ],
  },
  {
    id: "ord_10",
    orderNumber: "CE-2025-0133",
    guestEmail: "daniel.espinoza@gmail.com",
    total: 2_890_000,
    status: "SHIPPED",
    paymentMethod: "FLOW",
    paymentStatus: "PAID",
    createdAt: "2025-04-02T15:10:00Z",
    shippingAddress: { name: "Daniel Espinoza", line1: "Condell 1250", city: "Concepción", region: "Región del Biobío" },
    items: [
      { id: "i17", quantity: 1, totalPrice: 2_580_000, product: { name: "RTX 4090 24GB GDDR6X", images: [] } },
      { id: "i18", quantity: 1, totalPrice: 310_000,   product: { name: "Noctua NH-D15 Chromax Black", images: [] } },
    ],
  },
  {
    id: "ord_11",
    orderNumber: "CE-2025-0132",
    guestEmail: "jorge.silva@puc.cl",
    total: 340_000,
    status: "DELIVERED",
    paymentMethod: "WEBPAY",
    paymentStatus: "PAID",
    createdAt: "2025-03-05T12:30:00Z",
    shippingAddress: { name: "Jorge Silva", line1: "Vicuña Mackenna 4860", city: "Macul", region: "Región Metropolitana" },
    items: [
      { id: "i19", quantity: 1, totalPrice: 210_000, product: { name: "MSI MAG B760M Mortar WiFi", images: [] } },
      { id: "i20", quantity: 1, totalPrice: 130_000, product: { name: "WD Blue 1TB SN570 NVMe", images: [] } },
    ],
  },
  {
    id: "ord_12",
    orderNumber: "CE-2025-0131",
    guestEmail: "francisca.navarro@gmail.com",
    total: 760_000,
    status: "PROCESSING",
    paymentMethod: "MERCADOPAGO",
    paymentStatus: "PAID",
    createdAt: "2025-04-04T14:00:00Z",
    shippingAddress: { name: "Francisca Navarro", line1: "Los Leones 180, Dpto 12B", city: "Providencia", region: "Región Metropolitana" },
    items: [
      { id: "i21", quantity: 1, totalPrice: 580_000, product: { name: "Ryzen 7 7700X 8-Core 4.7GHz", images: [] } },
      { id: "i22", quantity: 1, totalPrice: 180_000, product: { name: "Corsair H150i Elite LCD XT", images: [] } },
    ],
  },
  {
    id: "ord_13",
    orderNumber: "CE-2025-0130",
    guestEmail: "roberto.campos@empresa.cl",
    total: 5_640_000,
    status: "CONFIRMED",
    paymentMethod: "TRANSFER",
    paymentStatus: "PAID",
    createdAt: "2025-04-03T10:25:00Z",
    shippingAddress: { name: "Roberto Campos", line1: "Isidora Goyenechea 3000, Of. 1801", city: "Las Condes", region: "Región Metropolitana" },
    items: [
      { id: "i23", quantity: 2, totalPrice: 5_160_000, product: { name: "RTX 4090 24GB GDDR6X", images: [] } },
      { id: "i24", quantity: 2, totalPrice: 480_000,   product: { name: "Corsair RM1000x 80+ Gold", images: [] } },
    ],
  },
  {
    id: "ord_14",
    orderNumber: "CE-2025-0129",
    guestEmail: "pablo.medina@hotmail.com",
    total: 128_000,
    status: "DELIVERED",
    paymentMethod: "WEBPAY",
    paymentStatus: "PAID",
    createdAt: "2025-02-28T11:10:00Z",
    shippingAddress: { name: "Pablo Medina", line1: "Av. La Florida 9600", city: "La Florida", region: "Región Metropolitana" },
    items: [
      { id: "i25", quantity: 1, totalPrice: 128_000, product: { name: "Logitech G Pro X Superlight 2", images: [] } },
    ],
  },
  {
    id: "ord_15",
    orderNumber: "CE-2025-0128",
    guestEmail: "sofia.miranda@gmail.com",
    total: 1_240_000,
    status: "REFUNDED",
    paymentMethod: "WEBPAY",
    paymentStatus: "REFUNDED",
    createdAt: "2025-02-20T16:45:00Z",
    shippingAddress: { name: "Sofía Miranda", line1: "Colón 1025", city: "Viña del Mar", region: "Región de Valparaíso" },
    items: [
      { id: "i26", quantity: 1, totalPrice: 1_240_000, product: { name: "RTX 4070 Super 12GB GDDR6X", images: [] } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Pendiente",   color: "#b45309", bg: "#fef3c7" },
  CONFIRMED:  { label: "Confirmado",  color: "#1d4ed8", bg: "#eff6ff" },
  PROCESSING: { label: "Procesando",  color: "#0e7490", bg: "#ecfeff" },
  SHIPPED:    { label: "Despachado",  color: "#7c3aed", bg: "#f5f3ff" },
  DELIVERED:  { label: "Entregado",   color: "#15803d", bg: "#f0fdf4" },
  CANCELLED:  { label: "Cancelado",   color: "#dc2626", bg: "#fef2f2" },
  REFUNDED:   { label: "Reembolsado", color: "#64748b", bg: "#f8fafc" },
};

const PAYMENT_LABEL: Record<string, string> = {
  WEBPAY: "WebPay Plus",
  TRANSFER: "Transferencia",
  FLOW: "Flow",
  MERCADOPAGO: "MercadoPago",
};

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const visible = orders.filter((o) => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.orderNumber.toLowerCase().includes(q) && !o.guestEmail.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  function setStatus(orderId: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }

  function confirmTransfer(orderId: string) {
    setOrders((prev) => prev.map((o) =>
      o.id === orderId ? { ...o, paymentStatus: "PAID", status: "CONFIRMED" } : o
    ));
  }

  const counts = Object.fromEntries(
    (Object.keys(STATUS_META) as OrderStatus[]).map((s) => [s, orders.filter((o) => o.status === s).length])
  ) as Record<OrderStatus, number>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-[#111827] uppercase tracking-wide">Pedidos</h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            {visible.length} de {orders.length} pedidos
            {" · "}<span className="italic">datos simulados</span>
          </p>
        </div>
        <input
          type="text"
          placeholder="Buscar nº orden o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs border border-[#e5e7eb] rounded-lg px-3 py-2 w-56 bg-[#fafafa] focus:outline-none focus:border-[#2563eb]/50 focus:bg-white transition-colors"
        />
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilterStatus(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            !filterStatus
              ? "bg-[#111827] text-white border-[#111827]"
              : "border-[#e5e7eb] text-[#6b7280] hover:text-[#374151] hover:bg-[#f9fafb]"
          }`}
        >
          Todos · {orders.length}
        </button>
        {(Object.keys(STATUS_META) as OrderStatus[]).map((s) => {
          const meta = STATUS_META[s];
          const active = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(active ? null : s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
              style={{
                borderColor: active ? meta.color + "60" : "#e5e7eb",
                color: active ? meta.color : "#6b7280",
                background: active ? meta.bg : "transparent",
              }}
            >
              {meta.label} · {counts[s]}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-xs text-[#9ca3af]">Sin resultados</div>
      ) : (
        <div className="space-y-2">
          {visible.map((order, idx) => {
            const meta = STATUS_META[order.status];
            const isExpanded = expandedId === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden"
              >
                {/* Row */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#f9fafb] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Status dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />

                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                    <div className="col-span-1">
                      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">Orden</p>
                      <p className="text-xs font-mono font-bold text-[#374151]">{order.orderNumber}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2 min-w-0">
                      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">Cliente</p>
                      <p className="text-xs text-[#111827] truncate">{order.guestEmail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">Total</p>
                      <p className="text-sm font-black font-mono text-[#111827]">{formatCLP(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">Estado</p>
                      <span
                        className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-[#9ca3af]">{PAYMENT_LABEL[order.paymentMethod]}</span>
                    <span className="text-[10px] text-[#9ca3af]">{formatDate(order.createdAt)}</span>
                  </div>

                  <svg
                    className={`w-4 h-4 text-[#9ca3af] flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#f3f4f6] px-5 py-5 bg-[#fafafa] space-y-5">

                        {/* Products */}
                        <div>
                          <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Productos</p>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white border border-[#f3f4f6] rounded-lg px-3 py-2">
                                <div className="w-7 h-7 bg-[#f3f4f6] rounded flex items-center justify-center text-sm flex-shrink-0">
                                  🖥️
                                </div>
                                <p className="text-xs text-[#374151] flex-1 truncate">{item.product.name}</p>
                                <span className="text-[10px] text-[#9ca3af]">×{item.quantity}</span>
                                <p className="text-xs font-mono font-bold text-[#111827]">{formatCLP(item.totalPrice)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Info row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Dirección de envío</p>
                            <p className="text-xs text-[#374151]">
                              {order.shippingAddress.name}<br />
                              {order.shippingAddress.line1}
                              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                              {order.shippingAddress.city}, {order.shippingAddress.region}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Pago</p>
                            <p className="text-xs text-[#374151]">{PAYMENT_LABEL[order.paymentMethod]}</p>
                            <p className="text-[10px] text-[#9ca3af] mt-0.5">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>

                        {/* Confirm transfer */}
                        {order.paymentMethod === "TRANSFER" && order.paymentStatus === "PENDING" && (
                          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-3 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold text-[#b45309]">Transferencia bancaria pendiente</p>
                              <p className="text-[10px] text-[#92400e] mt-0.5">Confirma cuando recibas el pago</p>
                            </div>
                            <button
                              onClick={() => confirmTransfer(order.id)}
                              className="px-3 py-1.5 bg-[#b45309]/10 border border-[#b45309]/30 rounded-lg text-xs text-[#b45309] hover:bg-[#b45309]/20 transition-all flex-shrink-0"
                            >
                              ✓ Confirmar pago
                            </button>
                          </div>
                        )}

                        {/* Status flow */}
                        <div>
                          <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Actualizar estado</p>
                          <div className="flex gap-2 flex-wrap">
                            {STATUS_FLOW.map((s) => {
                              const m = STATUS_META[s];
                              const isCurrent = order.status === s;
                              return (
                                <button
                                  key={s}
                                  disabled={isCurrent}
                                  onClick={() => setStatus(order.id, s)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                                  style={{
                                    borderColor: isCurrent ? m.color + "60" : "#e5e7eb",
                                    color: isCurrent ? m.color : "#6b7280",
                                    background: isCurrent ? m.bg : "transparent",
                                  }}
                                >
                                  {isCurrent && "✓ "}{m.label}
                                </button>
                              );
                            })}
                            <button
                              disabled={order.status === "CANCELLED"}
                              onClick={() => setStatus(order.id, "CANCELLED")}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#e5e7eb] text-[#9ca3af] hover:border-[#dc2626]/40 hover:text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-30 disabled:cursor-default transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
