"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Zap, Cpu, ShoppingCart } from "lucide-react";
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
    features: [
      { icon: Cpu,  text: "Ryzen 5 5500 6-Core" },
      { icon: Zap,  text: "RTX 3050 6GB GDDR6" },
      { icon: Cpu,  text: "16GB DDR4 · 1TB NVMe" },
    ],
    price: 863446,
    was: 937000,
    pct: 8,
    stock: 7,
    href: "/productos/pc-gamer-amd-ryzen-5-5500-6-core-16gb-ddr4-rtx-3050-6gb-pcb4",
    img: "https://cdnx.jumpseller.com/compuelite/image/71549613/thumb/1000/1000?1767716671",
  },
  {
    badge: "Mayor descuento · -12%",
    name: "PC Gamer Intel i5\n+ RTX 3050",
    specs: "6-Core · 16GB DDR4 · H610 WiFi · 1TB",
    features: [
      { icon: Cpu,  text: "Intel i5-12400F 6-Core" },
      { icon: Zap,  text: "RTX 3050 6GB GDDR6" },
      { icon: Cpu,  text: "16GB DDR4 · H610 WiFi" },
    ],
    price: 876432,
    was: 992000,
    pct: 12,
    stock: 4,
    href: "/productos/pc-gamer-intel-i5-12400f-6-core-h610-wifi-16gb-ddr4-ssd-1tb-",
    img: "https://cdnx.jumpseller.com/compuelite/image/62387794/thumb/1000/1000?1744327929",
  },
  {
    badge: "Serie START · Desde",
    name: "PC Gamer Ryzen 7\n5700G",
    specs: "8-Core · 16GB DDR4 · Radeon integrada",
    features: [
      { icon: Cpu,  text: "Ryzen 7 5700G 8-Core" },
      { icon: Zap,  text: "Radeon Graphics integrada" },
      { icon: Cpu,  text: "16GB DDR4 · 1TB NVMe" },
    ],
    price: 667166,
    was: 724000,
    pct: 8,
    stock: 12,
    href: "/productos/pc-gamer-amd-ryzen-7-5700g-8-core-radeon-16gb-ddr4-pcb307",
    img: "https://cdnx.jumpseller.com/compuelite/image/67991777/thumb/1000/1000?1759162173",
  },
];

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

// ─── Animation variants (App.tsx pattern) ────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
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
    <section className="relative w-full flex flex-col bg-[#0a0a0a] overflow-hidden">

      {/* Particles background */}
      <div className="absolute inset-0 z-0">
        <FluidParticles />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,255,102,0.15), transparent)" }}
      />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,255,102,0.15) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 pt-5 pb-5 lg:pt-8 lg:pb-8 flex flex-col gap-5">

        {/* ── Full-width promo banner (GREEN) ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-xl border border-[#00ff66]/20 bg-[#00ff66]/5 backdrop-blur-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        >
          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-1.5 text-[#00ff66] text-[11px] font-bold uppercase tracking-widest mb-1.5">
              <Zap className="w-3 h-3" />
              BLACK SALE — Solo por tiempo limitado
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase leading-tight mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
              PCs Gamer con hasta 13% OFF
            </h2>
            <p className="text-[#555] text-xs leading-relaxed">
              Desde $667.166 · Intel i5 + RTX 3050 desde $876.432 · Ryzen 7 9800X3D + RTX 5070 Ti disponible · Garantía incluida · Despacho a todo Chile
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/productos"
              className="px-5 py-2.5 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00e55c] transition-all whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ver todas las ofertas
            </Link>
            <Link
              href="/builds"
              className="px-4 py-2.5 border border-[#00ff66]/30 text-[#00ff66] text-xs font-semibold uppercase tracking-wider rounded-lg hover:border-[#00ff66] hover:bg-[#00ff66]/10 transition-all whitespace-nowrap"
            >
              Serie START desde $667K
            </Link>
          </div>
        </motion.div>

        {/* ── 2-col grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full flex-1">

          {/* LEFT — Copy (App.tsx pattern) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ backgroundColor: "rgba(0,255,102,0.1)", borderColor: "#00ff66" }}
              >
                <Zap className="w-4 h-4" style={{ color: "#00ff66" }} />
                <span className="text-sm font-semibold" style={{ color: "#00ff66" }}>
                  {deal.badge}
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1
                className="text-4xl md:text-5xl lg:text-5xl font-bold text-white leading-tight uppercase"
                style={{ fontFamily: "var(--font-display)", whiteSpace: "pre-line" }}
              >
                {deal.name.split("\n")[0]}
                <br />
                <span className="relative inline-block" style={{ color: "#00ff66" }}>
                  {deal.name.split("\n")[1]}
                  <svg viewBox="0 0 300 8" className="absolute left-0 bottom-0 w-full" style={{ marginBottom: "-8px" }}>
                    <path d="M2 6C80 2 220 2 298 6" stroke="#00ff66" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>
            </motion.div>

            {/* Specs */}
            <motion.p variants={itemVariants} className="text-sm text-gray-400 max-w-xl">
              {deal.specs}
            </motion.p>

            {/* Features */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
              {deal.features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: "#00ff66" }} />
                  <span className="text-white font-medium">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* Price card */}
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-2xl border"
              style={{ backgroundColor: "rgba(0,255,102,0.05)", borderColor: "rgba(0,255,102,0.2)" }}
            >
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-gray-500 line-through text-xl">{formatCLP(deal.was)}</span>
                <span className="text-4xl font-bold" style={{ color: "#00ff66", fontFamily: "var(--font-display)" }}>
                  {formatCLP(deal.price)}
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Ahorrás {formatCLP(deal.was - deal.price)} — BLACK SALE hasta el 5 de Abril
              </p>
              <div
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: "rgba(0,255,102,0.2)", color: "#00ff66" }}
              >
                🔥 Solo {deal.stock} unidades a este precio
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link
                href={deal.href}
                className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold rounded-md shadow-lg transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#00ff66", color: "#0a0a0a" }}
              >
                <ShoppingCart className="w-5 h-5" />
                Comprar ahora
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold rounded-md border transition-all hover:bg-[#00ff66]/10"
                style={{ borderColor: "#00ff66", color: "#00ff66", backgroundColor: "transparent" }}
              >
                Ver especificaciones
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 pt-2 text-sm text-gray-500">
              {[
                "Despacho a todo Chile",
                "Garantía incluida",
                "24/7 Soporte técnico",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: "#00ff66" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>

            {/* Carousel dots */}
            <motion.div variants={itemVariants} className="flex items-center gap-2">
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

          {/* RIGHT — Product image (unchanged) */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2 flex items-center justify-center lg:h-[440px]"
          >
            <div className="relative w-full h-full">
              {/* Glow */}
              <div
                className="absolute inset-0 blur-3xl opacity-30"
                style={{ background: "radial-gradient(circle, #00ff66 0%, transparent 70%)" }}
              />

              {/* Image container */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square">
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
                    className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl border border-[#00ff66]/20 bg-[#0a0a0a]/90 backdrop-blur-sm"
                  >
                    <p className="text-[#00ff66] text-[10px] font-bold uppercase tracking-wider">Ensamblado en</p>
                    <p className="text-white text-lg font-black" style={{ fontFamily: "var(--font-display)" }}>Chile 🇨🇱</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="absolute -top-4 -left-4 px-4 py-3 rounded-xl border border-[#00ff66]/20 bg-[#0a0a0a]/90 backdrop-blur-sm"
                  >
                    <p className="text-[#00ff66] text-[10px] font-bold uppercase tracking-wider">Cuotas sin interés</p>
                    <p className="text-white text-lg font-black" style={{ fontFamily: "var(--font-display)" }}>6x Webpay</p>
                  </motion.div>
                </div>
              </div>

              {/* Floating FPS stat (from App.tsx) */}
              <motion.div
                className="absolute top-10 right-0 p-4 rounded-xl border backdrop-blur-sm"
                style={{ backgroundColor: "rgba(10,10,10,0.8)", borderColor: "rgba(0,255,102,0.3)" }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <div className="text-sm text-gray-400 mb-1">Ahorro</div>
                <div className="text-3xl font-bold" style={{ color: "#00ff66", fontFamily: "var(--font-display)" }}>
                  -{deal.pct}%
                </div>
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
