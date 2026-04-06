"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ProductCard } from "./ProductCard";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImage = Product & { images: ProductImage[] };

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "featured", label: "Destacados" },
];

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

function discountPct(price: unknown, compare: unknown): number | null {
  if (!compare) return null;
  const p = Number(price);
  const c = Number(compare);
  if (c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

// Hero card — first featured product, large horizontal layout
function HeroCard({ product }: { product: ProductWithImage }) {
  const disc = discountPct(product.price, product.compareAtPrice);
  const img = product.images[0]?.url;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group relative col-span-2 flex bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all duration-200 min-h-[280px]"
    >
      {/* Left: image */}
      <div className="relative w-2/5 bg-[#080808] overflow-hidden flex-shrink-0">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-contain p-8 group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-[#1a1a1a]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        )}
        {disc && (
          <div className="absolute top-4 left-4 px-2 py-0.5 bg-white text-black text-xs font-bold rounded-full" style={{ fontFamily: "var(--font-display)" }}>
            -{disc}%
          </div>
        )}
      </div>

      {/* Right: info */}
      <div className="flex flex-col flex-1 p-8 justify-between">
        <div>
          <p className="text-[10px] text-[#444] uppercase tracking-widest mb-3">{product.brand}</p>
          <h3
            className="text-2xl font-black text-white leading-tight mb-4 group-hover:text-[#00ff66] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-sm text-[#555] leading-relaxed line-clamp-3">{product.shortDescription}</p>
          )}
        </div>

        <div className="flex items-end justify-between mt-6">
          <div>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <p className="text-xs text-[#444] line-through mb-1">{formatCLP(product.compareAtPrice)}</p>
            )}
            <p className="text-3xl font-black font-mono text-white">{formatCLP(product.price)}</p>
            <p className="text-xs text-[#383838] mt-1">IVA incluido</p>
          </div>
          <div className="px-4 py-2 border border-[#00ff66]/30 text-[#00ff66] text-xs font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-all" style={{ fontFamily: "var(--font-display)" }}>
            Ver detalle →
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
        {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos) => (
          <div key={pos} className={`absolute ${pos} w-6 h-6`}>
            <div className="absolute top-0 left-0 w-full h-px bg-white/15" />
            <div className="absolute top-0 left-0 w-px h-full bg-white/15" />
          </div>
        ))}
      </div>
    </Link>
  );
}

// Wide card (2/3 width in bento row)
function WideCard({ product }: { product: ProductWithImage }) {
  return (
    <div className="col-span-2">
      <ProductCard product={product} />
    </div>
  );
}

export function CatalogGrid() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const categorySlug = params.get("categoria") ?? undefined;
  const brand = params.get("marca") ?? undefined;
  const inStock = params.get("stock") === "1" ? true : undefined;
  const search = params.get("q") ?? undefined;
  const sort = (params.get("orden") as "newest" | "price_asc" | "price_desc" | "featured") ?? "newest";

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.products.list.useInfiniteQuery(
      { categorySlug, brand, inStock, search, sort, limit: 24 },
      { getNextPageParam: (last) => last.nextCursor }
    );

  const { data: total } = trpc.products.count.useQuery({ categorySlug, brand, inStock, search });
  const products = data?.pages.flatMap((p) => p.items) ?? [];

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  };

  const hero = products[0] as ProductWithImage | undefined;
  const bento = products.slice(1, 4) as ProductWithImage[];
  const grid = products.slice(4) as ProductWithImage[];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            defaultValue={search}
            onChange={(e) => {
              const v = e.target.value;
              setTimeout(() => setParam("q", v || null), 400);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-sm text-white placeholder-[#383838] focus:border-[#2a2a2a] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          {total !== undefined && (
            <span className="text-xs text-[#444] tabular-nums">{total} productos</span>
          )}
          <select
            value={sort}
            onChange={(e) => setParam("orden", e.target.value)}
            className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-sm text-[#666] px-3 py-2 focus:outline-none cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 h-72 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 border border-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-[#444] text-sm">Sin resultados para esos filtros</p>
        </div>
      ) : (
        <>
          {/* Hero + bento layout */}
          {hero && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {/* Hero takes 2 cols on desktop */}
              <HeroCard product={hero} />
              {/* Remaining 2 products in 1 col each */}
              {bento.slice(0, 1).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Second bento row: 1 col + 2-col wide */}
          {bento.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <ProductCard product={bento[1]} />
              <div className="col-span-2">
                <ProductCard product={bento[2]} />
              </div>
            </div>
          )}

          {/* Standard grid for the rest */}
          {grid.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {grid.map((p) => (
                <ProductCard key={p.id} product={p as ProductWithImage} />
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 border border-[#1a1a1a] rounded-lg text-sm text-[#555] hover:border-[#2a2a2a] hover:text-[#888] transition-all disabled:opacity-50"
              >
                {isFetchingNextPage ? "Cargando..." : "Ver más productos"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
