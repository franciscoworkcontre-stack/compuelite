"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

function Stars({ rating, interactive = false, onRate }: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || rating) : rating;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          disabled={!interactive}
        >
          <svg
            className="w-4 h-4 transition-colors"
            fill={s <= display ? "#ffb800" : "none"}
            stroke={s <= display ? "#ffb800" : "#444"}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function timeAgo(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  productId: string;
}

export function ProductReviews({ productId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    authorName: "",
    authorEmail: "",
    title: "",
    body: "",
  });
  const [formError, setFormError] = useState("");

  const { data } = trpc.reviews.list.useQuery({ productId });
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setShowForm(false);
    },
    onError: (e) => setFormError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) { setFormError("Selecciona una calificación"); return; }
    if (!form.authorName || !form.authorEmail || form.body.length < 10) {
      setFormError("Completa todos los campos requeridos");
      return;
    }
    setFormError("");
    createReview.mutate({ productId, ...form });
  };

  const avgRating = data?.avgRating ?? 0;
  const count = data?.count ?? 0;

  return (
    <section className="mt-16 border-t border-[#1a1a1a] pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}>
            Reseñas
          </h2>
          {count > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={Math.round(avgRating)} />
              <span className="text-sm text-[#888]">
                {avgRating.toFixed(1)} / 5 · {count} reseña{count !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 border border-[#222] rounded text-xs text-[#555] hover:border-[#00ff66]/30 hover:text-[#00ff66] transition-all uppercase tracking-wider"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Submit success */}
      {submitted && (
        <div className="mb-6 p-4 bg-[#0d1a0d] border border-[#00ff66]/20 rounded-xl text-sm text-[#00ff66]">
          ✓ Reseña enviada. Será publicada después de moderación.
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-[#111] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-black text-[#555] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}>
            Tu reseña
          </h3>

          <div>
            <label className="block text-xs text-[#888] mb-2">Calificación *</label>
            <Stars rating={form.rating} interactive onRate={(r) => setForm((f) => ({ ...f, rating: r }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#888] mb-1.5">Nombre *</label>
              <input type="text" value={form.authorName}
                onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                placeholder="Tu nombre"
                className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1.5">Email *</label>
              <input type="email" value={form.authorEmail}
                onChange={(e) => setForm((f) => ({ ...f, authorEmail: e.target.value }))}
                placeholder="tu@email.com"
                className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5">Título</label>
            <input type="text" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Resumen de tu experiencia"
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors" />
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5">Comentario * (mín. 10 caracteres)</label>
            <textarea value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={4} placeholder="Cuéntanos tu experiencia con este producto..."
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors resize-none" />
          </div>

          {formError && <p className="text-xs text-[#ff6666]">{formError}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={createReview.isPending}
              className="px-5 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-wider rounded hover:bg-[#00cc52] transition-all disabled:opacity-50"
              style={{ fontFamily: "var(--font-display)" }}>
              {createReview.isPending ? "Enviando…" : "Enviar reseña"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#222] rounded text-xs text-[#555] hover:text-[#888] transition-all">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {!data?.reviews.length ? (
        <div className="text-center py-8 text-xs text-[#444]">
          Sé el primero en dejar una reseña.
        </div>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <div key={review.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={review.rating} />
                    {review.title && (
                      <span className="text-sm font-semibold text-white">{review.title}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#555]">
                    {review.user.name ?? "Usuario"} · {timeAgo(review.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#888] leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
