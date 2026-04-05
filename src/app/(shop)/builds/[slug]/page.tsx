import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

const TYPE_LABEL: Record<string, string> = {
  GPU: "Tarjeta de Video",
  CPU: "Procesador",
  MOTHERBOARD: "Placa Madre",
  RAM: "Memoria RAM",
  STORAGE_SSD: "Almacenamiento",
  STORAGE_HDD: "Almacenamiento HDD",
  CPU_COOLER: "Refrigeración",
  AIO_COOLER: "AIO Cooler",
  PSU: "Fuente de Poder",
  CASE: "Gabinete",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const build = await api.builder.getSharedBuild({ slug });
    return {
      title: `${build.name ?? "PC Build"} — Compuelite`,
      description: `PC gamer armada en Compuelite · ${formatCLP(build.totalPrice)}`,
    };
  } catch {
    return { title: "Build — Compuelite" };
  }
}

export default async function SharedBuildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let build;
  try {
    build = await api.builder.getSharedBuild({ slug });
  } catch {
    notFound();
  }

  const total = typeof build.totalPrice === "object" && build.totalPrice !== null && "toNumber" in build.totalPrice
    ? (build.totalPrice as { toNumber: () => number }).toNumber()
    : Number(build.totalPrice);

  // Sort components by canonical order
  const ORDER = ["GPU", "CPU", "MOTHERBOARD", "RAM", "STORAGE_SSD", "STORAGE_HDD", "CPU_COOLER", "AIO_COOLER", "PSU", "CASE"];
  const sorted = [...build.components].sort(
    (a, b) => (ORDER.indexOf(a.componentType) ?? 99) - (ORDER.indexOf(b.componentType) ?? 99)
  );

  return (
    <main className="min-h-screen bg-[#080808] pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] text-[#333] uppercase tracking-widest mb-2">Build compartida</p>
          <h1
            className="text-2xl font-black text-white uppercase tracking-tight mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {build.name ?? "Mi PC Gamer"}
          </h1>
          {build.user?.name && (
            <p className="text-xs text-[#444]">Configurada por <span className="text-[#555]">{build.user.name}</span></p>
          )}
        </div>

        {/* Component list */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl overflow-hidden mb-6">
          {sorted.map((comp, i) => {
            const img = comp.product.images[0]?.url;
            const price = Number(comp.product.price);
            return (
              <div
                key={comp.id}
                className={`flex items-center gap-4 px-5 py-4 ${i !== 0 ? "border-t border-[#141414]" : ""}`}
              >
                {/* Image */}
                <div className="w-12 h-12 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={comp.product.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-[#1a1a1a] text-xs">—</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#383838] uppercase tracking-widest">
                    {TYPE_LABEL[comp.componentType] ?? comp.componentType}
                  </p>
                  <Link
                    href={`/productos/${comp.product.slug}`}
                    className="text-sm text-white hover:text-[#00ff66] transition-colors truncate block"
                  >
                    {comp.product.name}
                  </Link>
                  <p className="text-[10px] text-[#333]">{comp.product.brand}</p>
                </div>

                {/* Price */}
                <p className="text-sm font-mono font-bold text-white flex-shrink-0">
                  {formatCLP(price)}
                </p>
              </div>
            );
          })}

          {/* Total row */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
            <p
              className="text-xs font-black text-[#444] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Total
            </p>
            <p className="text-xl font-black font-mono text-[#00ff66]">
              {formatCLP(total)}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/builder"
            className="flex-1 py-3.5 bg-[#00ff66] text-black text-sm font-black uppercase tracking-widest rounded-lg hover:bg-[#00e85c] active:scale-[0.98] transition-all text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Armar build similar
          </Link>
          <Link
            href="/productos"
            className="flex-1 py-3.5 border border-[#1a1a1a] text-[#555] text-sm uppercase tracking-wider rounded-lg hover:border-[#252525] hover:text-[#888] transition-all text-center"
          >
            Ver catálogo
          </Link>
        </div>

        <p className="text-center text-[10px] text-[#2a2a2a] mt-8 uppercase tracking-widest">
          Compuelite · Construye tu PC ideal
        </p>
      </div>
    </main>
  );
}
