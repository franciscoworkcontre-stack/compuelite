"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ProductStatus, ProductType } from "@prisma/client";
import { CsvUploadZone } from "./CsvUploadZone";
import { ImageUploader } from "./ImageUploader";
import { Plus, Pencil } from "lucide-react";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(val);
}

// ─── INLINE STOCK EDITOR ────────────────────────────────────────────────────

function StockEditor({ productId, current, onDone }: { productId: string; current: number; onDone: () => void }) {
  const [value, setValue] = useState(String(current));
  const updateStock = trpc.admin.updateStock.useMutation({ onSuccess: onDone });
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number" min={0} value={value} onChange={e => setValue(e.target.value)} autoFocus
        onKeyDown={e => { if (e.key === "Enter") updateStock.mutate({ productId, stock: Number(value) }); if (e.key === "Escape") onDone(); }}
        className="w-16 bg-[#0d0d0d] border border-[#00ff66]/40 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none"
      />
      <button onClick={() => updateStock.mutate({ productId, stock: Number(value) })} disabled={updateStock.isPending}
        className="px-2 py-1 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded text-xs text-[#00ff66] hover:bg-[#00ff66]/20">
        {updateStock.isPending ? "…" : "✓"}
      </button>
      <button onClick={onDone} className="px-2 py-1 border border-[#222] rounded text-xs text-[#555]">✕</button>
    </div>
  );
}

// ─── PRODUCT TABLE ───────────────────────────────────────────────────────────

function ProductTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingStock, setEditingStock] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.admin.products.useQuery({ search: debouncedSearch || undefined, limit: 50 });
  const updateStatus = trpc.admin.updateProductStatus.useMutation({ onSuccess: () => refetch() });

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as Window & { _st?: ReturnType<typeof setTimeout> })._st);
    (window as Window & { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => setDebouncedSearch(v), 350);
  };

  const products = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Buscar por nombre, SKU, marca…"
            className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/30" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-[#111] animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-xs text-[#555]">No hay productos{search ? ` para "${search}"` : ""}</div>
      ) : (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Producto", "SKU", "Categoría", "Precio", "Stock", "Estado", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#444] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isActive  = product.status === ProductStatus.ACTIVE;
                const isEditing = editingStock === product.id;
                const lowStock  = product.stock <= 3;
                return (
                  <tr key={product.id} className="border-b border-[#0d0d0d] hover:bg-[#0d0d0d] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded overflow-hidden flex-shrink-0">
                          {product.images[0]?.url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={product.images[0].url} alt="" className="w-full h-full object-contain p-1" />
                            : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-[#555]">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-[#555]">{product.sku}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-[#666]">{product.category?.name ?? "—"}</span></td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-[#00ff66] font-bold">{formatCLP(product.price)}</span></td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <StockEditor productId={product.id} current={product.stock} onDone={() => { setEditingStock(null); refetch(); }} />
                        : (
                          <button onClick={() => setEditingStock(product.id)} className="flex items-center gap-1.5 group">
                            <span className={`font-mono text-xs font-bold ${lowStock ? "text-[#ff3333]" : "text-white"}`}>{product.stock}</span>
                            {lowStock && <span className="text-xs text-[#ff3333]/60">bajo</span>}
                            <Pencil className="w-3 h-3 text-[#333] group-hover:text-[#00ff66] transition-colors" />
                          </button>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{ color: isActive ? "#00ff66" : "#555", background: isActive ? "#00ff6618" : "#1a1a1a", border: `1px solid ${isActive ? "#00ff6633" : "#222"}` }}>
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => updateStatus.mutate({ productId: product.id, status: isActive ? ProductStatus.ARCHIVED : ProductStatus.ACTIVE })}
                        disabled={updateStatus.isPending} className="text-xs text-[#444] hover:text-[#00ff66] transition-colors disabled:opacity-40">
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

// ─── CREATE PRODUCT FORM ─────────────────────────────────────────────────────

function CreateProductForm() {
  const utils = trpc.useUtils();
  const { data: categories = [] } = trpc.products.categories.useQuery();

  const [form, setForm] = useState({
    sku: "", name: "", brand: "", price: "", compareAtPrice: "",
    stock: "0", categoryId: "", productType: "STANDALONE" as ProductType,
    description: "", imageUrl: "", status: "ACTIVE" as ProductStatus,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.sku || !form.name || !form.brand || !form.price || !form.categoryId) {
      setError("SKU, nombre, marca, precio y categoría son obligatorios"); return;
    }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/csv/products", {
        method: "POST",
        body: (() => {
          // Reuse the CSV API with a single-row CSV
          const headers = "sku,name,brand,price,compare_price,stock,category_slug,product_type,description,image_url";
          const catSlug = categories.find(c => c.id === form.categoryId)?.slug ?? "";
          const row = [form.sku, `"${form.name}"`, `"${form.brand}"`, form.price, form.compareAtPrice,
            form.stock, catSlug, form.productType, `"${form.description}"`, form.imageUrl].join(",");
          const csv = `${headers}\n${row}`;
          const fd = new FormData();
          fd.append("file", new Blob([csv], { type: "text/csv" }), "create.csv");
          return fd;
        })(),
      });
      const json = await res.json();
      if (!res.ok || json.errorRows > 0) {
        setError(json.results?.find((r: { status: string; message?: string }) => r.status === "error")?.message ?? json.error ?? "Error al crear producto");
      } else {
        setSaved(true);
        setForm({ sku: "", name: "", brand: "", price: "", compareAtPrice: "", stock: "0", categoryId: "", productType: "STANDALONE", description: "", imageUrl: "", status: "ACTIVE" });
        setTimeout(() => setSaved(false), 3000);
        utils.admin.products.invalidate();
      }
    } catch { setError("Error de red"); }
    finally { setSaving(false); }
  }

  const field = (label: string, key: keyof typeof form, props?: object) => (
    <div>
      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">{label}</label>
      <input value={form[key]} onChange={e => set(key)(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-[#111] border border-[#1a1a1a] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/40 placeholder-[#333]"
        {...props} />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {field("SKU *", "sku", { placeholder: "GPU-RTX4090-24G" })}
        {field("Marca *", "brand", { placeholder: "NVIDIA" })}
      </div>

      {field("Nombre del producto *", "name", { placeholder: "NVIDIA GeForce RTX 4090 24GB" })}

      <div className="grid grid-cols-2 gap-4">
        {field("Precio (CLP) *", "price", { type: "number", placeholder: "2899990" })}
        {field("Precio original (para descuento)", "compareAtPrice", { type: "number", placeholder: "3200000" })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field("Stock inicial", "stock", { type: "number", min: "0", placeholder: "0" })}
        <div>
          <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Categoría *</label>
          <select value={form.categoryId} onChange={e => set("categoryId")(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#111] border border-[#1a1a1a] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/40">
            <option value="">Selecciona…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Tipo de producto</label>
        <select value={form.productType} onChange={e => set("productType")(e.target.value as ProductType)}
          className="w-full px-3 py-2 text-sm bg-[#111] border border-[#1a1a1a] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/40">
          {Object.values(ProductType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Descripción</label>
        <textarea value={form.description} onChange={e => set("description")(e.target.value)} rows={3}
          className="w-full px-3 py-2 text-sm bg-[#111] border border-[#1a1a1a] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/40 resize-none" />
      </div>

      <ImageUploader
        value={form.imageUrl}
        onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
        folder="products"
        label="Imagen principal"
      />

      {error && <p className="text-[11px] text-[#ff4545] border border-[#ff4545]/20 bg-[#ff4545]/5 px-3 py-2 rounded-lg">{error}</p>}

      <button onClick={handleSubmit} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-[#00ff66] text-black text-xs font-black uppercase tracking-widest rounded-lg disabled:opacity-40 hover:bg-[#00e85c] transition-colors"
        style={{ fontFamily: "var(--font-display)" }}>
        <Plus className="w-4 h-4" />
        {saving ? "Creando…" : saved ? "✓ Creado" : "Crear producto"}
      </button>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

type Tab = "lista" | "stock_csv" | "productos_csv" | "crear";

export function AdminProducts() {
  const [tab, setTab] = useState<Tab>("lista");

  const TABS: { id: Tab; label: string }[] = [
    { id: "lista",        label: "Lista"           },
    { id: "crear",        label: "Crear producto"  },
    { id: "stock_csv",    label: "Actualizar stock" },
    { id: "productos_csv",label: "Importar CSV"    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-lg font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>Productos</h1>
        <p className="text-xs text-[#444] mt-0.5">Gestiona catálogo, stock e importaciones masivas</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a1a1a]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === t.id ? "text-[#00ff66] border-[#00ff66]" : "text-[#444] border-transparent hover:text-[#666]"}`}
            style={{ fontFamily: "var(--font-display)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lista" && <ProductTable />}

      {tab === "crear" && <CreateProductForm />}

      {tab === "stock_csv" && (
        <CsvUploadZone
          endpoint="/api/admin/csv/stock"
          title="Actualización masiva de stock"
          description="Sube un CSV con SKU y cantidad. El stock se actualizará y quedará registrado en el historial de movimientos."
          templateFilename="template-stock.csv"
          templateHeaders={["sku", "stock", "notas"]}
          templateExample={["GPU-RTX4090-24G", "15", "Reposición desde proveedor"]}
          helpRows={[
            { label: "sku",   desc: "El SKU exacto del producto tal como está en el sistema (distingue mayúsculas)." },
            { label: "stock", desc: "El nuevo stock total — no la diferencia. Si tienes 5 y recibes 10, escribe 15." },
            { label: "notas", desc: "Opcional. Se guarda en el historial de movimientos para trazabilidad." },
          ]}
        />
      )}

      {tab === "productos_csv" && (
        <CsvUploadZone
          endpoint="/api/admin/csv/products"
          title="Importación masiva de productos"
          description="Crea múltiples productos de una vez. Los SKUs existentes se omiten sin error."
          templateFilename="template-productos.csv"
          templateHeaders={["sku","name","brand","price","compare_price","stock","category_slug","product_type","description","image_url"]}
          templateExample={["GPU-RTX4090","RTX 4090 24GB","NVIDIA","2899990","3200000","5","componentes","COMPONENT","GPU de alto rendimiento","https://example.com/img.jpg"]}
          helpRows={[
            { label: "sku",           desc: "Identificador único. Si ya existe, la fila se omite." },
            { label: "category_slug", desc: "El slug de la categoría, ej: componentes, monitores, teclados." },
            { label: "product_type",  desc: "STANDALONE, COMPONENT, PREBUILT, PERIPHERAL o ACCESSORY." },
            { label: "compare_price", desc: "Opcional. Precio tachado (precio original antes del descuento)." },
            { label: "image_url",     desc: "Opcional. URL pública de la imagen principal del producto." },
          ]}
        />
      )}
    </div>
  );
}
