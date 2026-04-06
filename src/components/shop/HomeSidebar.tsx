"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, type TargetAndTransition } from "framer-motion";
import {
  LayoutGrid, Keyboard, Armchair, Headphones, Mouse,
  Package, Square, Monitor, AppWindow, Wrench,
  Cpu, Zap, Shield, Star, Tag, Gamepad2, Laptop,
  HardDrive, MemoryStick, CircuitBoard, Fan, Plug,
  Printer, Camera, Tv, Wifi, Bluetooth,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const ICON_MAP: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  "keyboard":    Keyboard,
  "armchair":    Armchair,
  "headphones":  Headphones,
  "mouse":       Mouse,
  "package":     Package,
  "square":      Square,
  "monitor":     Monitor,
  "app-window":  AppWindow,
  "wrench":      Wrench,
  "cpu":         Cpu,
  "zap":         Zap,
  "shield":      Shield,
  "star":        Star,
  "tag":         Tag,
  "gamepad":     Gamepad2,
  "laptop":      Laptop,
  "hard-drive":  HardDrive,
  "memory":      MemoryStick,
  "circuit":     CircuitBoard,
  "fan":         Fan,
  "plug":        Plug,
  "printer":     Printer,
  "camera":      Camera,
  "tv":          Tv,
  "wifi":        Wifi,
  "bluetooth":   Bluetooth,
};

type AnimType = "pulse" | "float" | "spin" | "bounce" | "shake" | "wiggle";

const iconAnims: Record<AnimType, { animate: TargetAndTransition; transition: Record<string, unknown> }> = {
  pulse:  { animate: { scale: [1, 1.22, 1], opacity: [0.75, 1, 0.75] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  float:  { animate: { y: [0, -3, 0] },                                  transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  spin:   { animate: { rotate: [0, 14, -10, 0] },                        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  bounce: { animate: { y: [0, -5, 0], scale: [1, 1.12, 1] },             transition: { duration: 1.8, repeat: Infinity, ease: "easeOut" } },
  shake:  { animate: { x: [0, -3, 3, -2, 2, 0] },                        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 } },
  wiggle: { animate: { rotate: [0, -8, 8, -4, 4, 0] },                   transition: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 } },
};

function NavLinkItem({ label, href, icon, anim, active, index }: {
  label: string; href: string; icon: string | null; anim: string | null; active: boolean; index: number;
}) {
  const Icon = icon ? ICON_MAP[icon] : null;
  const animDef = iconAnims[(anim as AnimType) ?? "pulse"] ?? iconAnims.pulse;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 220, damping: 26 }}
    >
      <Link href={href}>
        <div
          className="relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-[#00ff66]/5 group"
          style={{ backgroundColor: active ? "#00ff6608" : "transparent", borderColor: active ? "#00ff6650" : "#00ff6618" }}
        >
          {active && <motion.div layoutId="sidebar-active-bar" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#00ff66]" />}
          <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center border" style={{ backgroundColor: "#071a0e", borderColor: "#00ff6628" }}>
            {Icon
              ? <motion.div animate={animDef.animate} transition={animDef.transition} className="flex items-center justify-center"><Icon className="w-[14px] h-[14px]" style={{ color: "#00ff66", strokeWidth: 2 }} /></motion.div>
              : <div className="w-2 h-2 rounded-full bg-[#00ff6640]" />}
          </div>
          <p className="relative z-10 text-[11px] font-semibold truncate transition-colors flex-1" style={{ color: active ? "#00ff66" : "#666" }}>{label}</p>
          <svg className="relative z-10 w-2.5 h-2.5 flex-shrink-0 transition-colors" style={{ color: active ? "#00ff66" : "#1e1e1e" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

export function HomeSidebar() {
  const pathname      = usePathname();
  const searchParams  = useSearchParams();
  const activeCategoria = searchParams.get("categoria") ?? "";
  const activeQ         = searchParams.get("q") ?? "";

  const { data: items = [] } = trpc.navigation.sidebarItems.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  function isActive(href: string) {
    if (href === "/builds") return pathname === "/builds";
    try {
      const url = new URL(href, "http://x");
      const cat = url.searchParams.get("categoria");
      const q   = url.searchParams.get("q");
      if (cat) return cat === activeCategoria;
      if (q)   return q === activeQ;
    } catch { /* skip */ }
    return false;
  }

  let linkIndex = 0;

  return (
    <aside className="w-52 flex-shrink-0 hidden lg:flex flex-col border-r border-[#0f0f0f] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-[#080808]">
      <div className="p-2.5 space-y-0.5">
        <div className="px-1 pt-2 pb-2">
          <p className="text-[9px] font-bold text-[#222] uppercase tracking-widest">Navegación</p>
        </div>
        {items.map((item) => {
          if (item.type === "divider") return <div key={item.id} className="h-px bg-[#0f0f0f] mx-1 my-1.5" />;
          if (item.type === "heading") return (
            <div key={item.id} className="px-1 pt-1 pb-0.5">
              <p className="text-[9px] font-bold text-[#222] uppercase tracking-widest">{item.label}</p>
            </div>
          );
          if (!item.href || !item.label) return null;
          const idx = linkIndex++;
          return <NavLinkItem key={item.id} label={item.label} href={item.href} icon={item.icon} anim={item.anim} active={isActive(item.href)} index={idx} />;
        })}
        <div className="pt-2 pb-3">
          <Link href="/productos" className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-[#00ff6618] hover:border-[#00ff6640] hover:bg-[#00ff6608] transition-all group">
            <span className="text-[9px] text-[#2a2a2a] group-hover:text-[#00ff66] transition-colors uppercase tracking-wider">Ver catálogo completo</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
