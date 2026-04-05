"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ReturnStatus, ReturnReason } from "@prisma/client";

const STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: "Solicitada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  ITEMS_RECEIVED: "Items recibidos",
  REFUND_ISSUED: "Reembolso emitido",
};

const REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: "Defectuoso",
  WRONG_ITEM: "Producto equivocado",
  NOT_AS_DESCRIBED: "No coincide descripción",
  CHANGED_MIND: "Cambio de opinión",
  OTHER: "Otro",
};

const STATUS_COLORS: Record<ReturnStatus, string> = {
  REQUESTED: "text-[#f5a623] border-[#f5a623]/30 bg-[#1a1200]",
  APPROVED: "text-[#00ff66] border-[#00ff66]/30 bg-[#001a08]",
  REJECTED: "text-[#ff4444] border-[#ff4444]/30 bg-[#1a0000]",
  ITEMS_RECEIVED: "text-[#6366f1] border-[#6366f1]/30 bg-[#0a0a1a]",
  REFUND_ISSUED: "text-[#aaa] border-[#444] bg-[#111]",
};

export function AdminReturns() {
  const utils = trpc.useUtils();
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | undefined>(undefined);
  const [approveModal, setApproveModal] = useState<{ id: string; amount: number } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; notes: string } | null>(null);

  const { data: returns, isLoading } = trpc.returns.adminList.useQuery({ status: filterStatus });
  const approve = trpc.returns.approve.useMutation({ onSuccess: () => { utils.returns.adminList.invalidate(); setApproveModal(null); } });
  const reject = trpc.returns.reject.useMutation({ onSuccess: () => { utils.returns.adminList.invalidate(); setRejectModal(null); } });
  const issueRefund = trpc.returns.issueRefund.useMutation({ onSuccess: () => utils.returns.adminList.invalidate() });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wide">Devoluciones</h1>
          <p className="text-xs text-[#555] mt-1">Solicitudes de devolución de clientes</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setFilterStatus(undefined)} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${!filterStatus ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20" : "bg-[#111] text-[#555] hover:text-[#888]"}`}>
            Todas
          </button>
          {(["REQUESTED", "APPROVED", "REFUND_ISSUED"] as ReturnStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filterStatus === s ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20" : "bg-[#111] text-[#555] hover:text-[#888]"}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 w-80">
            <h3 className="text-sm font-bold text-white mb-4">Aprobar devolución</h3>
            <label className="block text-xs text-[#888] mb-1">Monto a reembolsar (CLP)</label>
            <input type="number" value={approveModal.amount} onChange={(e) => setApproveModal((p) => p && { ...p, amount: Number(e.target.value) })} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white mb-4" />
            <div className="flex gap-2">
              <button onClick={() => approve.mutate({ returnId: approveModal.id, refundAmount: approveModal.amount })} disabled={approve.isPending} className="flex-1 py-2 bg-[#00ff66] text-black text-xs font-black rounded-lg disabled:opacity-40">
                Aprobar
              </button>
              <button onClick={() => setApproveModal(null)} className="flex-1 py-2 bg-[#1a1a1a] text-[#888] text-xs font-bold rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 w-80">
            <h3 className="text-sm font-bold text-white mb-4">Rechazar devolución</h3>
            <label className="block text-xs text-[#888] mb-1">Motivo del rechazo</label>
            <textarea value={rejectModal.notes} onChange={(e) => setRejectModal((p) => p && { ...p, notes: e.target.value })} rows={3} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white mb-4 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => reject.mutate({ returnId: rejectModal.id, adminNotes: rejectModal.notes })} disabled={reject.isPending} className="flex-1 py-2 bg-[#ff4444] text-white text-xs font-black rounded-lg disabled:opacity-40">
                Rechazar
              </button>
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2 bg-[#1a1a1a] text-[#888] text-xs font-bold rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-[#555] text-sm">Cargando...</p>
      ) : !returns?.length ? (
        <div className="text-center py-16 text-[#444]">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-sm">No hay solicitudes de devolución{filterStatus ? ` con estado "${STATUS_LABELS[filterStatus]}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => (
            <div key={ret.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[ret.status]}`}>
                      {STATUS_LABELS[ret.status]}
                    </span>
                    <span className="text-xs text-[#555]">#{ret.id.slice(-8)}</span>
                    <span className="text-xs text-[#555]">· {new Date(ret.createdAt).toLocaleDateString("es-CL")}</span>
                  </div>
                  <p className="text-sm text-white font-medium mb-0.5">Pedido: {ret.orderId.slice(-12)}</p>
                  <p className="text-xs text-[#666]">
                    {REASON_LABELS[ret.reason]}{ret.description ? ` — ${ret.description}` : ""}
                  </p>
                  {ret.refundAmount && (
                    <p className="text-xs text-[#00ff66] mt-1 font-mono">
                      Reembolso: ${Number(ret.refundAmount).toLocaleString("es-CL")}
                    </p>
                  )}
                  {ret.adminNotes && (
                    <p className="text-xs text-[#ff6666] mt-1">Admin: {ret.adminNotes}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {ret.status === ReturnStatus.REQUESTED && (
                    <>
                      <button onClick={() => setApproveModal({ id: ret.id, amount: 0 })} className="px-3 py-1.5 text-xs text-[#00ff66] bg-[#001a08] border border-[#00ff66]/20 rounded hover:border-[#00ff66]/40 transition-colors">
                        Aprobar
                      </button>
                      <button onClick={() => setRejectModal({ id: ret.id, notes: "" })} className="px-3 py-1.5 text-xs text-[#ff4444] bg-[#1a0000] rounded hover:bg-[#2a0000] transition-colors">
                        Rechazar
                      </button>
                    </>
                  )}
                  {ret.status === ReturnStatus.APPROVED && (
                    <button onClick={() => issueRefund.mutate({ returnId: ret.id })} disabled={issueRefund.isPending} className="px-3 py-1.5 text-xs text-white bg-[#1a1a1a] rounded hover:bg-[#222] disabled:opacity-40 transition-colors">
                      Emitir reembolso
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
