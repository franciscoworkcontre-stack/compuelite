import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { HomeSidebar } from "@/components/shop/HomeSidebar";
import { FeaturedBanners } from "@/components/shop/FeaturedBanners";
import { BestDeals } from "@/components/shop/BestDeals";
import { BrandLogos } from "@/components/shop/BrandLogos";
import { FeaturedBuilds } from "@/components/shop/FeaturedBuilds";
import { BrandFilter } from "@/components/shop/BrandFilter";
import { MobileNav } from "@/components/shop/MobileNav";
import { TrustSignals } from "@/components/shop/TrustSignals";

export default async function HomePage() {
  return (
    <>
      <Navbar />

      <div className="pt-16 min-h-screen bg-[#0a0a0a]">
        <div className="flex">

          {/* Left sidebar — desktop only */}
          <Suspense fallback={<div className="w-52 hidden lg:block" />}>
            <HomeSidebar />
          </Suspense>

          {/* Main content */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 space-y-8 pb-20 lg:pb-6">

            {/* Brand filter row */}
            <Suspense fallback={null}>
              <BrandFilter />
            </Suspense>

            {/* Featured banners */}
            <FeaturedBanners />

            {/* Today's Best Deals */}
            <BestDeals />

            {/* Separator */}
            <div className="h-px bg-[#111]" />

            {/* Builds section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-sm font-black text-white uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Builds Populares
                </h2>
                <Link
                  href="/builds"
                  className="text-[10px] text-[#444] hover:text-[#00ff66] transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  Ver todas
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <FeaturedBuilds compact />
            </section>

            {/* Brand logos */}
            <BrandLogos />

            {/* Trust signals */}
            <div className="h-px bg-[#111]" />
            <TrustSignals />

          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>

      <Footer />
    </>
  );
}
