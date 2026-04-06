"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Keyboard, Armchair, Headphones, Mouse,
  Package, Square, Monitor, AppWindow, Wrench,
  Menu, X, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Builds",        href: "/builds",                    Icon: LayoutGrid },
  { label: "Teclados",      href: "/productos?q=teclado",       Icon: Keyboard   },
  { label: "Sillas Gamer",  href: "/productos?q=silla+gamer",   Icon: Armchair   },
  { label: "Audífonos",     href: "/productos?q=audifonos",     Icon: Headphones },
  { label: "Mouse",         href: "/productos?q=mouse",         Icon: Mouse      },
  { label: "Kits",          href: "/productos?q=kit",           Icon: Package    },
  { label: "Mousepads",     href: "/productos?q=mousepad",      Icon: Square     },
  { label: "Monitores",     href: "/productos?categoria=monitores", Icon: Monitor },
  { label: "Software",      href: "/productos?q=software",      Icon: AppWindow  },
  { label: "Servicios",     href: "/productos?q=servicio",      Icon: Wrench     },
];

// Bottom bar shows first 4 most-used items + "Más" button
const BOTTOM_ITEMS = [
  { label: "Builds",    href: "/builds",                Icon: LayoutGrid },
  { label: "Mouse",     href: "/productos?q=mouse",     Icon: Mouse      },
  { label: "Monitores", href: "/productos?categoria=monitores", Icon: Monitor },
  { label: "Teclados",  href: "/productos?q=teclado",   Icon: Keyboard   },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeQ = searchParams.get("q") ?? "";
  const activeCat = searchParams.get("categoria") ?? "";

  function isActive(href: string) {
    const url = new URL(href, "http://x");
    if (url.pathname !== pathname) return false;
    const q = url.searchParams.get("q");
    const cat = url.searchParams.get("categoria");
    if (q) return q === activeQ;
    if (cat) return cat === activeCat;
    return pathname === href;
  }

  return (
    <>
      {/* Bottom tab bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#080808] border-t border-[#0f0f0f]">
        <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
          {BOTTOM_ITEMS.map(({ label, href, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                  style={{
                    backgroundColor: active ? "#00ff6610" : "#071a0e",
                    borderColor: active ? "#00ff6640" : "#00ff6618",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#00ff66", strokeWidth: 2 }} />
                </div>
                <span
                  className="text-[9px] font-semibold transition-colors"
                  style={{ color: active ? "#00ff66" : "#444" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Más button */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: "#071a0e", borderColor: "#00ff6618" }}
            >
              <Menu className="w-4 h-4" style={{ color: "#00ff66", strokeWidth: 2 }} />
            </div>
            <span className="text-[9px] font-semibold text-[#444]">Más</span>
          </button>
        </div>
      </div>

      {/* Full menu drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 lg:hidden"
            />

            {/* Sheet from bottom */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0a0a] border-t border-[#1a1a1a] rounded-t-2xl"
              style={{ maxHeight: "80dvh" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[#252525]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-[#111]">
                <p className="text-[9px] font-bold text-[#333] uppercase tracking-widest">Navegación</p>
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-[#444]" />
                </button>
              </div>

              {/* Nav items */}
              <div className="overflow-y-auto px-4 py-3 space-y-1 pb-8">
                {NAV_ITEMS.map(({ label, href, Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
                      style={{
                        backgroundColor: active ? "#00ff6608" : "transparent",
                        borderColor: active ? "#00ff6640" : "#00ff6615",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0"
                        style={{ backgroundColor: "#071a0e", borderColor: "#00ff6625" }}
                      >
                        <Icon className="w-[15px] h-[15px]" style={{ color: "#00ff66", strokeWidth: 2 }} />
                      </div>
                      <span
                        className="text-sm font-semibold flex-1 transition-colors"
                        style={{ color: active ? "#00ff66" : "#777" }}
                      >
                        {label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: active ? "#00ff66" : "#1e1e1e" }} />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
