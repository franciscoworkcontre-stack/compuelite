"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Fluid Particles ─────────────────────────────────────────────────────────

function FluidParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const blastRef = useRef({ active: false, x: 0, y: 0, radius: 0, maxRadius: 250 });
  const animRef = useRef<number>(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    contextRef.current = ctx;
    ctx.globalCompositeOperation = "lighter";

    const particles: Array<{
      x: number; y: number; baseX: number; baseY: number;
      size: number; density: number; color: string; vx: number; vy: number;
    }> = [];

    const resize = () => {
      const pr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pr;
      canvas.height = window.innerHeight * pr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pr, pr);
      particles.length = 0;
      const count = Math.floor((window.innerWidth * window.innerHeight) / 120);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        particles.push({
          x, y, baseX: x, baseY: y,
          size: Math.random() * 1.5 + 0.5,
          density: Math.random() * 3 + 1,
          color: "#00ff66",
          vx: 0, vy: 0,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const triggerBlast = (x: number, y: number) => {
      blastRef.current = { active: true, x, y, radius: 0, maxRadius: 250 };
      const start = performance.now();
      const expand = (t: number) => {
        const p = Math.min((t - start) / 300, 1);
        blastRef.current.radius = p * (2 - p) * 250;
        if (p < 1) requestAnimationFrame(expand);
        else setTimeout(() => { blastRef.current.active = false; }, 100);
      };
      requestAnimationFrame(expand);
      if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    };

    const onMove = (e: MouseEvent) => {
      const prev = { x: mouseRef.current.x, y: mouseRef.current.y };
      mouseRef.current = { x: e.x, y: e.y, prevX: prev.x, prevY: prev.y };
      const d = Math.hypot(e.x - prev.x, e.y - prev.y);
      if (d < 5) {
        if (!hoverTimer.current) hoverTimer.current = setTimeout(() => triggerBlast(e.x, e.y), 100);
      } else {
        if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
      }
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.9 - 0.01 * p.density;
        p.vy *= 0.9 - 0.01 * p.density;

        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          p.x -= (dx / dist) * ((100 - dist) / 100) * p.density * 0.6;
          p.y -= (dy / dist) * ((100 - dist) / 100) * p.density * 0.6;
          p.color = "#00ff66";
        } else {
          p.x -= (p.x - p.baseX) / 20;
          p.y -= (p.y - p.baseY) / 20;
          p.color = "#00ff6622";
        }

        if (blastRef.current.active) {
          const bx = p.x - blastRef.current.x;
          const by = p.y - blastRef.current.y;
          const bd = Math.hypot(bx, by);
          if (bd < blastRef.current.radius) {
            const f = (blastRef.current.radius - bd) / blastRef.current.radius;
            p.vx += (bx / (bd || 1)) * f * 15;
            p.vy += (by / (bd || 1)) * f * 15;
            p.color = "rgba(0,255,102,0.8)";
          }
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DEALS = [
  {
    badge: "Serie START · Más vendido",
    name: "PC Gamer Ryzen 5\n+ RTX 3050",
    specs: "6-Core · 16GB DDR4 · 1TB NVMe · WiFi",
    price: 863446,
    was: 937000,
    pct: 8,
    href: "/productos/pc-gamer-amd-ryzen-5-5500-6-core-16gb-ddr4-rtx-3050-6gb-pcb4",
    img: "https://cdnx.jumpseller.com/compuelite/image/71549613/thumb/1000/1000?1767716671",
  },
  {
    badge: "Mayor descuento · -12%",
    name: "PC Gamer Intel i5\n+ RTX 3050",
    specs: "6-Core · 16GB DDR4 · H610 WiFi · 1TB",
    price: 876432,
    was: 992000,
    pct: 12,
    href: "/productos/pc-gamer-intel-i5-12400f-6-core-h610-wifi-16gb-ddr4-ssd-1tb-",
    img: "https://cdnx.jumpseller.com/compuelite/image/62387794/thumb/1000/1000?1744327929",
  },
  {
    badge: "Serie START · Desde",
    name: "PC Gamer Ryzen 7\n5700G",
    specs: "8-Core · 16GB DDR4 · Radeon integrada",
    price: 667166,
    was: 724000,
    pct: 8,
    href: "/productos/pc-gamer-amd-ryzen-7-5700g-8-core-radeon-16gb-ddr4-pcb307",
    img: "https://cdnx.jumpseller.com/compuelite/image/67991777/thumb/1000/1000?1759162173",
  },
];

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % DEALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const deal = DEALS[active];

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col bg-[#080808] overflow-hidden">

      {/* Particles background */}
      <div className="absolute inset-0 z-0">
        <FluidParticles />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#080808]/90 via-[#080808]/80 to-[#080808]/90 z-[1] pointer-events-none" />

      {/* Grid texture */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#00ff66 1px, transparent 1px), linear-gradient(90deg, #00ff66 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Main content */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-16 lg:py-24 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* LEFT — Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-7 order-2 lg:order-1"
          >
            {/* BLACK SALE banner */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center justify-between gap-6 px-6 py-3 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 w-full max-w-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00ff66]/20 border border-[#00ff66]/40 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-[#00ff66]" />
                  </div>
                  <div>
                    <p className="text-[#00ff66] text-sm font-black uppercase tracking-widest leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      BLACK SALE
                    </p>
                    <p className="text-[#00ff66]/70 text-[11px] uppercase tracking-wider leading-tight">
                      25 Marzo — 5 Abril
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-xl font-black leading-none" style={{ fontFamily: "var(--font-display)" }}>13% OFF</p>
                  <p className="text-[#00ff66]/60 text-[10px] uppercase tracking-wider">en PCs Gamer</p>
                </div>
              </div>
            </motion.div>

            {/* Category */}
            <motion.p variants={fadeUp} className="text-[#00ff66] text-xs font-bold uppercase tracking-widest transition-all duration-500">
              {deal.badge}
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight uppercase transition-all duration-500"
              style={{ fontFamily: "var(--font-display)", whiteSpace: "pre-line" }}
            >
              {deal.name}
            </motion.h1>

            {/* Specs */}
            <motion.p variants={fadeUp} className="text-[#555] text-sm transition-all duration-500">
              {deal.specs}
            </motion.p>

            {/* Price */}
            <motion.div variants={fadeUp} className="flex items-end gap-4">
              <span className="text-4xl sm:text-5xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {formatCLP(deal.price)}
              </span>
              <div className="mb-1 flex flex-col">
                <span className="text-[#333] text-sm line-through">{formatCLP(deal.was)}</span>
                <span className="text-[#00ff66] text-xs font-bold">Ahorrás {formatCLP(deal.was - deal.price)}</span>
              </div>
              <span className="mb-1 px-2.5 py-1 rounded bg-[#00ff66]/15 text-[#00ff66] text-xs font-black border border-[#00ff66]/30">
                -{deal.pct}% OFF
              </span>
            </motion.div>

            {/* Trust pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              {[
                { icon: Shield, text: "Garantía incluida" },
                { icon: Truck, text: "Despacho a todo Chile" },
                { icon: Clock, text: "Lista para usar" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-[#555]">
                  <Icon className="w-3.5 h-3.5 text-[#00ff66]" />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href={deal.href}
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#00ff66] text-black font-black text-sm uppercase tracking-widest rounded hover:bg-[#00e55c] transition-all active:scale-95"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ver esta oferta
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center justify-center px-7 py-4 border border-[#222] text-[#666] font-semibold text-sm uppercase tracking-wider rounded hover:border-[#444] hover:text-white transition-all"
              >
                Ver todas las PCs
              </Link>
            </motion.div>

            {/* Carousel dots */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 pt-2">
              {DEALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-2 bg-[#00ff66]" : "w-2 h-2 bg-[#222] hover:bg-[#444]"}`}
                  aria-label={`Oferta ${i + 1}`}
                />
              ))}
              <span className="ml-1 text-[#333] text-xs">{active + 1}/{DEALS.length}</span>
            </motion.div>
          </motion.div>

          {/* RIGHT — Product image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2 flex items-center justify-center"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-[#00ff66]/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Image container */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Sale badge floating */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.6 }}
                className="absolute top-4 right-4 z-20 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#00ff66] shadow-lg shadow-[#00ff66]/30"
              >
                <span className="text-black font-black text-lg leading-none" style={{ fontFamily: "var(--font-display)" }}>
                  -{deal.pct}%
                </span>
                <span className="text-black/70 text-[9px] uppercase tracking-wider">OFF</span>
              </motion.div>

              {/* Rotating images */}
              {DEALS.map((d, i) => (
                <div
                  key={d.href}
                  className={`absolute inset-0 transition-all duration-700 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                >
                  <Image
                    src={d.img}
                    alt={d.name.replace("\n", " ")}
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority={i === 0}
                    sizes="(max-width: 1024px) 80vw, 42vw"
                  />
                </div>
              ))}

              {/* Floating stat cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl border border-[#00ff66]/20 bg-[#080808]/90 backdrop-blur-sm"
              >
                <p className="text-[#00ff66] text-[10px] font-bold uppercase tracking-wider">Ensamblado en</p>
                <p className="text-white text-lg font-black" style={{ fontFamily: "var(--font-display)" }}>Chile 🇨🇱</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="absolute -top-4 -left-4 px-4 py-3 rounded-xl border border-[#00ff66]/20 bg-[#080808]/90 backdrop-blur-sm"
              >
                <p className="text-[#00ff66] text-[10px] font-bold uppercase tracking-wider">Cuotas sin interés</p>
                <p className="text-white text-lg font-black" style={{ fontFamily: "var(--font-display)" }}>6x Webpay</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="relative z-10 border-t border-[#111] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4">
            {[
              { value: "+50", label: "Modelos disponibles" },
              { value: "100%", label: "Ensamblado en Chile" },
              { value: "24/7", label: "Soporte técnico" },
              { value: "6x", label: "Cuotas sin interés" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-sm font-black text-[#00ff66]" style={{ fontFamily: "var(--font-display)" }}>{s.value}</span>
                <span className="text-[10px] text-[#444] uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
