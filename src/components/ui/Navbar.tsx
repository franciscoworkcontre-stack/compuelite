"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/productos", label: "Productos" },
  { href: "/builder", label: "PC Builder 3D" },
  { href: "/builds", label: "Builds" },
  { href: "/marcas", label: "Marcas" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#222] bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className="text-xl font-black tracking-widest text-white group-hover:text-[#00ff66] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              COMPUELITE
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#888] hover:text-[#00ff66] transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/builder"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#00ff66] text-black text-sm font-bold uppercase tracking-wider rounded hover:bg-[#00cc52] transition-all hover:shadow-[0_0_20px_rgba(0,255,102,0.4)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Armar PC
            </Link>

            {/* Cart */}
            <Link
              href="/carrito"
              className="relative p-2 text-[#888] hover:text-[#00ff66] transition-colors"
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.874-7.148a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[#888] hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#222] py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-[#888] hover:text-[#00ff66] hover:bg-[#111] rounded transition-colors uppercase tracking-wider"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 px-4">
              <Link
                href="/builder"
                className="block text-center py-2 bg-[#00ff66] text-black text-sm font-bold uppercase tracking-wider rounded"
              >
                Armar PC
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
