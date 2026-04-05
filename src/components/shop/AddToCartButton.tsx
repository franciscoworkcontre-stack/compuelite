"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";

interface Props {
  product: {
    id: string;
    name: string;
    brand: string;
    price: { toNumber?: () => number } | number | string;
    sku: string;
    stock: number;
    images?: { url: string }[];
  };
}

export function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    const price =
      typeof product.price === "object" && product.price?.toNumber
        ? product.price.toNumber()
        : Number(product.price);
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price,
      sku: product.sku,
      imageUrl: product.images?.[0]?.url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="w-full py-4 bg-[#1a1a1a] border border-[#222] text-[#555] text-sm font-bold uppercase tracking-wider rounded cursor-not-allowed"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Sin Stock
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAdd}
        className={`flex-1 py-4 text-sm font-black uppercase tracking-wider rounded transition-all ${
          added
            ? "bg-[#00cc52] text-black"
            : "bg-[#00ff66] text-black hover:bg-[#00cc52] hover:shadow-[0_0_30px_rgba(0,255,102,0.4)]"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {added ? "✓ Agregado" : "Agregar al Carro"}
      </button>
      <button
        className="px-4 py-4 border border-[#222] rounded text-[#888] hover:border-[#00ff66] hover:text-[#00ff66] transition-all"
        aria-label="Agregar a wishlist"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
