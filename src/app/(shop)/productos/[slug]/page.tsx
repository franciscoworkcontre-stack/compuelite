import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/trpc/server";
import { ProductDetailView } from "@/components/shop/ProductDetailView";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { ContentZone } from "@/components/content/ContentZone";

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

  // Serialize for client component (Decimal → number)
  const serialized = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    discount: disc,
    stock: product.stock,
    productType: product.productType ?? undefined,
    images: product.images.map((img) => ({ id: img.id, url: img.url })),
    specs: product.specs as Record<string, string> | null,
    description: product.description ?? null,
    category: product.category ?? null,
  };

  return (
    <main className="min-h-screen pt-16 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#444] mb-10">
          <Link href="/" className="hover:text-[#00ff66] transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-[#00ff66] transition-colors">Productos</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/productos?categoria=${product.category.slug}`}
                className="hover:text-[#00ff66] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#666] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main product view — animated client component */}
        <ProductDetailView product={serialized} />

        {/* Full description — HTML from Jumpseller rendered with dark-theme overrides */}
        {product.description && (
          <div className="mt-12 border-t border-[#111] pt-10">
            <h2
              className="text-xl font-black uppercase text-white mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Descripción
            </h2>
            <div
              className="product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Full specs table */}
        {product.specs && typeof product.specs === "object" && (
          <div className="mt-16 border-t border-[#111] pt-12">
            <h2
              className="text-xl font-black uppercase text-white mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Especificaciones completas
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(product.specs as Record<string, string>).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-start gap-3 px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg hover:border-[#222] transition-colors"
                >
                  <span className="text-xs text-[#444] uppercase tracking-wider min-w-28 pt-0.5">{k}</span>
                  <span className="text-sm text-white font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Benchmark / AI content zones */}
      <ContentZone zone="pdp_benchmark" />
      <ContentZone zone="pdp_ai" />

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related */}
      <RelatedProducts
        categoryId={product.categoryId ?? ""}
        currentId={product.id}
      />
    </main>
  );
}
