"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Floating particles effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.4})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#00ff66]/30 rounded-full bg-[#00ff66]/5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="text-xs font-medium text-[#00ff66] uppercase tracking-widest">
            PC Builder 3D Interactivo
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight leading-none mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="block text-white">ARMA TU</span>
          <span className="block text-[#00ff66]">
            PC GAMER
          </span>
          <span className="block text-white">IDEAL</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[#888] max-w-2xl mx-auto mb-10 leading-relaxed">
          El único configurador de PC 3D interactivo de Chile. Selecciona componentes,
          verifica compatibilidad en tiempo real y recibe en todo el país.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/builder"
            className="w-full sm:w-auto px-8 py-4 bg-[#00ff66] text-black font-black text-sm uppercase tracking-widest rounded hover:bg-[#00cc52] transition-all active:scale-95"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Comenzar Build
          </Link>
          <Link
            href="/productos"
            className="w-full sm:w-auto px-8 py-4 border border-[#333] text-white font-semibold text-sm uppercase tracking-wider rounded hover:border-[#00ff66] hover:text-[#00ff66] transition-all"
          >
            Ver Productos
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-center">
          {[
            { value: "+500", label: "Componentes" },
            { value: "100%", label: "Compatibilidad verificada" },
            { value: "24/7", label: "Soporte técnico" },
            { value: "3D", label: "Configurador único" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-2xl font-black text-[#00ff66]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-[#555] mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
