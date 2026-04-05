"use client";

import { useState, useEffect } from "react";
import { CatalogFilters } from "./CatalogFilters";

interface Props {
  categories: Parameters<typeof CatalogFilters>[0]["categories"];
  brands: Parameters<typeof CatalogFilters>[0]["brands"];
  priceRange: Parameters<typeof CatalogFilters>[0]["priceRange"];
}

export function MobileFiltersDrawer({ categories, brands, priceRange }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] rounded-lg text-sm text-[#888] hover:text-[#00ff66] hover:border-[#00ff66]/30 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros
      </button>

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#0d0d0d] border-r border-[#1a1a1a] z-50 lg:hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]">
              <span className="text-sm font-black text-white uppercase tracking-widest"
                style={{ fontFamily: "var(--font-display)" }}>
                Filtros
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-[#555] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <CatalogFilters
                categories={categories}
                brands={brands}
                priceRange={priceRange}
                onFilterChange={() => setOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
