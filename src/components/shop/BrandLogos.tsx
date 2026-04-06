"use client";

// Simple Icons CDN: https://cdn.simpleicons.org/{slug}/color
// All logos are white (#ffffff) on transparent background

const BRANDS = [
  { name: "NVIDIA",       slug: "nvidia"       },
  { name: "AMD",          slug: "amd"          },
  { name: "Intel",        slug: "intel"        },
  { name: "Asus",         slug: "asus"         },
  { name: "MSI",          slug: "msi"          },
  { name: "Corsair",      slug: "corsair"      },
  { name: "Samsung",      slug: "samsung"      },
  { name: "Seagate",      slug: "seagate"      },
  { name: "Cooler Master",slug: "coolermaster" },
  { name: "NZXT",         slug: "nzxt"         },
  { name: "Razer",        slug: "razer"        },
  { name: "Kingston",     slug: "kingston"     },
];

export function BrandLogos() {
  // Duplicate for seamless marquee loop
  const all = [...BRANDS, ...BRANDS];

  return (
    <div>
      <p className="text-[9px] text-[#222] uppercase tracking-widest text-center mb-5">
        Trabajamos con las mejores marcas
      </p>

      {/* Marquee container */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />

        <div className="flex gap-10 brand-marquee">
          {all.map((brand, i) => (
            <div
              key={`${brand.slug}-${i}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 opacity-20 hover:opacity-60 transition-opacity duration-300"
              title={brand.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://cdn.simpleicons.org/${brand.slug}/ffffff`}
                alt={brand.name}
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                loading="lazy"
                onError={(e) => {
                  // fallback: show text if logo not found
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  el.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <span className="hidden text-[10px] text-[#444] font-bold uppercase tracking-wider">
                {brand.name}
              </span>
              <span className="text-[9px] text-[#222]">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
