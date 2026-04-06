"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import { Truck, Lock, Zap, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SIGNALS: {
  Icon: LucideIcon;
  title: string;
  desc: string;
  anim: TargetAndTransition;
  transition: Record<string, unknown>;
}[] = [
  {
    Icon: Truck,
    title: "Envío a Chile",
    desc: "Starken · Chilexpress · Blue Express",
    anim: { x: [0, 4, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 },
  },
  {
    Icon: Lock,
    title: "Pago seguro",
    desc: "WebPay · Mercado Pago · Flow",
    anim: { scale: [1, 1.18, 1], opacity: [0.8, 1, 0.8] },
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  {
    Icon: Zap,
    title: "Stock real",
    desc: "Disponibilidad en tiempo real",
    anim: { scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] },
    transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
  },
  {
    Icon: Wrench,
    title: "Garantía",
    desc: "Respaldo técnico postventa",
    anim: { rotate: [0, -12, 12, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 },
  },
];

export function TrustSignals() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-8">
      {SIGNALS.map(({ Icon, title, desc, anim, transition }) => (
        <div
          key={title}
          className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d0d] border border-[#111]"
        >
          {/* Animated icon box — same style as sidebar */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border"
            style={{ backgroundColor: "#071a0e", borderColor: "#00ff6628" }}
          >
            <motion.div
              animate={anim}
              transition={transition}
              className="flex items-center justify-center"
            >
              <Icon className="w-[15px] h-[15px]" style={{ color: "#00ff66", strokeWidth: 2 }} />
            </motion.div>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-white leading-tight">{title}</p>
            <p className="text-[10px] text-[#444] leading-snug mt-0.5 truncate">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
