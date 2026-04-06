import Link from "next/link";
import { Zap, Gamepad2, Skull, Laptop, Home, ChevronRight } from "lucide-react";

const BUILD_TYPES = [
  {
    slug: "pc-gamer-start-series",
    label: "Start Series",
    tagline: "Tu primer PC gamer",
    detail: "1080p · 144fps+",
    games: ["Valorant", "CS2", "Fortnite"],
    priceFrom: 399990,
    color: "#4488ff",
    dimColor: "#4488ff18",
    borderColor: "#4488ff35",
    Icon: Zap,
  },
  {
    slug: "pc-gamer-pro-series",
    label: "Pro Series",
    tagline: "1440p sin compromiso",
    detail: "1440p · 165fps",
    games: ["Cyberpunk 2077", "Elden Ring", "Warzone"],
    priceFrom: 799990,
    color: "#00ff66",
    dimColor: "#00ff6618",
    borderColor: "#00ff6635",
    Icon: Gamepad2,
  },
  {
    slug: "pc-elite",
    label: "PC Elite®",
    tagline: "4K. Sin límites.",
    detail: "4K · RTX 4080+",
    games: ["Alan Wake 2", "Flight Sim", "Red Dead 2"],
    priceFrom: 1899990,
    color: "#ffb800",
    dimColor: "#ffb80018",
    borderColor: "#ffb80035",
    Icon: Skull,
  },
  {
    slug: "workstation",
    label: "Workstation",
    tagline: "Rendimiento profesional",
    detail: "Render · Video · CAD",
    games: ["Blender", "Premiere", "DaVinci"],
    priceFrom: 1299990,
    color: "#00ddff",
    dimColor: "#00ddff18",
    borderColor: "#00ddff35",
    Icon: Laptop,
  },
  {
    slug: "componentes",
    label: "Hogar & Oficina",
    tagline: "Eficiente y silenciosa",
    detail: "Office · Streaming · Casual",
    games: ["Office 365", "Streaming", "Casual"],
    priceFrom: 249990,
    color: "#888888",
    dimColor: "#88888818",
    borderColor: "#88888830",
    Icon: Home,
  },
];

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

type ConfigType = { title?: string; types?: { slug: string; visible?: boolean; priceFrom?: number }[] };

export function BuildsByType({ config = {} }: { config?: Record<string, unknown> }) {
  const cfg = config as ConfigType;
  const title = cfg.title ?? "Builds por Nivel";

  // Merge config overrides into BUILD_TYPES
  const types = BUILD_TYPES.map((t) => {
    const override = cfg.types?.find((o) => o.slug === t.slug);
    if (!override) return t;
    return {
      ...t,
      priceFrom: override.priceFrom ?? t.priceFrom,
    };
  }).filter((t) => {
    const override = cfg.types?.find((o) => o.slug === t.slug);
    return override?.visible !== false;
  });

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-black text-white uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <Link
          href="/builds"
          className="text-[10px] text-[#444] hover:text-[#00ff66] transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Type banners — 2 col on mobile, 5 col on large */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {types.map(({ slug, label, tagline, detail, games, priceFrom, color, dimColor, borderColor, Icon }) => (
          <Link
            key={slug}
            href={`/builds?categoria=${slug}`}
            className="group relative flex flex-col gap-2 p-3 border transition-all overflow-hidden"
            style={{ backgroundColor: dimColor, borderColor }}
          >
            {/* Top: icon + label */}
            <div className="flex items-center gap-2">
              <div
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center border"
                style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] font-black uppercase tracking-wider truncate"
                  style={{ color, fontFamily: "var(--font-display)" }}
                >
                  {label}
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-[11px] font-semibold text-white leading-tight">{tagline}</p>

            {/* Detail badge */}
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 self-start border"
              style={{ color, borderColor: `${color}30`, backgroundColor: `${color}0d` }}
            >
              {detail}
            </span>

            {/* Games */}
            <div className="flex flex-wrap gap-1 mt-auto">
              {games.slice(0, 2).map((g) => (
                <span key={g} className="text-[8px] text-[#333] truncate max-w-full">
                  {g}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="border-t pt-2" style={{ borderColor: `${color}20` }}>
              <p className="text-[8px] text-[#444] uppercase tracking-wider">Desde</p>
              <p className="text-xs font-black font-mono" style={{ color }}>
                {formatCLP(priceFrom)}
              </p>
            </div>

            {/* Hover arrow */}
            <ChevronRight
              className="absolute bottom-2.5 right-2.5 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color }}
            />

            {/* Bottom color bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: color }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
