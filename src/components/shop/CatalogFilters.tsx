"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Brand {
  brand: string;
  count: number;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  priceRange: { min: number; max: number };
}

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(n);
}

export function CatalogFilters({ categories, brands, priceRange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete("cursor"); // reset pagination
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const activeCategory = params.get("categoria");
  const activeBrand = params.get("marca");
  const activeStock = params.get("stock") === "1";

  return (
    <aside className="space-y-6">
      {/* Stock */}
      <div>
        <h3 className="text-xs font-bold text-[#00ff66] uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-display)" }}>
          Disponibilidad
        </h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              activeStock
                ? "bg-[#00ff66] border-[#00ff66]"
                : "border-[#333] group-hover:border-[#555]"
            }`}
            onClick={() => setParam("stock", activeStock ? null : "1")}
          >
            {activeStock && (
              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-sm text-[#888] group-hover:text-white transition-colors">
            Solo en stock
          </span>
        </label>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-[#00ff66] uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-display)" }}>
          Categoría
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam("categoria", null)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-all flex items-center justify-between group ${
                !activeCategory
                  ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30"
                  : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <span>Todos</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setParam("categoria", cat.slug)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-all flex items-center justify-between group ${
                  activeCategory === cat.slug
                    ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30"
                    : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs tabular-nums ${activeCategory === cat.slug ? "text-[#00ff66]/60" : "text-[#444]"}`}>
                  {cat._count.products}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-[#00ff66] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-display)" }}>
            Marca
          </h3>
          <ul className="space-y-1">
            {brands.map(({ brand, count }) => (
              <li key={brand}>
                <button
                  onClick={() => setParam("marca", activeBrand === brand ? null : brand)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-all flex items-center justify-between ${
                    activeBrand === brand
                      ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30"
                      : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span>{brand}</span>
                  <span className="text-xs text-[#444] tabular-nums">{count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price range info */}
      <div>
        <h3 className="text-xs font-bold text-[#00ff66] uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-display)" }}>
          Rango de precios
        </h3>
        <p className="text-xs text-[#555]">
          {formatCLP(priceRange.min)} — {formatCLP(priceRange.max)}
        </p>
      </div>
    </aside>
  );
}
