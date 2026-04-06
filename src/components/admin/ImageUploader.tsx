"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
};

export function ImageUploader({ value, onChange, folder = "uploads", label = "Imagen" }: Props) {
  const inputRef      = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);

  async function uploadFile(file: File) {
    setUploading(true); setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    try {
      const res  = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error al subir"); }
      else         { onChange(json.url); }
    } catch { setError("Error de red"); }
    finally { setUploading(false); }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-[10px] text-[#6b7280] uppercase tracking-wider">{label}</p>}

      {value ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#ffffff] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-contain p-2" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-[#16a34a] text-white text-[10px] font-black rounded uppercase tracking-wider"
            >
              Cambiar
            </button>
            <button
              onClick={() => onChange("")}
              className="p-1.5 bg-[#e5e7eb] text-[#111827] rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging ? "border-[#16a34a] bg-[#16a34a]/5" : "border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-[#f9fafb]"
          }`}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-[#252525]" />
              <p className="text-[10px] text-[#9ca3af]">Arrastra o haz clic</p>
              <p className="text-[9px] text-[#252525]">JPG · PNG · WebP · máx 5 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
      />

      {/* Manual URL fallback */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="o pega una URL de imagen…"
        className="w-full px-3 py-2 text-xs bg-[#ffffff] border border-[#e5e7eb] text-[#4b5563] rounded-lg placeholder-[#9ca3af] focus:outline-none focus:border-[#333]"
      />

      {error && <p className="text-[10px] text-[#ff4545]">{error}</p>}
    </div>
  );
}
