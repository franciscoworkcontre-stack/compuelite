import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/trpc/server";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { ContentZone } from "@/components/content/ContentZone";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n?.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

function discountPct(price: unknown, compare: unknown): number | null {
  if (!compare) return null;
  const p = Number(price);
  const c = Number(compare);
  if (c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await api.products.bySlug({ slug });
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.shortDescription ?? product.name,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await api.products.bySlug({ slug });

  if (!product) notFound();

  const disc = discountPct(product.price, product.compareAtPrice);
  const mainImg = product.images[0]?.url;

  return (
    <>
      <main className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#555] mb-8">
            <Link href="/" className="hover:text-[#00ff66] transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-[#00ff66] transition-colors">Productos</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={`/productos?categoria=${product.category.slug}`}
                  className="hover:text-[#00ff66] transition-colors"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-[#888] truncate max-w-xs">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-[#111] border border-[#222] rounded-xl overflow-hidden flex items-center justify-center">
                {mainImg ? (
                  <Image
                    src={mainImg}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="text-8xl opacity-10">🖥️</div>
                )}
                {disc && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#ff3333] text-white text-sm font-bold rounded"
                    style={{ fontFamily: "var(--font-display)" }}>
                    -{disc}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img) => (
                    <div key={img.id} className="relative w-16 h-16 bg-[#111] border border-[#222] rounded overflow-hidden">
                      <Image src={img.url} alt="" fill className="object-contain p-1" sizes="64px" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {/* Brand + SKU */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-[#00ff66] uppercase tracking-widest">
                  {product.brand}
                </span>
                <span className="text-xs text-[#444]">SKU: {product.sku}</span>
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-end gap-3 mb-2">
                <span
                  className="text-4xl font-bold font-mono text-[#00ff66]"
                  style={{}}
                >
                  {formatCLP(product.price)}
                </span>
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <span className="text-lg text-[#555] line-through mb-1">
                    {formatCLP(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#555] mb-6">Precio con IVA incluido</p>

              {/* Cuotas */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border border-[#222] rounded-lg mb-6">
                <span className="text-xs text-[#888]">
                  6 cuotas sin interés de{" "}
                  <span className="text-white font-mono font-semibold">
                    {formatCLP(Number(product.price) / 6)}
                  </span>
                </span>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
                    <span className="text-sm text-[#888]">
                      {product.stock <= 5 ? `Solo ${product.stock} en stock` : "En stock"}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#ff3333]" />
                    <span className="text-sm text-[#ff3333]">Sin stock</span>
                  </>
                )}
              </div>

              {/* Add to cart */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <AddToCartButton product={{
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: Number(product.price),
                    sku: product.sku,
                    stock: product.stock,
                    images: product.images,
                  }} />
                </div>
                <WishlistButton productId={product.id} />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mt-8">
                {[
                  { icon: "🚚", label: "Envío a Chile", sub: "Starken, Chilexpress" },
                  { icon: "🔒", label: "Pago seguro", sub: "WebPay, MP, Flow" },
                  { icon: "🛠️", label: "Garantía", sub: "Soporte técnico" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center p-3 bg-[#111] border border-[#222] rounded-lg">
                    <span className="text-xl mb-1">{b.icon}</span>
                    <p className="text-xs font-semibold text-white">{b.label}</p>
                    <p className="text-xs text-[#555]">{b.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description / Specs */}
          {(product.description || product.specs) && (
            <div className="mt-16 border-t border-[#222] pt-12">
              <h2
                className="text-xl font-black uppercase text-white mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Especificaciones
              </h2>

              {product.description && (
                <p className="text-[#888] leading-relaxed mb-6">{product.description}</p>
              )}

              {product.specs && typeof product.specs === "object" && (
                <div className="grid sm:grid-cols-2 gap-2">
                  {Object.entries(product.specs as Record<string, string>).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3 px-4 py-3 bg-[#111] border border-[#222] rounded">
                      <span className="text-xs text-[#555] uppercase tracking-wider min-w-24">{k}</span>
                      <span className="text-sm text-white font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Benchmark grid — performance data for this product category */}
        <ContentZone zone="pdp_benchmark" />

        {/* AI capability — what this GPU/CPU can do with local AI */}
        <ContentZone zone="pdp_ai" />

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related products */}
        <RelatedProducts
          categoryId={product.categoryId ?? ""}
          currentId={product.id}
        />
      </main>
    </>
  );
}
