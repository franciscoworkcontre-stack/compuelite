import Link from "next/link";

const footerLinks = {
  Tienda: [
    { href: "/productos", label: "Todos los productos" },
    { href: "/productos/gpu", label: "Tarjetas de Video" },
    { href: "/productos/cpu", label: "Procesadores" },
    { href: "/productos/motherboard", label: "Placas Madre" },
    { href: "/productos/ram", label: "Memorias RAM" },
    { href: "/productos/almacenamiento", label: "Almacenamiento" },
    { href: "/productos/gabinetes", label: "Gabinetes" },
  ],
  "PC Builder": [
    { href: "/builder", label: "Armar PC" },
    { href: "/builds", label: "Builds populares" },
    { href: "/builds/gaming", label: "Builds Gaming" },
    { href: "/builds/workstation", label: "Builds Workstation" },
  ],
  Ayuda: [
    { href: "/como-comprar", label: "¿Cómo comprar?" },
    { href: "/envios", label: "Envíos y despachos" },
    { href: "/garantia", label: "Garantía" },
    { href: "/devoluciones", label: "Devoluciones" },
    { href: "/contacto", label: "Contacto" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#222] bg-[#0a0a0a] mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span
                className="text-2xl font-black tracking-widest text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                COMPUELITE
              </span>
            </Link>
            <p className="text-[#888] text-sm leading-relaxed mb-6 max-w-xs">
              La plataforma de gaming más avanzada de Chile. Construye tu PC ideal con nuestro configurador 3D interactivo.
            </p>

            {/* Social */}
            <div className="flex gap-3">
              {[
                { href: "#", label: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                { href: "#", label: "YouTube", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
                { href: "#", label: "Discord", icon: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.127 18.112a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded border border-[#222] text-[#888] hover:text-[#00ff66] hover:border-[#00ff66] transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3
                className="text-xs font-bold uppercase tracking-widest text-[#00ff66] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#888] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#555]">
            © {new Date().getFullYear()} COMPUELITE SpA · Santiago, Chile · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="text-xs text-[#555] hover:text-[#888] transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-xs text-[#555] hover:text-[#888] transition-colors">
              Términos
            </Link>
            {/* Payment logos */}
            <div className="flex items-center gap-2 text-xs text-[#555]">
              <span className="px-2 py-1 border border-[#333] rounded text-[10px] uppercase tracking-wider">WebPay</span>
              <span className="px-2 py-1 border border-[#333] rounded text-[10px] uppercase tracking-wider">MP</span>
              <span className="px-2 py-1 border border-[#333] rounded text-[10px] uppercase tracking-wider">Flow</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
