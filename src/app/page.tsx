import { Suspense } from "react";
import { api } from "@/lib/trpc/server";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { HomeSidebar } from "@/components/shop/HomeSidebar";
import { FeaturedBanners } from "@/components/shop/FeaturedBanners";
import { BestDeals } from "@/components/shop/BestDeals";
import { BrandLogos } from "@/components/shop/BrandLogos";
import { BuildsByType } from "@/components/shop/BuildsByType";
import { BrandFilter } from "@/components/shop/BrandFilter";
import { MobileNav } from "@/components/shop/MobileNav";
import { TrustSignals } from "@/components/shop/TrustSignals";

// Maps a section slug to its React component
function renderSection(slug: string, config: Record<string, unknown>) {
  switch (slug) {
    case "featured_banners": return <FeaturedBanners />;
    case "best_deals":       return <BestDeals config={config} />;
    case "builds_by_type":   return <BuildsByType config={config} />;
    case "brand_logos":      return <BrandLogos />;
    case "trust_signals":    return <><div className="h-px bg-[#111]" /><TrustSignals /></>;
    default:                 return null;
  }
}

export default async function HomePage() {
  const sections = await api.content.homepageSections();

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

            {/* Brand filter row — always shown */}
            <Suspense fallback={null}>
              <BrandFilter />
            </Suspense>

            {/* Dynamic sections from DB */}
            {sections.map((section) => {
              const config = (section.config ?? {}) as Record<string, unknown>;
              const rendered = renderSection(section.slug, config);
              if (!rendered) return null;
              return (
                <div key={section.id}>
                  {rendered}
                </div>
              );
            })}

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
