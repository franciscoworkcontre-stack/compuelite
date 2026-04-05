"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { trpc } from "@/lib/trpc/client";
import { getShippingOptions, type Carrier, type ShippingOption } from "@/lib/shipping";

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
  const subtotal = totalPrice();

  const [form, setForm] = useState<FormState>({
    guestName: "",
    guestPhone: "",
    line1: "",
    line2: "",
    city: "",
    region: "Región Metropolitana",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormState & { carrier: string }>>({});
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);

  const validateCoupon = trpc.coupons.validate.useQuery(
    { code: couponInput, subtotal },
    { enabled: false, retry: false }
  );

  // Recalculate shipping options whenever region changes
  const shippingOptions: ShippingOption[] = useMemo(
    () => getShippingOptions(form.region),
    [form.region]
  );

  // Reset carrier if selected carrier is not available in new region
  const selectedOption = shippingOptions.find((o) => o.carrier === carrier) ?? null;
  const shippingCost = selectedOption?.price ?? 0;
  const couponDiscount = appliedCoupon?.discount ?? 0;

  // Preview automatic promotions
  const { data: promoPreview } = trpc.promotions.preview.useQuery(
    { items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })), subtotal },
    { enabled: items.length > 0 }
  );
  const promotionDiscount = promoPreview?.totalDiscount ?? 0;
  const effectiveShipping = promoPreview?.freeShipping ? 0 : shippingCost;

  const taxAmount = Math.round((subtotal - couponDiscount - promotionDiscount) * 0.19);
  const total = subtotal + (selectedOption ? effectiveShipping : 0) - couponDiscount - promotionDiscount + taxAmount;

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      clear();
      router.push(`/pago/${order.id}`);
    },
  });

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (field === "region") setCarrier(null); // reset on region change
  };

  const validate = () => {
    const e: Partial<FormState & { carrier: string }> = {};
    if (!form.line1.trim()) e.line1 = "Requerido";
    if (!form.city.trim()) e.city = "Requerido";
    if (!carrier) e.carrier = "Selecciona un método de envío";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !carrier) return;
    createOrder.mutate({
      guestPhone: form.guestPhone || undefined,
      shippingAddress: {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        region: form.region,
      },
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shippingCarrier: carrier,
      couponCode: appliedCoupon?.code,
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
            {/* Form — left 2 cols */}
            <div className="lg:col-span-2 space-y-5">

              {/* Shipping address */}
              <section className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Dirección de entrega
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Teléfono de contacto"
                    type="tel"
                    value={form.guestPhone}
                    onChange={set("guestPhone")}
                    placeholder="+56 9 1234 5678"
                  />
                  <div>
                    <label className="block text-xs text-[#888] uppercase tracking-wider mb-1.5">Región</label>
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
                </div>
              </section>

              {/* Carrier selector */}
              <section className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Método de envío
                </h2>
                <div className="space-y-2">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.carrier}
                      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                        carrier === opt.carrier
                          ? "border-[#00ff66]/40 bg-[#00ff66]/[0.03]"
                          : "border-[#1a1a1a] hover:border-[#252525]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            carrier === opt.carrier
                              ? "border-[#00ff66]"
                              : "border-[#333]"
                          }`}
                        >
                          {carrier === opt.carrier && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="carrier"
                          value={opt.carrier}
                          className="sr-only"
                          onChange={() => setCarrier(opt.carrier)}
                          checked={carrier === opt.carrier}
                        />
                        <div>
                          <p className="text-sm text-white font-medium">{opt.label}</p>
                          <p className="text-xs text-[#555]">{opt.days}</p>
                        </div>
                      </div>
                      <p className="text-sm font-mono font-bold text-white flex-shrink-0">
                        {opt.price === 0 ? (
                          <span className="text-[#00ff66]">Gratis</span>
                        ) : (
                          formatCLP(opt.price)
                        )}
                      </p>
                    </label>
                  ))}
                </div>
                {errors.carrier && (
                  <p className="mt-2 text-xs text-[#ff6666]">{errors.carrier}</p>
                )}
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

              {/* Coupon */}
              <section className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cupón de descuento
                </h2>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between px-3 py-2.5 bg-[#00ff66]/[0.04] border border-[#00ff66]/20 rounded-lg">
                    <div>
                      <p className="text-xs font-mono font-bold text-[#00ff66]">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-[#555]">{appliedCoupon.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs text-[#444] hover:text-[#888] transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO"
                      maxLength={30}
                      className="flex-1 bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors uppercase"
                    />
                    <button
                      type="button"
                      disabled={!couponInput.trim() || validateCoupon.isFetching}
                      onClick={async () => {
                        const result = await validateCoupon.refetch();
                        if (result.data) {
                          const { code, discount, type, value } = result.data;
                          const label = type === "PERCENT"
                            ? `${value}% de descuento`
                            : `-${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value)}`;
                          setAppliedCoupon({ code, discount, label });
                          setCouponInput("");
                        }
                      }}
                      className="px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#222] transition-colors disabled:opacity-40"
                    >
                      {validateCoupon.isFetching ? "…" : "Aplicar"}
                    </button>
                  </div>
                )}
                {validateCoupon.error && (
                  <p className="mt-2 text-xs text-[#ff6666]">{validateCoupon.error.message}</p>
                )}
              </section>

              {/* Transfer notice */}
              <section className="border border-[#1a1a1a] rounded-xl p-4 flex items-start gap-3">
                <span className="text-lg mt-0.5">🏦</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Pago por transferencia</p>
                  <p className="text-xs text-[#666] leading-relaxed">
                    Al confirmar, te enviamos los datos bancarios por email. El pedido se procesa una vez confirmado el pago.
                  </p>
                </div>
              </section>
            </div>

            {/* Order summary — right col */}
            <div className="lg:col-span-1">
              <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 sticky top-24">
                <h2
                  className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tu pedido
                </h2>

                {/* Items */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-2 text-xs">
                      <div className="w-8 h-8 bg-[#0d0d0d] border border-[#222] rounded flex-shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">🖥️</div>
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

                {/* Price breakdown */}
                <div className="border-t border-[#1a1a1a] pt-4 space-y-2 mb-5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#888]">Subtotal</span>
                    <span className="text-white font-mono">{formatCLP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#888]">Despacho</span>
                    {selectedOption ? (
                      <span className="font-mono text-white">
                        {selectedOption.price === 0
                          ? <span className="text-[#00ff66]">Gratis</span>
                          : formatCLP(selectedOption.price)
                        }
                      </span>
                    ) : (
                      <span className="text-[#444] italic">Seleccionar</span>
                    )}
                  </div>
                  {promoPreview?.appliedRules.map((rule) => (
                    <div key={rule.id} className="flex justify-between text-xs">
                      <span className="text-[#00ff66]">🏷️ {rule.name}</span>
                      <span className="font-mono text-[#00ff66]">-{formatCLP(rule.discountAmount)}</span>
                    </div>
                  ))}
                  {promoPreview?.freeShipping && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#00ff66]">🚚 Envío gratis (promo)</span>
                      <span className="font-mono text-[#00ff66]">Gratis</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#00ff66]">Cupón {appliedCoupon.code}</span>
                      <span className="font-mono text-[#00ff66]">-{formatCLP(appliedCoupon.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-[#555]">IVA (19%)</span>
                    <span className="font-mono text-[#555]">{formatCLP(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#141414]">
                    <span className="text-sm text-[#888]">Total</span>
                    <span
                      className="text-2xl font-black font-mono text-[#00ff66]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {formatCLP(total)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#333]">IVA incluido en el total</p>
                </div>

                {createOrder.error && (
                  <div className="mb-4 px-3 py-2 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded text-xs text-[#ff6666]">
                    {createOrder.error.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createOrder.isPending || !carrier}
                  className="w-full py-3 text-center bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {createOrder.isPending ? "Procesando…" : "Confirmar pedido"}
                </button>

                {!carrier && (
                  <p className="text-center text-[10px] text-[#333] mt-2">
                    Selecciona un método de envío
                  </p>
                )}
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
