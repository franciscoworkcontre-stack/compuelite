"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const register = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      router.push("/cuenta");
      router.refresh();
    },
    onError: (e) => setErrors({ api: e.message }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Requerido";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirm) e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    register.mutate({ name: form.name, email: form.email, password: form.password });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2"
          style={{ fontFamily: "var(--font-display)" }}>
          Crear cuenta
        </h1>
        <p className="text-xs text-[#555]">Guarda tus pedidos y compra más rápido</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        {[
          { key: "name" as const, label: "Nombre completo", type: "text", placeholder: "Juan Pérez" },
          { key: "email" as const, label: "Email", type: "email", placeholder: "tu@email.com" },
          { key: "password" as const, label: "Contraseña", type: "password", placeholder: "Mínimo 6 caracteres" },
          { key: "confirm" as const, label: "Confirmar contraseña", type: "password", placeholder: "••••••••" },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-[#888] uppercase tracking-wider mb-1.5">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={set(key)}
              placeholder={placeholder}
              className={`w-full bg-[#0d0d0d] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none transition-colors ${
                errors[key] ? "border-[#ff3333]/60" : "border-[#222] focus:border-[#00ff66]/40"
              }`}
            />
            {errors[key] && <p className="mt-1 text-xs text-[#ff6666]">{errors[key]}</p>}
          </div>
        ))}

        {errors.api && (
          <p className="text-xs text-[#ff6666] bg-[#ff3333]/10 border border-[#ff3333]/20 rounded px-3 py-2">
            {errors.api}
          </p>
        )}

        <button
          type="submit"
          disabled={register.isPending}
          className="w-full py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] transition-all disabled:opacity-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {register.isPending ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="text-center text-xs text-[#555]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#00ff66] hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
