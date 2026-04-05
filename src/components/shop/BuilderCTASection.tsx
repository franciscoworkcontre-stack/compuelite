import Link from "next/link";

const builderSteps = [
  { step: "01", label: "Elige Gabinete", desc: "Define el tamaño y diseño" },
  { step: "02", label: "Placa Madre", desc: "Socket y slots disponibles" },
  { step: "03", label: "CPU + RAM", desc: "Potencia para tus juegos" },
  { step: "04", label: "GPU", desc: "El corazón gráfico" },
  { step: "05", label: "Almacenamiento", desc: "NVMe de alta velocidad" },
  { step: "06", label: "Checkout", desc: "Envío a todo Chile" },
];

export function BuilderCTASection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d0d0d] border-y border-[#1a1a1a]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p className="text-xs font-medium text-[#00ff66] uppercase tracking-widest mb-3">
              Función exclusiva
            </p>
            <h2
              className="text-4xl sm:text-5xl font-black uppercase text-white leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PC Builder{" "}
              <span className="text-[#00ff66]">3D</span>
              <br />
              Interactivo
            </h2>
            <p className="text-[#888] text-lg mb-8 leading-relaxed">
              El único configurador de PC en 3D de Chile. Selecciona componentes,
              verifica compatibilidad en tiempo real y visualiza tu build antes de comprar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/builder"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00ff66] text-black font-black text-sm uppercase tracking-widest rounded hover:bg-[#00cc52] transition-all"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Abrir Builder
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/builds"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#2a4a2a] text-[#888] text-sm font-medium uppercase tracking-wider rounded hover:border-[#00ff66] hover:text-[#00ff66] transition-all"
              >
                Ver builds populares
              </Link>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {builderSteps.map((item, i) => (
              <div
                key={item.step}
                className="p-4 bg-[#0a0a0a] border border-[#222] rounded-lg hover:border-[#00ff66]/40 transition-all group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="text-xs font-black text-[#00ff66]/40 group-hover:text-[#00ff66] transition-colors mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.step}
                </div>
                <div className="text-sm font-semibold text-white leading-tight mb-1">
                  {item.label}
                </div>
                <div className="text-xs text-[#555]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
