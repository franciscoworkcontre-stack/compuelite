import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/trpc/server";

export const metadata: Metadata = {
  title: "Marcas — Compuelite",
  description: "Explora todas las marcas disponibles en Compuelite.",
};

export default async function MarcasPage() {
  const [brands, categories] = await Promise.all([
    api.products.brands({}),
    api.products.categories(),
  ]);

  return (
    <main className="min-h-screen pt-16 bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs text-[#00ff66] uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--font-display)" }}>
            Catálogo
          </p>
          <h1 className="text-3xl font-black uppercase text-white"
            style={{ fontFamily: "var(--font-display)" }}>
            Marcas
          </h1>
          <p className="text-sm text-[#555] mt-2">
            {brands.length} marcas disponibles · {categories.length} categorías
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brands grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {brands.map(({ brand, count }) => (
            <Link
              key={brand}
              href={`/productos?marca=${encodeURIComponent(brand)}`}
              className="group flex flex-col items-center gap-3 p-5 bg-[#111] border border-[#1a1a1a] rounded-xl hover:border-[#00ff66]/40 hover:bg-[#0d1a0d] transition-all"
            >
              {/* Brand initial avatar */}
              <div className="w-12 h-12 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-center text-lg font-black text-[#333] group-hover:text-[#00ff66] group-hover:border-[#00ff66]/20 transition-all"
                style={{ fontFamily: "var(--font-display)" }}>
                {brand.charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white group-hover:text-[#00ff66] transition-colors leading-tight">
                  {brand}
                </p>
                <p className="text-xs text-[#444] mt-0.5">
                  {count} producto{count !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Categories section */}
        <div className="mt-16">
          <h2 className="text-xs font-black text-[#444] uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-display)" }}>
            Categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="group flex items-center gap-3 p-4 bg-[#111] border border-[#1a1a1a] rounded-xl hover:border-[#00ff66]/30 hover:bg-[#0d1a0d] transition-all"
              >
                <div className="w-8 h-8 bg-[#00ff66]/10 border border-[#00ff66]/20 rounded-lg flex items-center justify-center text-base flex-shrink-0">
  {"🖥️"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#00ff66] transition-colors truncate">
                    {cat.name}
                  </p>
                  <p className="text-xs text-[#444]">
                    {cat._count.products} producto{cat._count.products !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
