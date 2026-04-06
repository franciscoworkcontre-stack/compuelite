"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutGrid, Keyboard, Armchair, Headphones, Mouse,
  Package, Square, Monitor, AppWindow, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem =
  | { type: "link"; label: string; href: string; Icon: LucideIcon }
  | { type: "divider" }
  | { type: "heading"; label: string };

const NAV_ITEMS: NavItem[] = [
  { type: "link",    label: "Builds",       href: "/builds",                    Icon: LayoutGrid },
  { type: "divider" },
  { type: "heading", label: "Accesorios" },
  { type: "link",    label: "Teclados",     href: "/productos?q=teclado",       Icon: Keyboard   },
  { type: "link",    label: "Sillas Gamer", href: "/productos?q=silla+gamer",   Icon: Armchair   },
  { type: "link",    label: "Audífonos",    href: "/productos?q=audifonos",     Icon: Headphones },
  { type: "link",    label: "Mouse",        href: "/productos?q=mouse",         Icon: Mouse      },
  { type: "link",    label: "Kits",         href: "/productos?q=kit",           Icon: Package    },
  { type: "link",    label: "Mousepads",    href: "/productos?q=mousepad",      Icon: Square     },
  { type: "link",    label: "Monitores",    href: "/productos?categoria=monitores", Icon: Monitor },
  { type: "divider" },
  { type: "heading", label: "Más" },
  { type: "link",    label: "Software",     href: "/productos?q=software",      Icon: AppWindow  },
  { type: "link",    label: "Servicios",    href: "/productos?q=servicio",      Icon: Wrench     },
];

export function WhiteSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategoria = searchParams.get("categoria") ?? "";
  const activeQ = searchParams.get("q") ?? "";

  function isActive(item: Extract<NavItem, { type: "link" }>) {
    if (item.href === "/builds") return pathname === "/builds";
    const url = new URL(item.href, "http://x");
    const cat = url.searchParams.get("categoria");
    const q = url.searchParams.get("q");
    if (cat) return cat === activeCategoria;
    if (q) return q === activeQ;
    return false;
  }

  return (
    <aside className="w-48 flex-shrink-0 hidden lg:flex flex-col border-r border-[#f3f4f6] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white">
      <div className="p-2.5 space-y-0.5">
        <div className="px-1 pt-2 pb-2">
          <p className="text-[9px] font-bold text-[#d1d5db] uppercase tracking-widest">Navegación</p>
        </div>

        {NAV_ITEMS.map((item, i) => {
          if (item.type === "divider") {
            return <div key={`div-${i}`} className="h-px bg-[#f3f4f6] mx-1 my-1.5" />;
          }
          if (item.type === "heading") {
            return (
              <div key={`h-${i}`} className="px-1 pt-1 pb-0.5">
                <p className="text-[9px] font-bold text-[#d1d5db] uppercase tracking-widest">{item.label}</p>
              </div>
            );
          }

          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className="relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-[#f0fdf4] group"
                style={{
                  backgroundColor: active ? "#f0fdf4" : "transparent",
                  borderColor: active ? "#16a34a40" : "#f3f4f6",
                }}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#16a34a]" />
                )}

                <div
                  className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center border"
                  style={{
                    backgroundColor: active ? "#f0fdf4" : "#f9fafb",
                    borderColor: active ? "#16a34a28" : "#e5e7eb",
                  }}
                >
                  <item.Icon
                    className="w-[14px] h-[14px]"
                    style={{ color: active ? "#16a34a" : "#9ca3af", strokeWidth: 2 }}
                  />
                </div>

                <p
                  className="text-[11px] font-semibold truncate transition-colors flex-1"
                  style={{ color: active ? "#16a34a" : "#6b7280" }}
                >
                  {item.label}
                </p>

                <svg
                  className="w-2.5 h-2.5 flex-shrink-0 transition-colors"
                  style={{ color: active ? "#16a34a" : "#d1d5db" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}

        <div className="pt-2 pb-3">
          <Link
            href="/productos"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-[#e5e7eb] hover:border-[#16a34a]/40 hover:bg-[#f0fdf4] transition-all group"
          >
            <span className="text-[9px] text-[#9ca3af] group-hover:text-[#16a34a] transition-colors uppercase tracking-wider">
              Ver catálogo completo
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
