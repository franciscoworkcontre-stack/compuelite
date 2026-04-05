"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const DEALS = [
  {
    label: "Serie START — Más vendido",
    name: "PC Gamer Ryzen 5 + RTX 3050",
    specs: "6-Core · 16GB DDR4 · 1TB NVMe",
    price: 863446,
    was: 937000,
    pct: 8,
    href: "/productos/pc-gamer-amd-ryzen-5-5500-6-core-16gb-ddr4-rtx-3050-6gb-pcb4",
    img: "https://cdnx.jumpseller.com/compuelite/image/71549613/thumb/1000/1000?1767716671",
  },
  {
    label: "Serie START — Desde",
    name: "PC Gamer Ryzen 7 5700G",
    specs: "8-Core · 16GB DDR4 · Radeon integrada",
    price: 667166,
    was: 724000,
    pct: 8,
    href: "/productos/pc-gamer-amd-ryzen-7-5700g-8-core-radeon-16gb-ddr4-pcb307",
    img: "https://cdnx.jumpseller.com/compuelite/image/67991777/thumb/1000/1000?1759162173",
  },
  {
    label: "Mayor descuento · -12%",
    name: "PC Gamer Intel i5 12400F + RTX 3050",
    specs: "6-Core · 16GB DDR4 · H610 WiFi",
    price: 876432,
    was: 992000,
    pct: 12,
    href: "/productos/pc-gamer-intel-i5-12400f-6-core-h610-wifi-16gb-ddr4-ssd-1tb-",
    img: "https://cdnx.jumpseller.com/compuelite/image/62387794/thumb/1000/1000?1744327929",
  },
];

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

export function HeroSection() {
  const [active, setActive] = useState(0);

  // Auto-rotate every 5s
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % DEALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const deal = DEALS[active];

  return (
    <section className="relative w-full bg-[#080808] overflow-hidden border-b border-[#111]">
      {/* Background glow behind PC image */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ background: "radial-gradient(ellipse 60% 80% at 30% 50%, rgba(0,255,102,0.06) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* LEFT — PC image */}
          <div className="relative order-2 lg:order-1 flex items-center justify-center">
            {/* Sale badge */}
            <div className="absolute top-3 left-3 z-10 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#ff3300] shadow-lg shadow-[#ff3300]/30">
              <span className="text-white font-black text-lg leading-none" style={{ fontFamily: "var(--font-display)" }}>
                -{deal.pct}%
              </span>
              <span className="text-white/80 text-[9px] uppercase tracking-wider">OFF</span>
            </div>

            {/* PC image */}
            <div className="relative w-full max-w-sm lg:max-w-none aspect-square">
              {DEALS.map((d, i) => (
                <div
                  key={d.href}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
                >
                  <Image
                    src={d.img}
                    alt={d.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority={i === 0}
                    sizes="(max-width: 1024px) 90vw, 45vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Offer copy */}
          <div className="order-1 lg:order-2 flex flex-col">
            {/* BLACK SALE badge */}
            <div className="inline-flex items-center gap-2 mb-4 self-start">
              <span className="px-3 py-1 bg-[#ff3300] text-white text-[10px] font-black uppercase tracking-widest rounded">
                ⚡ BLACK SALE
              </span>
              <span className="text-[#555] text-xs">Oferta por tiempo limitado</span>
            </div>

            {/* Category label */}
            <p className="text-[#00ff66] text-xs font-bold uppercase tracking-widest mb-2 transition-all duration-300">
              {deal.label}
            </p>

            {/* PC name */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white leading-tight mb-2 transition-all duration-300"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deal.name}
            </h1>

            {/* Specs */}
            <p className="text-[#666] text-sm mb-6">{deal.specs}</p>

            {/* Price block */}
            <div className="flex items-end gap-3 mb-6">
              <span
                className="text-4xl sm:text-5xl font-black text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatCLP(deal.price)}
              </span>
              <div className="flex flex-col mb-1">
                <span className="text-[#444] text-sm line-through">{formatCLP(deal.was)}</span>
                <span className="text-[#ff3300] text-xs font-bold">
                  Ahorrás {formatCLP(deal.was - deal.price)}
                </span>
              </div>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["6 cuotas sin interés", "Garantía incluida", "Despacho a todo Chile", "Lista para usar"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-[#666]">
                  <span className="text-[#00ff66]">✓</span> {t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href={deal.href}
                className="px-8 py-4 bg-[#ff3300] text-white font-black text-sm uppercase tracking-widest rounded hover:bg-[#e02d00] transition-all active:scale-95 text-center shadow-lg shadow-[#ff3300]/20"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ver esta oferta →
              </Link>
              <Link
                href="/productos"
                className="px-8 py-4 border border-[#222] text-[#888] font-semibold text-sm uppercase tracking-wider rounded hover:border-[#444] hover:text-white transition-all text-center"
              >
                Ver todas las PCs
              </Link>
            </div>

            {/* Dot selectors */}
            <div className="flex items-center gap-2">
              {DEALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? "w-6 h-2 bg-[#ff3300]" : "w-2 h-2 bg-[#222] hover:bg-[#444]"
                  }`}
                  aria-label={`Ver oferta ${i + 1}`}
                />
              ))}
              <span className="ml-2 text-[#333] text-xs">{active + 1}/{DEALS.length} ofertas</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="border-t border-[#111] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 text-center">
            {[
              { value: "+50", label: "Modelos disponibles" },
              { value: "100%", label: "Ensamblado en Chile" },
              { value: "24/7", label: "Soporte técnico" },
              { value: "6x", label: "Cuotas sin interés" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-base font-black text-[#00ff66]" style={{ fontFamily: "var(--font-display)" }}>
                  {s.value}
                </span>
                <span className="text-[10px] text-[#444] uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
