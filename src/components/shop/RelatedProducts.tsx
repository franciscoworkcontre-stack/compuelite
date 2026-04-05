"use client";

import Link from "next/link";
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
  categoryId: string;
  currentId: string;
}

export function RelatedProducts({ currentId }: Props) {
  const { data } = trpc.products.list.useQuery({
    inStock: true,
    limit: 4,
    sort: "featured",
  });

  const products = (data?.items ?? []).filter((p) => p.id !== currentId).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[#1a1a1a] pt-12">
      <h2 className="text-lg font-black text-white uppercase tracking-wide mb-6"
        style={{ fontFamily: "var(--font-display)" }}>
        También te puede interesar
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => {
          const img = product.images[0]?.url;
          return (
            <Link
              key={product.id}
              href={`/productos/${product.slug}`}
              className="group flex flex-col bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#00ff66]/30 transition-all"
            >
              <div className="aspect-square bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={product.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-3xl opacity-10">🖥️</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-[#555] mb-1">{product.brand}</p>
                <p className="text-xs font-medium text-white leading-snug line-clamp-2 group-hover:text-[#00ff66] transition-colors">
                  {product.name}
                </p>
                <p className="text-sm font-bold font-mono text-[#00ff66] mt-2">
                  {formatCLP(product.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
