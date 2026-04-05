"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { SearchModal } from "./SearchModal";

const navLinks = [
  { href: "/productos", label: "Productos" },
  { href: "/builder", label: "PC Builder 3D" },
  { href: "/builds", label: "Builds" },
  { href: "/marcas", label: "Marcas" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const { data: session } = useSession();

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
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
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#222] rounded-lg text-[#555] hover:text-[#888] hover:border-[#333] transition-all text-sm"
                aria-label="Buscar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:block text-xs">Buscar</span>
                <kbd className="hidden sm:block text-[10px] text-[#444] border border-[#333] rounded px-1 font-mono leading-tight">
                  ⌘K
                </kbd>
              </button>

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
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00ff66] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* User account */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-xs font-black text-[#00ff66] hover:bg-[#00ff66]/20 transition-all"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-10 w-44 bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-3 py-2.5 border-b border-[#1a1a1a]">
                        <p className="text-xs text-white font-medium truncate">{session.user.name}</p>
                        <p className="text-xs text-[#555] truncate">{session.user.email}</p>
                      </div>
                      <Link href="/cuenta" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:text-[#00ff66] hover:bg-[#0d0d0d] transition-colors">
                        Mi cuenta
                      </Link>
                      {session.user.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:text-[#00ff66] hover:bg-[#0d0d0d] transition-colors">
                          Admin
                        </Link>
                      )}
                      <button onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:text-[#ff3333] hover:bg-[#0d0d0d] transition-colors border-t border-[#1a1a1a]">
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login"
                  className="hidden sm:block text-xs text-[#555] hover:text-[#888] transition-colors border border-[#1a1a1a] px-3 py-1.5 rounded">
                  Entrar
                </Link>
              )}

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
              <button
                onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#888] hover:text-[#00ff66] hover:bg-[#111] rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar productos...
              </button>
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
                  onClick={() => setMenuOpen(false)}
                >
                  Armar PC
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
