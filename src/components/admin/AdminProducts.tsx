"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ProductStatus } from "@prisma/client";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

function StockEditor({
  productId,
  current,
  onDone,
}: {
  productId: string;
  current: number;
  onDone: () => void;
}) {
  const [value, setValue] = useState(String(current));
  const updateStock = trpc.admin.updateStock.useMutation({ onSuccess: onDone });

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 bg-[#0d0d0d] border border-[#00ff66]/40 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") updateStock.mutate({ productId, stock: Number(value) });
          if (e.key === "Escape") onDone();
        }}
      />
      <button
        onClick={() => updateStock.mutate({ productId, stock: Number(value) })}
        disabled={updateStock.isPending}
        className="px-2 py-1 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded text-xs text-[#00ff66] hover:bg-[#00ff66]/20 transition-all"
      >
        {updateStock.isPending ? "…" : "✓"}
      </button>
      <button
        onClick={onDone}
        className="px-2 py-1 border border-[#222] rounded text-xs text-[#555] hover:text-[#888] transition-all"
      >
        ✕
      </button>
    </div>
  );
}

export function AdminProducts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingStock, setEditingStock] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.admin.products.useQuery({
    search: debouncedSearch || undefined,
    limit: 50,
  });

  const updateStatus = trpc.admin.updateProductStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer);
    (window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(
      () => setDebouncedSearch(v),
      350
    );
  };

  const products = data?.items ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-xl font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Productos
          </h1>
          <p className="text-xs text-[#555] mt-1">{products.length} resultado{products.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nombre, SKU, marca…"
          className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/30 transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-xs text-[#555]">No hay productos</div>
      ) : (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Producto", "SKU", "Categoría", "Precio", "Stock", "Estado", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#444] uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isActive = product.status === ProductStatus.ACTIVE;
                const isEditing = editingStock === product.id;
                const lowStock = product.stock <= 3;

                return (
                  <tr key={product.id} className="border-b border-[#0d0d0d] hover:bg-[#0d0d0d] transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded overflow-hidden flex-shrink-0">
                          {product.images[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0].url} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">🖥️</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-[#555]">{product.brand}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#555]">{product.sku}</span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#666]">{product.category?.name ?? "—"}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#00ff66] font-bold">{formatCLP(product.price)}</span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <StockEditor
                          productId={product.id}
                          current={product.stock}
                          onDone={() => { setEditingStock(null); refetch(); }}
                        />
                      ) : (
                        <button
                          onClick={() => setEditingStock(product.id)}
                          className="flex items-center gap-1.5 group"
                        >
                          <span
                            className={`font-mono text-xs font-bold ${
                              lowStock ? "text-[#ff3333]" : "text-white"
                            }`}
                          >
                            {product.stock}
                          </span>
                          {lowStock && (
                            <span className="text-xs text-[#ff3333]/60">bajo</span>
                          )}
                          <svg className="w-3 h-3 text-[#333] group-hover:text-[#00ff66] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          color: isActive ? "#00ff66" : "#555",
                          background: isActive ? "#00ff6618" : "#1a1a1a",
                          border: `1px solid ${isActive ? "#00ff6633" : "#222"}`,
                        }}
                      >
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          updateStatus.mutate({
                            productId: product.id,
                            status: isActive ? ProductStatus.ARCHIVED : ProductStatus.ACTIVE,
                          })
                        }
                        disabled={updateStatus.isPending}
                        className="text-xs text-[#444] hover:text-[#00ff66] transition-colors disabled:opacity-40"
                      >
                        {isActive ? "Archivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
