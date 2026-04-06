"use client";

import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from "lucide-react";

type RowResult = { sku: string; status: string; message?: string; old?: number; new?: number };

type ImportResult = {
  totalRows: number;
  successRows: number;
  errorRows?: number;
  skipRows?: number;
  results: RowResult[];
};

type Props = {
  endpoint: string;         // e.g. "/api/admin/csv/stock"
  templateHeaders: string[];
  templateExample: string[];
  templateFilename: string;
  title: string;
  description: string;
  helpRows?: { label: string; desc: string }[];
};

function downloadTemplate(headers: string[], example: string[], filename: string) {
  const csv = [headers.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function CsvUploadZone({ endpoint, templateHeaders, templateExample, templateFilename, title, description, helpRows }: Props) {
  const inputRef      = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<ImportResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [expanded, setExpanded]   = useState(false);

  async function upload(file: File) {
    if (!file.name.endsWith(".csv")) { setServerError("El archivo debe ser .csv"); return; }
    setLoading(true); setResult(null); setServerError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch(endpoint, { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "Error desconocido"); }
      else         { setResult(json); }
    } catch { setServerError("Error de red"); }
    finally { setLoading(false); }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  const hasErrors = (result?.errorRows ?? 0) > 0 || (result?.skipRows ?? 0) > 0;

  return (
    <div className="space-y-4">
      {/* Header + template */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-[11px] text-[#444] mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => downloadTemplate(templateHeaders, templateExample, templateFilename)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-[#00ff66] border border-[#00ff66]/25 bg-[#00ff66]/5 hover:bg-[#00ff66]/10 rounded transition-all uppercase tracking-wider"
        >
          <Download className="w-3 h-3" /> Template CSV
        </button>
      </div>

      {/* Help rows */}
      {helpRows && helpRows.length > 0 && (
        <div className="rounded-lg border border-[#111] bg-[#080808] overflow-hidden">
          <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-3 py-2 text-[10px] text-[#444] hover:text-[#666] transition-colors">
            <span className="uppercase tracking-wider">¿Cómo llenar el CSV?</span>
            <span>{expanded ? "−" : "+"}</span>
          </button>
          {expanded && (
            <div className="px-3 pb-3 space-y-1.5 border-t border-[#111]">
              {helpRows.map(r => (
                <div key={r.label} className="flex gap-2 pt-1.5">
                  <code className="text-[9px] font-mono text-[#00ff66] bg-[#00ff66]/5 px-1.5 py-0.5 rounded flex-shrink-0">{r.label}</code>
                  <p className="text-[10px] text-[#555] leading-snug">{r.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          dragging
            ? "border-[#00ff66] bg-[#00ff66]/5"
            : "border-[#1a1a1a] hover:border-[#252525] hover:bg-[#0d0d0d]"
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#00ff66] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#444]">Procesando…</p>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#1a1a1a] bg-[#111]">
              <Upload className="w-5 h-5 text-[#333]" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#666]">Arrastra tu CSV aquí</p>
              <p className="text-[10px] text-[#333] mt-0.5">o haz clic para buscar</p>
            </div>
          </>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#ff4545]/20 bg-[#ff4545]/5 text-[11px] text-[#ff4545]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {serverError}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Summary */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${hasErrors ? "border-[#ffb800]/20 bg-[#ffb800]/5" : "border-[#00ff66]/20 bg-[#00ff66]/5"}`}>
            {hasErrors
              ? <AlertCircle className="w-4 h-4 text-[#ffb800] flex-shrink-0" />
              : <CheckCircle className="w-4 h-4 text-[#00ff66] flex-shrink-0" />}
            <div className="text-xs">
              <span className="font-bold text-white">{result.successRows} de {result.totalRows}</span>
              <span className="text-[#555]"> filas importadas correctamente</span>
              {(result.skipRows ?? 0) > 0 && <span className="text-[#ffb800]"> · {result.skipRows} omitidas</span>}
              {(result.errorRows ?? 0) > 0 && <span className="text-[#ff4545]"> · {result.errorRows} errores</span>}
            </div>
          </div>

          {/* Error/skip rows */}
          {result.results.filter(r => r.status !== "ok").length > 0 && (
            <div className="rounded-lg border border-[#1a1a1a] overflow-hidden">
              <p className="px-3 py-2 text-[9px] text-[#333] uppercase tracking-wider border-b border-[#1a1a1a]">Detalle de errores</p>
              <div className="max-h-48 overflow-y-auto divide-y divide-[#0d0d0d]">
                {result.results.filter(r => r.status !== "ok").map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2">
                    <FileText className="w-3 h-3 text-[#333] flex-shrink-0" />
                    <code className="text-[10px] font-mono text-[#555] flex-shrink-0">{r.sku}</code>
                    <span className={`text-[10px] flex-1 ${r.status === "skip" ? "text-[#ffb800]" : "text-[#ff4545]"}`}>{r.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setResult(null)} className="text-[10px] text-[#333] hover:text-[#555] flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Limpiar resultado
          </button>
        </div>
      )}
    </div>
  );
}
