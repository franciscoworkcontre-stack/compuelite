"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { trpc } from "@/lib/trpc/client";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

const REGIONS = [
  "Región Metropolitana",
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
];

interface FormState {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  notes: string;
}

export function CheckoutView() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCartStore();
  const total = totalPrice();

  const [form, setForm] = useState<FormState>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    line1: "",
    line2: "",
    city: "",
    region: "Región Metropolitana",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      clear();
      router.push(`/pago/${order.id}`);
    },
  });

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.guestName.trim()) e.guestName = "Requerido";
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail))
      e.guestEmail = "Email inválido";
    if (!form.line1.trim()) e.line1 = "Requerido";
    if (!form.city.trim()) e.city = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createOrder.mutate({
      guestName: form.guestName,
      guestEmail: form.guestEmail,
      guestPhone: form.guestPhone || undefined,
      shippingAddress: {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        region: form.region,
      },
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      notes: form.notes || undefined,
    });
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#555] mb-4">No hay productos en el carrito.</p>
          <Link href="/productos" className="text-[#00ff66] hover:underline text-sm">
            Ir a productos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#555] mb-8">
          <Link href="/carrito" className="hover:text-[#888] transition-colors">Carrito</Link>
          <span>›</span>
          <span className="text-white">Datos de envío</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <section className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Datos de contacto
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Nombre completo *"
                    value={form.guestName}
                    onChange={set("guestName")}
                    error={errors.guestName}
                    placeholder="Juan Pérez"
                  />
                  <Field
                    label="Email *"
                    type="email"
                    value={form.guestEmail}
                    onChange={set("guestEmail")}
                    error={errors.guestEmail}
                    placeholder="juan@email.com"
                  />
                  <Field
                    label="Teléfono"
                    type="tel"
                    value={form.guestPhone}
                    onChange={set("guestPhone")}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </section>

              {/* Shipping */}
              <section className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Dirección de envío
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field
                      label="Dirección *"
                      value={form.line1}
                      onChange={set("line1")}
                      error={errors.line1}
                      placeholder="Av. Principal 1234, Dpto 5"
                    />
                  </div>
                  <Field
                    label="Referencia"
                    value={form.line2}
                    onChange={set("line2")}
                    placeholder="Torre A, piso 3..."
                  />
                  <Field
                    label="Ciudad / Comuna *"
                    value={form.city}
                    onChange={set("city")}
                    error={errors.city}
                    placeholder="Santiago"
                  />
                  <div>
                    <label className="block text-xs text-[#888] uppercase tracking-wider mb-1.5">
                      Región
                    </label>
                    <select
                      value={form.region}
                      onChange={set("region")}
                      className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00ff66]/40 transition-colors"
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Notes */}
              <section className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Notas del pedido
                </h2>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  placeholder="Instrucciones especiales de entrega..."
                  className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors resize-none"
                />
              </section>

              {/* Payment info */}
              <section className="bg-[#0d1a0d] border border-[#00ff66]/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🏦</span>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Pago por transferencia</p>
                    <p className="text-xs text-[#888] leading-relaxed">
                      Al confirmar tu pedido, te enviaremos los datos de la cuenta bancaria por email.
                      Una vez confirmado el pago, tu pedido será procesado y despachado.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 sticky top-24">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tu pedido
                </h2>

                <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-2 text-xs">
                      <div className="w-8 h-8 bg-[#0d0d0d] border border-[#222] rounded flex-shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base">🖥️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{item.name}</p>
                        <p className="text-[#555]">×{item.quantity}</p>
                      </div>
                      <p className="text-[#888] font-mono flex-shrink-0">
                        {formatCLP(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#222] pt-4 mb-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-[#888]">Total</span>
                    <span
                      className="text-2xl font-black font-mono text-[#00ff66]"
                      style={{
                        fontFamily: "var(--font-display)",
                        textShadow: "0 0 16px rgba(0,255,102,0.3)",
                      }}
                    >
                      {formatCLP(total)}
                    </span>
                  </div>
                  <p className="text-xs text-[#555] mt-1">IVA incluido · Despacho gratis RM</p>
                </div>

                {createOrder.error && (
                  <div className="mb-4 px-3 py-2 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded text-xs text-[#ff6666]">
                    {createOrder.error.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="w-full py-3 text-center bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all disabled:opacity-50 disabled:cursor-wait"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {createOrder.isPending ? "Procesando…" : "Confirmar pedido"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[#888] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[#0d0d0d] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none transition-colors ${
          error
            ? "border-[#ff3333]/60 focus:border-[#ff3333]"
            : "border-[#222] focus:border-[#00ff66]/40"
        }`}
      />
      {error && <p className="mt-1 text-xs text-[#ff6666]">{error}</p>}
    </div>
  );
}
