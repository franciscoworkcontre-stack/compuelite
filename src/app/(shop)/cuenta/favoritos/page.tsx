"use client";

import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && (n as { toNumber?: () => number }).toNumber
    ? (n as { toNumber: () => number }).toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(val);
}

export default function FavoritosPage() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.wishlist.list.useQuery();
  const remove = trpc.wishlist.remove.useMutation({ onSuccess: () => utils.wishlist.list.invalidate() });

  if (isLoading) return (
    <main className="min-h-screen pt-24 px-4 max-w-5xl mx-auto">
      <p className="text-[#555]">Cargando favoritos...</p>
    </main>
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Mis favoritos</h1>
          {items && items.length > 0 && (
            <p className="text-xs text-[#555]">{items.length} producto{items.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {!items?.length ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🤍</p>
            <p className="text-[#555] mb-6">Aún no tienes favoritos.</p>
            <Link href="/productos" className="text-[#00ff66] hover:underline text-sm">
              Explorar productos →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const product = item.product;
              const img = product.images[0]?.url;
              return (
                <div key={product.id} className="group relative bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all">
                  <button
                    onClick={() => remove.mutate({ productId: product.id })}
                    className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-[#0f0f0f]/80 border border-[#222] rounded-full text-[#ff4444] hover:bg-[#1a0000] transition-colors text-xs"
                    title="Quitar de favoritos"
                  >
                    ✕
                  </button>
                  <Link href={`/productos/${product.slug}`}>
                    <div className="relative aspect-square bg-[#080808]">
                      {img ? (
                        <Image src={img} alt={product.name} fill className="object-contain p-4" sizes="(max-width: 640px) 50vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-10">🖥️</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-[#444] mb-1">{product.brand}</p>
                      <p className="text-xs text-[#d0d0d0] leading-snug line-clamp-2 group-hover:text-white transition-colors mb-2">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold font-mono text-[#00ff66]">{formatCLP(product.price)}</p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <AddToCartButton product={{
                      id: product.id,
                      name: product.name,
                      brand: product.brand,
                      price: Number(product.price),
                      sku: product.sku,
                      stock: product.stock,
                      images: product.images,
                    }} compact />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
