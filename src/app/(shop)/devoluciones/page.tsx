"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ReturnReason, ReturnStatus } from "@prisma/client";

const REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: "Producto defectuoso",
  WRONG_ITEM: "Recibí un producto equivocado",
  NOT_AS_DESCRIBED: "No coincide con la descripción",
  CHANGED_MIND: "Cambié de opinión",
  OTHER: "Otro motivo",
};

const STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: "En revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  ITEMS_RECEIVED: "Items recibidos",
  REFUND_ISSUED: "Reembolso emitido",
};

function DevolucionesContent() {
  const searchParams = useSearchParams();
  const prefilledOrderId = searchParams.get("pedido") ?? "";

  const utils = trpc.useUtils();
  const { data: myReturns } = trpc.returns.myReturns.useQuery();
  const request = trpc.returns.request.useMutation({
    onSuccess: () => { utils.returns.myReturns.invalidate(); setForm({ orderId: "", reason: "DEFECTIVE" as ReturnReason, description: "", items: [{ orderItemId: "", quantity: 1, reason: "" }] }); },
  });

  const [form, setForm] = useState({
    orderId: prefilledOrderId,
    reason: "DEFECTIVE" as ReturnReason,
    description: "",
    items: [{ orderItemId: "", quantity: 1, reason: "" }],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    request.mutate({
      orderId: form.orderId,
      reason: form.reason,
      description: form.description || undefined,
      items: form.items.filter((i) => i.orderItemId).map((i) => ({ orderItemId: i.orderItemId, quantity: i.quantity, reason: i.reason || undefined })),
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide mb-2">Devoluciones</h1>
        <p className="text-xs text-[#555] mb-8">Solo pedidos entregados pueden ser devueltos dentro del plazo legal.</p>

        {/* Request form */}
        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-sm font-bold text-[#00ff66] uppercase tracking-wider">Nueva solicitud</h2>
          <div>
            <label className="block text-xs text-[#888] mb-1">ID del pedido *</label>
            <input value={form.orderId} onChange={(e) => setForm((p) => ({ ...p, orderId: e.target.value }))} required className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" placeholder="cmnlcXXXX..." />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-1">Motivo *</label>
            <select value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value as ReturnReason }))} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white">
              {Object.entries(REASON_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-1">Descripción adicional</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white resize-none" placeholder="Describe el problema con más detalle..." />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-1">ID del item del pedido *</label>
            <input value={form.items[0].orderItemId} onChange={(e) => setForm((p) => ({ ...p, items: [{ ...p.items[0], orderItemId: e.target.value }] }))} required className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" placeholder="ID del producto a devolver" />
          </div>
          {request.error && <p className="text-xs text-[#ff6666]">{request.error.message}</p>}
          {request.isSuccess && <p className="text-xs text-[#00ff66]">Solicitud enviada. Te contactaremos pronto.</p>}
          <button type="submit" disabled={request.isPending} className="w-full py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] disabled:opacity-40 transition-colors">
            {request.isPending ? "Enviando..." : "Solicitar devolución"}
          </button>
        </form>

        {/* My returns history */}
        {myReturns && myReturns.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Mis solicitudes</h2>
            <div className="space-y-3">
              {myReturns.map((ret) => (
                <div key={ret.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#555]">#{ret.id.slice(-8)} · {new Date(ret.createdAt).toLocaleDateString("es-CL")}</p>
                      <p className="text-sm text-white mt-0.5">{REASON_LABELS[ret.reason]}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-[#1a1a1a] rounded text-[#888]">{STATUS_LABELS[ret.status]}</span>
                  </div>
                  {ret.adminNotes && <p className="text-xs text-[#ff6666] mt-2">Admin: {ret.adminNotes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DevolucionesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen pt-24 pb-16"><div className="max-w-2xl mx-auto px-4"><p className="text-[#555] text-sm">Cargando...</p></div></main>}>
      <DevolucionesContent />
    </Suspense>
  );
}
