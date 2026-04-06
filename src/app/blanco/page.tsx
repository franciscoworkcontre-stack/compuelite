import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/trpc/server";
import { Truck, Lock, Zap, Wrench, ChevronRight, Zap as ZapIcon, Gamepad2, Skull, Laptop, Home as HomeIcon, Menu, ShoppingCart, Search } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

function WhiteNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/blanco" className="flex items-center gap-2 group">
            <span
              className="text-xl font-black tracking-widest text-[#111827] group-hover:text-[#16a34a] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              COMPUELITE
            </span>
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/productos", label: "Productos" },
              { href: "/builder", label: "Arma tu PC" },
              { href: "/builds", label: "Builds" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#6b7280] hover:text-[#111827] transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-[#6b7280] hover:text-[#111827] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/carrito"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16a34a] text-white text-sm font-bold hover:bg-[#15803d] transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
            </Link>
            <button className="md:hidden p-2 text-[#6b7280]">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Featured Banners ────────────────────────────────────────────────────────

async function WhiteBanners() {
  const [customBanners, featured] = await Promise.all([
    api.content.banners(),
    api.products.featured({ limit: 2 }),
  ]);

  if (customBanners.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {customBanners.slice(0, 2).map((banner, i) => (
          <Link
            key={banner.id}
            href={banner.href}
            className="group relative flex items-center justify-between gap-4 bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-7 overflow-hidden hover:border-[#16a34a]/40 hover:shadow-lg transition-all duration-300"
          >
            {/* Subtle background tint on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#16a34a] mb-1.5">
                {banner.subtitle ?? "Destacado"}
              </p>
              <h3
                className="text-[#111827] font-black text-lg leading-snug mb-4 line-clamp-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {banner.title}
              </h3>
              <span className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-[#16a34a] text-white group-hover:bg-[#15803d] transition-colors">
                Ver más →
              </span>
            </div>

            <div className="relative flex-shrink-0 w-24 h-24 sm:w-36 sm:h-36">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                sizes="160px"
              />
            </div>

            {/* Accent stripe */}
            <div
              className="absolute bottom-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: banner.accentColor }}
            />
          </Link>
        ))}
      </div>
    );
  }

  const banners = featured.slice(0, 2);
  if (banners.length === 0) return null;

  const ACCENTS = ["#16a34a", "#2563eb"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {banners.map((product, i) => {
        const price = Number(product.price);
        const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
        const disc = compare && compare > price
          ? Math.round(((compare - price) / compare) * 100)
          : null;
        const img = product.images[0]?.url;
        const accent = ACCENTS[i % ACCENTS.length]!;

        return (
          <Link
            key={product.id}
            href={`/productos/${product.slug}`}
            className="group relative flex items-center justify-between gap-4 bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-7 overflow-hidden hover:border-[#16a34a]/40 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>
                {product.brand}
              </p>
              <h3
                className="text-[#111827] font-black text-lg leading-snug mb-3 line-clamp-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                <span className="text-2xl font-black" style={{ color: accent, fontFamily: "var(--font-display)" }}>
                  {formatCLP(price)}
                </span>
                {compare && <span className="text-sm text-[#9ca3af] line-through">{formatCLP(compare)}</span>}
              </div>
              <span className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all group-hover:opacity-90" style={{ backgroundColor: accent }}>
                Comprar →
              </span>
            </div>

            {img && (
              <div className="relative flex-shrink-0 w-24 h-24 sm:w-36 sm:h-36">
                <Image
                  src={img}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                  sizes="160px"
                />
              </div>
            )}

            {disc && (
              <div
                className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: accent }}
              >
                -{disc}%
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Brand Filter ────────────────────────────────────────────────────────────

const BRANDS_FILTER = [
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

function WhiteBrandFilter() {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      <Link
        href="/productos"
        className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[#16a34a] bg-[#f0fdf4] text-[#16a34a] text-[10px] font-bold uppercase tracking-wider"
      >
        Todos
      </Link>
      {BRANDS_FILTER.map(({ name, slug }) => (
        <Link
          key={slug}
          href={`/productos?marca=${encodeURIComponent(name)}`}
          title={name}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e7eb] bg-white hover:border-[#16a34a]/40 hover:bg-[#f0fdf4] transition-all"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.simpleicons.org/${slug}/374151`}
            alt={name}
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain opacity-60"
            loading="lazy"
          />
        </Link>
      ))}
    </div>
  );
}

// ─── Best Deals ──────────────────────────────────────────────────────────────

async function WhiteBestDeals() {
  const deals = await api.products.bestDeals({ limit: 10 });
  if (deals.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]" />
            </span>
            <h2
              className="text-sm font-black text-[#111827] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Mejores ofertas
            </h2>
          </div>
          <span className="text-[10px] text-[#6b7280] border border-[#e5e7eb] rounded-full px-2 py-0.5 bg-[#f9fafb]">
            {deals.length} activas
          </span>
        </div>
        <Link
          href="/productos"
          className="text-[10px] text-[#9ca3af] hover:text-[#16a34a] transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          Ver todos
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {deals.map((product) => {
          const price = Number(product.price);
          const compare = Number(product.compareAtPrice);
          const saved = compare - price;
          const img = product.images[0]?.url;

          return (
            <Link
              key={product.id}
              href={`/productos/${product.slug}`}
              className="group flex-shrink-0 w-40 flex flex-col bg-white border border-[#e5e7eb] rounded-xl overflow-hidden hover:border-[#16a34a]/40 hover:shadow-md transition-all duration-200"
            >
              <div className="relative aspect-square bg-[#f9fafb]">
                {img ? (
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#d1d5db] text-3xl">📦</div>
                )}
                <div className="absolute top-2 left-2 bg-[#16a34a] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  -{product.discountPct}%
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1.5">
                <p className="text-[9px] text-[#9ca3af] uppercase tracking-wider truncate">{product.brand}</p>
                <p className="text-xs text-[#374151] group-hover:text-[#111827] transition-colors line-clamp-2 leading-snug">
                  {product.name}
                </p>
                <div className="mt-auto pt-1.5 border-t border-[#f3f4f6]">
                  <p className="text-[10px] text-[#9ca3af] line-through">{formatCLP(compare)}</p>
                  <p className="text-sm font-bold text-[#16a34a]" style={{ fontFamily: "var(--font-display)" }}>
                    {formatCLP(price)}
                  </p>
                  <p className="text-[9px] text-[#9ca3af]">Ahorrás {formatCLP(saved)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Builds By Type ──────────────────────────────────────────────────────────

const BUILD_TYPES = [
  {
    slug: "pc-gamer-start-series",
    label: "Start Series",
    tagline: "Tu primer PC gamer",
    detail: "1080p · 144fps+",
    priceFrom: 399990,
    color: "#2563eb",
    Icon: ZapIcon,
  },
  {
    slug: "pc-gamer-pro-series",
    label: "Pro Series",
    tagline: "1440p sin compromiso",
    detail: "1440p · 165fps",
    priceFrom: 799990,
    color: "#16a34a",
    Icon: Gamepad2,
  },
  {
    slug: "pc-elite",
    label: "PC Elite®",
    tagline: "4K. Sin límites.",
    detail: "4K · RTX 4080+",
    priceFrom: 1899990,
    color: "#d97706",
    Icon: Skull,
  },
  {
    slug: "workstation",
    label: "Workstation",
    tagline: "Rendimiento profesional",
    detail: "Render · Video · CAD",
    priceFrom: 1299990,
    color: "#7c3aed",
    Icon: Laptop,
  },
  {
    slug: "componentes",
    label: "Hogar & Oficina",
    tagline: "Eficiente y silenciosa",
    detail: "Office · Streaming",
    priceFrom: 249990,
    color: "#6b7280",
    Icon: HomeIcon,
  },
];

function WhiteBuildsSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-sm font-black text-[#111827] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Builds por Nivel
        </h2>
        <Link
          href="/builds"
          className="text-[10px] text-[#9ca3af] hover:text-[#16a34a] transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {BUILD_TYPES.map(({ slug, label, tagline, detail, priceFrom, color, Icon }) => (
          <Link
            key={slug}
            href={`/builds?categoria=${slug}`}
            className="group relative flex flex-col gap-2.5 p-4 bg-white border border-[#e5e7eb] rounded-xl hover:border-[#e5e7eb] hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Top color bar */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: color }}
            />

            <div className="flex items-center gap-2">
              <div
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p
                className="text-[11px] font-black uppercase tracking-wider"
                style={{ color, fontFamily: "var(--font-display)" }}
              >
                {label}
              </p>
            </div>

            <p className="text-[12px] font-semibold text-[#111827] leading-tight">{tagline}</p>

            <span
              className="text-[9px] font-mono px-1.5 py-0.5 self-start rounded border"
              style={{ color, borderColor: `${color}30`, backgroundColor: `${color}0d` }}
            >
              {detail}
            </span>

            <div className="mt-auto pt-2.5 border-t border-[#f3f4f6]">
              <p className="text-[8px] text-[#9ca3af] uppercase tracking-wider">Desde</p>
              <p className="text-xs font-black font-mono" style={{ color }}>
                {formatCLP(priceFrom)}
              </p>
            </div>

            <ChevronRight
              className="absolute bottom-3 right-3 w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity"
              style={{ color }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Trust Signals ───────────────────────────────────────────────────────────

function WhiteTrustSignals() {
  const signals = [
    { Icon: Truck,  title: "Envío a Chile",    desc: "Starken · Chilexpress · Blue Express" },
    { Icon: Lock,   title: "Pago seguro",       desc: "WebPay · Mercado Pago · Flow" },
    { Icon: Zap,    title: "Stock real",        desc: "Disponibilidad en tiempo real" },
    { Icon: Wrench, title: "Garantía",          desc: "Respaldo técnico postventa" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-t border-[#f3f4f6]">
      {signals.map(({ Icon, title, desc }) => (
        <div
          key={title}
          className="flex items-center gap-3 p-3 rounded-xl bg-[#f9fafb] border border-[#f3f4f6]"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-[#f0fdf4] border border-[#16a34a]/20">
            <Icon className="w-[15px] h-[15px] text-[#16a34a]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#111827] leading-tight">{title}</p>
            <p className="text-[10px] text-[#9ca3af] leading-snug mt-0.5 truncate">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Brand Logos Marquee ─────────────────────────────────────────────────────

const BRANDS_MARQUEE = [
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

function WhiteBrandLogos() {
  const all = [...BRANDS_MARQUEE, ...BRANDS_MARQUEE];

  return (
    <div className="py-4 border-t border-[#f3f4f6]">
      <p className="text-[9px] text-[#d1d5db] uppercase tracking-widest text-center mb-5">
        Trabajamos con las mejores marcas
      </p>
      <div className="relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #ffffff, transparent)" }}
        />
        <div className="flex gap-10 brand-marquee">
          {all.map((brand, i) => (
            <div
              key={`${brand.slug}-${i}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 opacity-30 hover:opacity-70 transition-opacity duration-300"
              title={brand.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://cdn.simpleicons.org/${brand.slug}/374151`}
                alt={brand.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
                loading="lazy"
              />
              <span className="text-[9px] text-[#d1d5db]">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function WhiteFooter() {
  const links = {
    Tienda: [
      { href: "/productos", label: "Todos los productos" },
      { href: "/productos/gpu", label: "Tarjetas de Video" },
      { href: "/productos/cpu", label: "Procesadores" },
      { href: "/productos/ram", label: "Memorias RAM" },
    ],
    "PC Builder": [
      { href: "/builder", label: "Armar PC" },
      { href: "/builds", label: "Builds populares" },
      { href: "/builds/gaming", label: "Builds Gaming" },
    ],
    Ayuda: [
      { href: "/envios", label: "Envíos" },
      { href: "/garantia", label: "Garantía" },
      { href: "/devoluciones", label: "Devoluciones" },
      { href: "/contacto", label: "Contacto" },
    ],
  };

  return (
    <footer className="bg-[#f9fafb] border-t border-[#e5e7eb] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/blanco" className="inline-block mb-4">
              <span
                className="text-xl font-black tracking-widest text-[#111827]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                COMPUELITE
              </span>
            </Link>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-6 max-w-xs">
              La plataforma de gaming más avanzada de Chile. Construye tu PC ideal con nuestro configurador interactivo.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, sectionLinks]) => (
            <div key={section}>
              <h3
                className="text-xs font-bold uppercase tracking-widest text-[#16a34a] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {section}
              </h3>
              <ul className="space-y-2.5">
                {sectionLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9ca3af]">
            © {new Date().getFullYear()} CompuElite. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#9ca3af]">
            Hecho con ♥ en Chile
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BlancoPaPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <WhiteNavbar />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

          {/* Brand filter */}
          <WhiteBrandFilter />

          {/* Featured banners */}
          <Suspense fallback={<div className="h-40 rounded-2xl bg-[#f9fafb] animate-pulse" />}>
            <WhiteBanners />
          </Suspense>

          {/* Best deals */}
          <Suspense fallback={<div className="h-48 rounded-xl bg-[#f9fafb] animate-pulse" />}>
            <WhiteBestDeals />
          </Suspense>

          {/* Builds by type */}
          <WhiteBuildsSection />

          {/* Trust signals */}
          <WhiteTrustSignals />

          {/* Brand logos */}
          <WhiteBrandLogos />
        </div>
      </main>

      <WhiteFooter />
    </div>
  );
}
