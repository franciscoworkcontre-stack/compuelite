"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ProductCard } from "./ProductCard";

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "featured", label: "Destacados" },
];

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
      {
        categorySlug,
        brand,
        inStock,
        search,
        sort,
        limit: 24,
      },
      {
        getNextPageParam: (last) => last.nextCursor,
      }
    );

  const { data: total } = trpc.products.count.useQuery({
    categorySlug,
    brand,
    inStock,
    search,
  });

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            defaultValue={search}
            onChange={(e) => {
              const v = e.target.value;
              setTimeout(() => setParam("q", v || null), 400);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#111] border border-[#222] rounded text-sm text-white placeholder-[#444] focus:border-[#00ff66] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Count */}
          {total !== undefined && (
            <span className="text-xs text-[#555] whitespace-nowrap">
              {total} productos
            </span>
          )}

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setParam("orden", e.target.value)}
            className="bg-[#111] border border-[#222] rounded text-sm text-[#888] px-3 py-2 focus:border-[#00ff66] focus:outline-none cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl aspect-[3/4]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4 opacity-20">🔍</div>
          <p className="text-[#555] text-sm">No se encontraron productos con esos filtros</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as Parameters<typeof ProductCard>[0]["product"]} />
            ))}
          </div>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 border border-[#222] rounded text-sm text-[#888] hover:border-[#00ff66] hover:text-[#00ff66] transition-all disabled:opacity-50"
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
