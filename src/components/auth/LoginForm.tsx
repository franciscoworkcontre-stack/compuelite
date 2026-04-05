"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/cuenta";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email o contraseña incorrectos.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2"
          style={{ fontFamily: "var(--font-display)" }}>
          Iniciar sesión
        </h1>
        <p className="text-xs text-[#555]">Accede a tu cuenta para ver tus pedidos</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs text-[#888] uppercase tracking-wider mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            placeholder="tu@email.com"
            className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[#888] uppercase tracking-wider mb-1.5">Contraseña</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            placeholder="••••••••"
            className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#00ff66]/40 transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-[#ff6666] bg-[#ff3333]/10 border border-[#ff3333]/20 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] transition-all disabled:opacity-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {loading ? "Iniciando…" : "Entrar"}
        </button>

        <p className="text-center text-xs text-[#555]">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-[#00ff66] hover:underline">
            Crear cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
