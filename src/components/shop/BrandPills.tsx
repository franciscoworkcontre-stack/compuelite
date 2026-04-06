import Link from "next/link";
import { api } from "@/lib/trpc/server";

export async function BrandPills() {
  const brands = await api.products.brands({});
  const top = brands.slice(0, 8);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <Link
        href="/productos"
        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#00ff66] text-xs font-semibold hover:bg-[#00ff66]/20 transition-colors"
      >
        Todos
      </Link>
      {top.map(({ brand }) => (
        <Link
          key={brand}
          href={`/productos?marca=${encodeURIComponent(brand)}`}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#111] border border-[#1a1a1a] text-[#666] text-xs hover:border-[#2a2a2a] hover:text-white transition-colors"
        >
          {brand}
        </Link>
      ))}
    </div>
  );
}
