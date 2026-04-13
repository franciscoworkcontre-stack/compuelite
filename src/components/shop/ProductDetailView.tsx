"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ShoppingCart, Shield, Truck, CreditCard, Cpu, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { PrebuiltSubstituteWarning } from "@/components/shop/PrebuiltSubstituteWarning";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    brand: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    discount: number | null;
    stock: number;
    productType?: string;
    images: Array<{ id: string; url: string }>;
    specs: Record<string, string> | null;
    description: string | null;
    category: { name: string; slug: string } | null;
  };
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 16, mass: 0.75 },
  },
};

// ─── Format ───────────────────────────────────────────────────────────────────

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── ProductGallery ───────────────────────────────────────────────────────────

function ProductGallery({
  images,
  name,
}: {
  images: Array<{ id: string; url: string }>;
  name: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[#111] border border-[#1a1a1a] rounded-2xl flex items-center justify-center text-8xl opacity-10">
        🖥️
      </div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="flex gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2">
          {images.map((img, index) => (
            <motion.button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                activeIndex === index
                  ? "border-[#00ff66] shadow-lg shadow-[#00ff66]/20"
                  : "border-[#1a1a1a] hover:border-[#333]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image src={img.url} alt="" fill className="object-contain p-1" sizes="64px" />
              {activeIndex === index && (
                <motion.div
                  layoutId="active-thumb"
                  className="absolute inset-0 border-2 border-[#00ff66] rounded-lg"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Main image */}
      <motion.div
        className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#1a1a1a] cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 16 }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: isZoomed ? 1.15 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Image
            key={activeIndex}
            src={images[activeIndex]!.url}
            alt={name}
            fill
            className="object-contain p-6"
            sizes="(max-width: 1024px) 90vw, 48vw"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}

// ─── SpecChip ─────────────────────────────────────────────────────────────────

function SpecChip({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  const [selected, setSelected] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      onClick={() => setSelected(!selected)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        selected
          ? "bg-[#00ff66] border-[#00ff66] text-[#0a0a0a]"
          : "bg-[#111] border-[#1a1a1a] text-zinc-300 hover:border-[#00ff66]/50"
      }`}
    >
      <span className="opacity-60">{label}: </span>
      <span className="font-bold">{value}</span>
    </motion.button>
  );
}

// ─── PulseCartButton ──────────────────────────────────────────────────────────

function PulseCartButton({ product }: { product: ProductDetailViewProps["product"] }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 20px rgba(0,255,102,0.2)",
          "0 0 35px rgba(0,255,102,0.45)",
          "0 0 20px rgba(0,255,102,0.2)",
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity }}
      className="rounded-xl overflow-hidden"
    >
      <AddToCartButton
        product={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          sku: product.sku,
          stock: product.stock,
          images: product.images,
        }}
      />
    </motion.div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const specEntries = product.specs && typeof product.specs === "object"
    ? Object.entries(product.specs as Record<string, string>)
    : [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid lg:grid-cols-2 gap-12"
    >
      {/* LEFT — Gallery */}
      <ProductGallery images={product.images} name={product.name} />

      {/* RIGHT — Info */}
      <motion.div variants={containerVariants} className="space-y-6">

        {/* Brand + SKU */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#00ff66] uppercase tracking-widest">
            {product.brand}
          </span>
          <span className="text-xs text-[#333]">·</span>
          <span className="text-xs text-[#444]">SKU: {product.sku}</span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
        >
          {product.name}
        </motion.h1>

        {/* Stars (decorative — no reviews yet) */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              >
                <Zap className="w-3.5 h-3.5 fill-[#00ff66] text-[#00ff66]" />
              </motion.div>
            ))}
          </div>
          <span className="text-xs text-[#444]">Producto verificado</span>
        </motion.div>

        {/* Price */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-baseline gap-4 flex-wrap">
            <span
              className="text-5xl font-bold text-[#00ff66]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {formatCLP(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-2xl text-zinc-500 line-through">
                {formatCLP(product.compareAtPrice)}
              </span>
            )}
          </div>
          {product.discount && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="inline-block"
            >
              <span className="px-3 py-1 bg-[#00ff66]/15 text-[#00ff66] rounded-full text-sm font-bold border border-[#00ff66]/30">
                -{product.discount}% OFF
              </span>
            </motion.div>
          )}
          <p className="text-xs text-[#444]">
            Precio con IVA incluido · 6 cuotas sin interés de{" "}
            <span className="text-white font-mono">{formatCLP(product.price / 6)}</span>
          </p>
        </motion.div>

        {/* Stock */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          {product.stock > 0 ? (
            <>
              <motion.div
                className="w-2 h-2 rounded-full bg-[#00ff66]"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm text-[#888]">
                {product.stock <= 5 ? `Solo ${product.stock} unidades disponibles` : "En stock"}
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-[#ff3333]" />
              <span className="text-sm text-[#ff3333]">Sin stock</span>
            </>
          )}
        </motion.div>

        {/* Spec chips */}
        {specEntries.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00ff66]" />
              Especificaciones
            </h3>
            <div className="flex flex-wrap gap-2">
              {specEntries.slice(0, 8).map(([k, v], i) => (
                <SpecChip key={k} label={k} value={String(v)} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Substitute warning — only for PREBUILT */}
        {product.productType === "PREBUILT" && (
          <motion.div variants={itemVariants}>
            <PrebuiltSubstituteWarning productId={product.id} variant="full" />
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <div className="flex-1">
            <PulseCartButton product={product} />
          </div>
          <WishlistButton productId={product.id} />
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3 pt-4 border-t border-[#111]"
        >
          {[
            { icon: <Truck className="w-4 h-4" />, label: "Envío a Chile", sub: "Starken · Chilexpress" },
            { icon: <CreditCard className="w-4 h-4" />, label: "Pago seguro", sub: "WebPay · MP · Flow" },
            { icon: <Shield className="w-4 h-4" />, label: "Garantía", sub: "Soporte técnico" },
          ].map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.04 }}
              className="flex flex-col items-center text-center p-3 bg-[#111] border border-[#1a1a1a] rounded-xl hover:border-[#00ff66]/30 transition-all"
            >
              <div className="text-[#00ff66] mb-1">{b.icon}</div>
              <p className="text-xs font-semibold text-white">{b.label}</p>
              <p className="text-[10px] text-[#444] mt-0.5">{b.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Category link */}
        {product.category && (
          <motion.div variants={itemVariants}>
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#444] hover:text-[#00ff66] transition-colors"
            >
              Ver más en {product.category.name} →
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
