"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data, isLoading } = trpc.products.list.useQuery(
    { search: debouncedQuery, limit: 6, inStock: true },
    { enabled: debouncedQuery.length >= 2 }
  );

  const handleSelect = useCallback((slug: string) => {
    router.push(`/productos/${slug}`);
    onClose();
  }, [router, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/productos?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!open) return null;

  const results = data?.items ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-[#111] border border-[#222] rounded-2xl shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a]">
            <svg className="w-4 h-4 text-[#555] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, marcas..."
              className="flex-1 bg-transparent text-white placeholder-[#444] text-sm focus:outline-none"
            />
            <kbd className="hidden sm:block text-xs text-[#444] border border-[#333] rounded px-1.5 py-0.5 font-mono">
              ESC
            </kbd>
          </div>
        </form>

        {/* Results */}
        {debouncedQuery.length >= 2 && (
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-lg" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#555]">
                No se encontraron resultados para &ldquo;{debouncedQuery}&rdquo;
              </div>
            ) : (
              <div className="p-2">
                {results.map((product) => {
                  const img = product.images[0]?.url;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product.slug)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left group"
                    >
                      <div className="w-10 h-10 bg-[#0d0d0d] border border-[#222] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-lg opacity-20">🖥️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate group-hover:text-[#00ff66] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#555]">{product.brand}</p>
                      </div>
                      <p className="text-sm font-mono font-bold text-[#00ff66] flex-shrink-0">
                        {formatCLP(product.price)}
                      </p>
                    </button>
                  );
                })}

                {data && data.items.length === 6 && (
                  <button
                    onClick={() => {
                      router.push(`/productos?q=${encodeURIComponent(debouncedQuery)}`);
                      onClose();
                    }}
                    className="w-full py-2.5 text-xs text-[#444] hover:text-[#00ff66] transition-colors text-center"
                  >
                    Ver todos los resultados para &ldquo;{debouncedQuery}&rdquo; →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {debouncedQuery.length < 2 && (
          <div className="px-4 py-6 text-xs text-[#444] text-center">
            Escribe al menos 2 caracteres para buscar
          </div>
        )}
      </div>
    </div>
  );
}
