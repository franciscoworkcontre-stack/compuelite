"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { ComponentType, ProductStatus, ProductType } from "@prisma/client";
import { CsvUploadZone } from "./CsvUploadZone";
import { ImageUploader } from "./ImageUploader";
import { Plus, Pencil, Search, X, CheckCircle2, Cpu, HardDrive, Server, Zap, Wind, Thermometer, CircuitBoard, Package, ChevronDown } from "lucide-react";

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
        className="w-16 bg-[#f9fafb] border border-[#16a34a]/40 rounded px-2 py-1 text-xs font-mono text-[#111827] focus:outline-none"
      />
      <button onClick={() => updateStock.mutate({ productId, stock: Number(value) })} disabled={updateStock.isPending}
        className="px-2 py-1 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded text-xs text-[#16a34a] hover:bg-[#16a34a]/20">
        {updateStock.isPending ? "…" : "✓"}
      </button>
      <button onClick={onDone} className="px-2 py-1 border border-[#d1d5db] rounded text-xs text-[#6b7280]">✕</button>
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
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Buscar por nombre, SKU, marca…"
            className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#16a34a]/30" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-[#f3f4f6] animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-xs text-[#6b7280]">No hay productos{search ? ` para "${search}"` : ""}</div>
      ) : (
        <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {["Producto", "SKU", "Categoría", "Precio", "Stock", "Estado", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#9ca3af] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isActive  = product.status === ProductStatus.ACTIVE;
                const isEditing = editingStock === product.id;
                const lowStock  = product.stock <= 3;
                return (
                  <tr key={product.id} className="border-b border-[#f9fafb] hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#f9fafb] border border-[#e5e7eb] rounded overflow-hidden flex-shrink-0">
                          {product.images[0]?.url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={product.images[0].url} alt="" className="w-full h-full object-contain p-1" />
                            : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[#111827] font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-[#6b7280]">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-[#6b7280]">{product.sku}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-[#4b5563]">{product.category?.name ?? "—"}</span></td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-[#16a34a] font-bold">{formatCLP(product.price)}</span></td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <StockEditor productId={product.id} current={product.stock} onDone={() => { setEditingStock(null); refetch(); }} />
                        : (
                          <button onClick={() => setEditingStock(product.id)} className="flex items-center gap-1.5 group">
                            <span className={`font-mono text-xs font-bold ${lowStock ? "text-[#ff3333]" : "text-[#111827]"}`}>{product.stock}</span>
                            {lowStock && <span className="text-xs text-[#ff3333]/60">bajo</span>}
                            <Pencil className="w-3 h-3 text-[#9ca3af] group-hover:text-[#16a34a] transition-colors" />
                          </button>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{ color: isActive ? "#16a34a" : "#555", background: isActive ? "#16a34a18" : "#e5e7eb", border: `1px solid ${isActive ? "#16a34a33" : "#d1d5db"}` }}>
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => updateStatus.mutate({ productId: product.id, status: isActive ? ProductStatus.ARCHIVED : ProductStatus.ACTIVE })}
                        disabled={updateStatus.isPending} className="text-xs text-[#9ca3af] hover:text-[#16a34a] transition-colors disabled:opacity-40">
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

// ─── PC FORMULA BUILDER ──────────────────────────────────────────────────────

type SlotDef = {
  key: ComponentType;
  label: string;
  required: boolean;
  slotIndex?: number; // for multi-slot (fans)
  icon: React.ReactNode;
  placeholder: string;
};

const PC_SLOTS: SlotDef[] = [
  { key: ComponentType.CASE,        label: "Gabinete",           required: true,  icon: <Package className="w-3.5 h-3.5" />,      placeholder: "Lian Li, NZXT, Fractal…" },
  { key: ComponentType.MOTHERBOARD, label: "Placa Madre",        required: true,  icon: <CircuitBoard className="w-3.5 h-3.5" />, placeholder: "ASUS, MSI, Gigabyte…" },
  { key: ComponentType.CPU,         label: "Procesador",         required: true,  icon: <Cpu className="w-3.5 h-3.5" />,          placeholder: "AMD Ryzen, Intel Core…" },
  { key: ComponentType.GPU,         label: "Tarjeta de Video",   required: true,  icon: <Server className="w-3.5 h-3.5" />,       placeholder: "RTX, RX, Arc…" },
  { key: ComponentType.RAM,         label: "Memoria RAM",        required: true,  icon: <HardDrive className="w-3.5 h-3.5" />,    placeholder: "Corsair, G.Skill, Kingston…" },
  { key: ComponentType.STORAGE_SSD, label: "Almacenamiento",     required: true,  icon: <HardDrive className="w-3.5 h-3.5" />,    placeholder: "Samsung 990 Pro, WD Black…" },
  { key: ComponentType.PSU,         label: "Fuente de Poder",    required: true,  icon: <Zap className="w-3.5 h-3.5" />,          placeholder: "Corsair, EVGA, Seasonic…" },
  { key: ComponentType.CPU_COOLER,  label: "Ventilación CPU",    required: true,  icon: <Wind className="w-3.5 h-3.5" />,          placeholder: "Noctua, be quiet!, DeepCool…" },
  { key: ComponentType.CASE_FAN,    label: "Ventilación 1",      required: false, slotIndex: 0, icon: <Wind className="w-3.5 h-3.5" />, placeholder: "120mm, 140mm…" },
  { key: ComponentType.CASE_FAN,    label: "Ventilación 2",      required: false, slotIndex: 1, icon: <Wind className="w-3.5 h-3.5" />, placeholder: "120mm, 140mm…" },
  { key: ComponentType.AIO_COOLER,  label: "Ventilación Líquida",required: false, icon: <Thermometer className="w-3.5 h-3.5" />, placeholder: "240mm, 280mm, 360mm…" },
];

type SelectedProduct = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: { toNumber?: () => number } | number;
  stock: number;
  images: { url: string }[];
};

type FormulaSlot = {
  componentType: ComponentType;
  slotIndex: number;
  product: SelectedProduct | null;
};

function SlotPicker({
  slot,
  selected,
  onSelect,
  onClear,
}: {
  slot: SlotDef;
  selected: SelectedProduct | null;
  onSelect: (p: SelectedProduct) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: results = [], isFetching } = trpc.admin.searchComponents.useQuery(
    { componentType: slot.key, query },
    { enabled: open, staleTime: 10_000 }
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (selected) {
    const price = typeof selected.price === "object" && selected.price.toNumber
      ? selected.price.toNumber() : Number(selected.price);
    return (
      <div className="flex items-center gap-3 bg-[#f0fdf4] border border-[#86efac] rounded-lg px-3 py-2.5">
        {selected.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.images[0].url} alt="" className="w-8 h-8 object-contain rounded flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-[#dcfce7] rounded flex-shrink-0 flex items-center justify-center text-[#16a34a]">
            {slot.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-[#111827] truncate">{selected.name}</p>
          <p className="text-[10px] text-[#6b7280]">{selected.brand} · {formatCLP(price)} · Stock: {selected.stock}</p>
        </div>
        <button type="button" onClick={onClear} className="text-[#9ca3af] hover:text-[#ef4444] transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-[11px] text-[#9ca3af] hover:border-[#d1d5db] transition-colors"
      >
        <span className="text-[#9ca3af]">{slot.icon}</span>
        <span className="flex-1 text-left">{slot.placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#e5e7eb] rounded-xl shadow-xl">
          <div className="p-2 border-b border-[#f3f4f6]">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#f3f4f6] rounded-lg">
              <Search className="w-3.5 h-3.5 text-[#9ca3af]" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Buscar ${slot.label.toLowerCase()}…`}
                className="flex-1 bg-transparent text-[11px] text-[#111827] placeholder-[#9ca3af] focus:outline-none"
              />
              {isFetching && <div className="w-3 h-3 border border-[#9ca3af] border-t-transparent rounded-full animate-spin" />}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {results.length === 0 ? (
              <p className="text-[11px] text-[#9ca3af] text-center py-4">
                {isFetching ? "Buscando…" : "Sin resultados"}
              </p>
            ) : results.map(p => {
              const price = typeof p.price === "object" && (p.price as { toNumber?: () => number }).toNumber
                ? (p.price as { toNumber: () => number }).toNumber() : Number(p.price);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onSelect(p as SelectedProduct); setOpen(false); setQuery(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f9fafb] transition-colors text-left"
                >
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt="" className="w-8 h-8 object-contain rounded flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 bg-[#f3f4f6] rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#111827] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#6b7280]">{p.brand} · {p.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-bold text-[#111827]">{formatCLP(price)}</p>
                    <p className={`text-[10px] ${p.stock > 0 ? "text-[#16a34a]" : "text-[#ef4444]"}`}>
                      {p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type PCFormulaBuilderProps = {
  slots: FormulaSlot[];
  onChange: (slots: FormulaSlot[]) => void;
};

function PCFormulaBuilder({ slots, onChange }: PCFormulaBuilderProps) {
  function setSlot(key: ComponentType, slotIndex: number, product: SelectedProduct | null) {
    onChange(
      slots.map(s =>
        s.componentType === key && s.slotIndex === slotIndex ? { ...s, product } : s
      )
    );
  }

  const totalPrice = slots.reduce((sum, s) => {
    if (!s.product) return sum;
    const price = typeof s.product.price === "object" && s.product.price.toNumber
      ? s.product.price.toNumber() : Number(s.product.price);
    return sum + price;
  }, 0);

  const requiredFilled = PC_SLOTS.filter(s => s.required).every(s => {
    const si = s.slotIndex ?? 0;
    return slots.find(sl => sl.componentType === s.key && sl.slotIndex === si)?.product !== null;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-[#6b7280] uppercase tracking-wider">
          Fórmula PC — Componentes
        </label>
        {totalPrice > 0 && (
          <div className="flex items-center gap-1.5">
            {requiredFilled && <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />}
            <span className="text-[11px] font-black text-[#111827]">Total componentes: {formatCLP(totalPrice)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {PC_SLOTS.map(slotDef => {
          const si = slotDef.slotIndex ?? 0;
          const current = slots.find(s => s.componentType === slotDef.key && s.slotIndex === si);
          return (
            <div key={`${slotDef.key}_${si}`} className="grid grid-cols-[130px_1fr] gap-3 items-start">
              <div className="flex items-center gap-1.5 pt-2.5">
                <span className={`${slotDef.required ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>{slotDef.icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${slotDef.required ? "text-[#374151]" : "text-[#9ca3af]"}`}>
                  {slotDef.label}
                  {!slotDef.required && <span className="ml-1 text-[#d1d5db] normal-case font-normal">opt.</span>}
                </span>
              </div>
              <SlotPicker
                slot={slotDef}
                selected={current?.product ?? null}
                onSelect={p => setSlot(slotDef.key, si, p)}
                onClear={() => setSlot(slotDef.key, si, null)}
              />
            </div>
          );
        })}
      </div>

      {!requiredFilled && (
        <p className="text-[10px] text-[#f59e0b] bg-[#fffbeb] border border-[#fde68a] rounded-lg px-3 py-2">
          Faltan componentes obligatorios: Gabinete, Placa Madre, Procesador, Tarjeta de Video, RAM, Almacenamiento, Fuente y Ventilación CPU.
        </p>
      )}
    </div>
  );
}

// ─── PLATFORM SELECTOR ───────────────────────────────────────────────────────
// Plataformas obtenidas de https://multivende.com/integraciones/
// Filtradas a las relevantes para Chile (marketplaces + eCommerce activos en CL)

type Platform = {
  id: string;
  name: string;
  category: "marketplace" | "ecommerce";
  icon: string | null;      // SimpleIcons slug
  localIcon: string | null; // ruta local en /public/logos/
  color: string;
  textColor: string;
};

const PLATFORMS: Platform[] = [
  // ── Marketplaces Chile ──────────────────────────────────────────────────
  { id: "mercadolibre", name: "Mercado Libre", category: "marketplace", icon: "mercadolibre",  localIcon: null,                   color: "#FFE600", textColor: "#000000" },
  { id: "falabella",    name: "Falabella",     category: "marketplace", icon: null,             localIcon: "/logos/falabella.png", color: "#6E1E7A", textColor: "#ffffff" },
  { id: "paris",        name: "Paris",         category: "marketplace", icon: null,             localIcon: "/logos/paris.svg",     color: "#006DFF", textColor: "#ffffff" },
  { id: "ripley",       name: "Ripley",        category: "marketplace", icon: null,             localIcon: "/logos/ripley.png",    color: "#4A2D82", textColor: "#ffffff" },
  { id: "dafiti",       name: "Dafiti",        category: "marketplace", icon: null,             localIcon: "/logos/dafiti.svg",    color: "#1a1a1a", textColor: "#ffffff" },
  { id: "amazon",       name: "Amazon",        category: "marketplace", icon: "amazon",         localIcon: null,                   color: "#FF9900", textColor: "#000000" },
  { id: "tiktokshop",   name: "TikTok Shop",   category: "marketplace", icon: "tiktok",         localIcon: null,                   color: "#010101", textColor: "#ffffff" },
  { id: "walmart",      name: "Walmart",       category: "marketplace", icon: "walmart",        localIcon: null,                   color: "#0071CE", textColor: "#ffffff" },
  // ── Plataformas eCommerce ────────────────────────────────────────────────
  { id: "shopify",      name: "Shopify",       category: "ecommerce",   icon: "shopify",        localIcon: null,                   color: "#96BF48", textColor: "#ffffff" },
  { id: "woocommerce",  name: "WooCommerce",   category: "ecommerce",   icon: "woocommerce",    localIcon: null,                   color: "#7F54B3", textColor: "#ffffff" },
  { id: "jumpseller",   name: "Jumpseller",    category: "ecommerce",   icon: null,             localIcon: "/logos/jumpseller.png",color: "#00C4CC", textColor: "#ffffff" },
  { id: "prestashop",   name: "PrestaShop",    category: "ecommerce",   icon: "prestashop",     localIcon: null,                   color: "#DF0067", textColor: "#ffffff" },
  { id: "vtex",         name: "VTEX",          category: "ecommerce",   icon: "vtex",           localIcon: null,                   color: "#F71963", textColor: "#ffffff" },
  { id: "bigcommerce",  name: "BigCommerce",   category: "ecommerce",   icon: "bigcommerce",    localIcon: null,                   color: "#121118", textColor: "#ffffff" },
  { id: "mercadoshops", name: "Mercado Shops", category: "ecommerce",   icon: "mercadopago",    localIcon: null,                   color: "#009EE3", textColor: "#ffffff" },
];

function PlatformSelector({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  return (
    <div className="space-y-3">
      <label className="text-[10px] text-[#6b7280] uppercase tracking-wider flex items-center gap-2">
        Publicar en plataformas
        <span className="text-[#d1d5db] normal-case tracking-normal font-normal">· fuente: Multivende Chile</span>
      </label>

      {(["marketplace", "ecommerce"] as const).map(cat => (
        <div key={cat}>
          <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest mb-2">
            {cat === "marketplace" ? "Marketplaces" : "Plataformas eCommerce"}
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.filter(p => p.category === cat).map(p => {
              const active = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  title={p.name}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-150 ${
                    active
                      ? "shadow-sm scale-105 border-transparent"
                      : "bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db] hover:bg-[#f9fafb]"
                  }`}
                  style={active ? { backgroundColor: p.color, color: p.textColor } : {}}
                >
                  {p.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://cdn.simpleicons.org/${p.icon}/${active ? p.textColor.replace("#", "") : "9ca3af"}`}
                      alt={p.name}
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain flex-shrink-0"
                      loading="lazy"
                    />
                  ) : p.localIcon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.localIcon}
                      alt={p.name}
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain flex-shrink-0"
                    />
                  ) : null}
                  <span className="leading-none">{p.name}</span>
                  {active && <span className="leading-none opacity-60">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <p className="text-[10px] text-[#16a34a]">
          ✓ {selected.length} plataforma{selected.length !== 1 ? "s" : ""} seleccionada{selected.length !== 1 ? "s" : ""}:{" "}
          {selected.map(id => PLATFORMS.find(p => p.id === id)?.name).filter(Boolean).join(", ")}
        </p>
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
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // PC Formula state — one slot per PC_SLOTS entry
  const [formulaSlots, setFormulaSlots] = useState<FormulaSlot[]>(() =>
    PC_SLOTS.map(s => ({ componentType: s.key, slotIndex: s.slotIndex ?? 0, product: null }))
  );

  const createPrebuilt = trpc.admin.createPrebuilt.useMutation();

  const isPrebuilt = form.productType === "PREBUILT";

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.sku || !form.name || !form.brand || !form.price || !form.categoryId) {
      setError("SKU, nombre, marca, precio y categoría son obligatorios"); return;
    }

    if (isPrebuilt) {
      // Validate required formula slots
      const missingRequired = PC_SLOTS.filter(s => s.required).filter(s => {
        const si = s.slotIndex ?? 0;
        return !formulaSlots.find(fl => fl.componentType === s.key && fl.slotIndex === si)?.product;
      });
      if (missingRequired.length > 0) {
        setError(`Faltan componentes obligatorios: ${missingRequired.map(s => s.label).join(", ")}`);
        return;
      }

      setSaving(true); setError(null);
      try {
        await createPrebuilt.mutateAsync({
          sku: form.sku,
          name: form.name,
          brand: form.brand,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          stock: parseInt(form.stock, 10),
          categoryId: form.categoryId,
          description: form.description,
          imageUrl: form.imageUrl,
          components: formulaSlots
            .filter(s => s.product !== null)
            .map(s => ({ productId: s.product!.id, componentType: s.componentType, slotIndex: s.slotIndex })),
        });
        setSaved(true);
        setForm({ sku: "", name: "", brand: "", price: "", compareAtPrice: "", stock: "0", categoryId: "", productType: "STANDALONE", description: "", imageUrl: "", status: "ACTIVE" });
        setFormulaSlots(PC_SLOTS.map(s => ({ componentType: s.key, slotIndex: s.slotIndex ?? 0, product: null })));
        setPlatforms([]);
        setTimeout(() => setSaved(false), 3000);
        utils.admin.products.invalidate();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al crear PC armado");
      } finally { setSaving(false); }
      return;
    }

    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/csv/products", {
        method: "POST",
        body: (() => {
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
        setPlatforms([]);
        setTimeout(() => setSaved(false), 3000);
        utils.admin.products.invalidate();
      }
    } catch { setError("Error de red"); }
    finally { setSaving(false); }
  }

  const field = (label: string, key: keyof typeof form, props?: object) => (
    <div>
      <label className="text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">{label}</label>
      <input value={form[key]} onChange={e => set(key)(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-[#f3f4f6] border border-[#e5e7eb] text-[#111827] rounded-lg focus:outline-none focus:border-[#16a34a]/40 placeholder-[#9ca3af]"
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
          <label className="text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">Categoría *</label>
          <select value={form.categoryId} onChange={e => set("categoryId")(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#f3f4f6] border border-[#e5e7eb] text-[#111827] rounded-lg focus:outline-none focus:border-[#16a34a]/40">
            <option value="">Selecciona…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">Tipo de producto</label>
        <select value={form.productType} onChange={e => set("productType")(e.target.value as ProductType)}
          className="w-full px-3 py-2 text-sm bg-[#f3f4f6] border border-[#e5e7eb] text-[#111827] rounded-lg focus:outline-none focus:border-[#16a34a]/40">
          {Object.values(ProductType).map(t => (
            <option key={t} value={t}>
              {t === "STANDALONE" ? "Standalone — producto individual" :
               t === "COMPONENT" ? "Componente — parte de un PC" :
               t === "PREBUILT" ? "PC Armado — fórmula con componentes" :
               t === "PERIPHERAL" ? "Periférico" :
               t === "ACCESSORY" ? "Accesorio" : t}
            </option>
          ))}
        </select>
      </div>

      {isPrebuilt && (
        <div className="border border-[#e5e7eb] rounded-xl p-4 bg-[#fafafa]">
          <PCFormulaBuilder slots={formulaSlots} onChange={setFormulaSlots} />
        </div>
      )}

      <div>
        <label className="text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">Descripción</label>
        <textarea value={form.description} onChange={e => set("description")(e.target.value)} rows={3}
          className="w-full px-3 py-2 text-sm bg-[#f3f4f6] border border-[#e5e7eb] text-[#111827] rounded-lg focus:outline-none focus:border-[#16a34a]/40 resize-none" />
      </div>

      <ImageUploader
        value={form.imageUrl}
        onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
        folder="products"
        label="Imagen principal"
      />

      <div className="border-t border-[#f3f4f6] pt-5">
        <PlatformSelector selected={platforms} onChange={setPlatforms} />
      </div>

      {error && <p className="text-[11px] text-[#ff4545] border border-[#ff4545]/20 bg-[#ff4545]/5 px-3 py-2 rounded-lg">{error}</p>}

      <button onClick={handleSubmit} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-[#16a34a] text-white text-xs font-black uppercase tracking-widest rounded-lg disabled:opacity-40 hover:bg-[#15803d] transition-colors"
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
        <h1 className="text-lg font-black text-[#111827] uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>Productos</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">Gestiona catálogo, stock e importaciones masivas</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e7eb]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === t.id ? "text-[#16a34a] border-[#16a34a]" : "text-[#9ca3af] border-transparent hover:text-[#4b5563]"}`}
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
