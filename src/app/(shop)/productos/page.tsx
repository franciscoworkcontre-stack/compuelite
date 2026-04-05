import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogFilters } from "@/components/shop/CatalogFilters";
import { CatalogGrid } from "@/components/shop/CatalogGrid";
import { api } from "@/lib/trpc/server";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo completo de PCs Gaming armadas y monitores en Chile.",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const categorySlug = sp.categoria;

  const [categories, brands, priceRange] = await Promise.all([
    api.products.categories(),
    api.products.brands({ categorySlug }),
    api.products.priceRange({ categorySlug }),
  ]);

  return (
    <>
      <main className="min-h-screen pt-16">
        {/* Header */}
        <div className="border-b border-[#222] bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-xs text-[#00ff66] uppercase tracking-widest mb-2">Catálogo</p>
            <h1
              className="text-3xl font-black uppercase text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {categorySlug
                ? (categories.find((c) => c.slug === categorySlug)?.name ?? "Productos")
                : "Todos los Productos"}
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <CatalogFilters
                categories={categories}
                brands={brands}
                priceRange={priceRange}
              />
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              <Suspense
                fallback={
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="skeleton rounded-xl aspect-[3/4]" />
                    ))}
                  </div>
                }
              >
                <CatalogGrid />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
