"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Simple Icons slugs for each brand
const BRANDS = [
  { name: "NVIDIA",        slug: "nvidia"       },
  { name: "AMD",           slug: "amd"          },
  { name: "Intel",         slug: "intel"        },
  { name: "Asus",          slug: "asus"         },
  { name: "MSI",           slug: "msi"          },
  { name: "Corsair",       slug: "corsair"      },
  { name: "Samsung",       slug: "samsung"      },
  { name: "Seagate",       slug: "seagate"      },
  { name: "Cooler Master", slug: "coolermaster" },
  { name: "NZXT",          slug: "nzxt"         },
  { name: "Razer",         slug: "razer"        },
  { name: "Kingston",      slug: "kingston"     },
];

export function BrandFilter() {
  const searchParams = useSearchParams();
  const activeBrand = searchParams.get("marca") ?? "";

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {/* "All" pill */}
      <Link
        href="/productos"
        className="flex-shrink-0 px-3 py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider transition-colors"
        style={
          activeBrand === ""
            ? { background: "#00ff6615", borderColor: "#00ff6630", color: "#00ff66" }
            : { background: "transparent", borderColor: "#1a1a1a", color: "#444" }
        }
      >
        Todos
      </Link>

      {BRANDS.map(({ name, slug }) => (
        <Link
          key={slug}
          href={`/productos?marca=${encodeURIComponent(name)}`}
          title={name}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border transition-all"
          style={
            activeBrand === name
              ? { background: "#00ff6610", borderColor: "#00ff6635" }
              : { background: "#0d0d0d", borderColor: "#161616" }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.simpleicons.org/${slug}/ffffff`}
            alt={name}
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain opacity-40 hover:opacity-80 transition-opacity"
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              if (el.nextElementSibling) {
                (el.nextElementSibling as HTMLElement).style.display = "block";
              }
            }}
          />
          <span className="hidden text-[8px] text-[#555] font-bold uppercase">{name.slice(0, 3)}</span>
        </Link>
      ))}
    </div>
  );
}
