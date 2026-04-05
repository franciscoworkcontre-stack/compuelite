import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Glitchy 404 */}
        <div className="relative mb-6">
          <p
            className="text-8xl font-black text-[#00ff66] select-none"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 40px rgba(0,255,102,0.4), 2px 2px 0 #004422, -2px -2px 0 #002211",
            }}
          >
            404
          </p>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,102,0.05) 2px, rgba(0,255,102,0.05) 4px)",
            }}
          />
        </div>

        <h1 className="text-xl font-black text-white uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-display)" }}>
          Página no encontrada
        </h1>
        <p className="text-sm text-[#555] mb-8">
          La página que buscas no existe o fue movida.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded hover:bg-[#00cc52] transition-all"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Inicio
          </Link>
          <Link
            href="/productos"
            className="px-5 py-2.5 border border-[#333] text-[#888] text-sm uppercase tracking-wider rounded hover:border-[#555] hover:text-white transition-all"
          >
            Productos
          </Link>
        </div>
      </div>
    </div>
  );
}
