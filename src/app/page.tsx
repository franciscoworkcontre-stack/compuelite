import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { HeroSection } from "@/components/shop/HeroSection";
import { CategoriesSection } from "@/components/shop/CategoriesSection";
import { FeaturedBuilds } from "@/components/shop/FeaturedBuilds";
import { ContentZone } from "@/components/content/ContentZone";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="pt-16">
        {/* 1 · Hero */}
        <HeroSection />

        {/* 2 · Announcement bar inline (ticker, offers) */}
        <ContentZone zone="homepage_live" />

        {/* 3 · Highlight banner / promo */}
        <ContentZone zone="homepage_dual" />

        {/* 4 · Editorial / featured recommendation */}
        <ContentZone zone="homepage_editorial" />

        {/* 5 · Category grid */}
        <CategoriesSection />

        {/* 6 · Promo block */}
        <ContentZone zone="homepage_promo" />

        {/* 7 · Featured products */}
        <FeaturedBuilds />

        {/* 8 · Community / reviews */}
        <ContentZone zone="homepage_community" />

        {/* Trust signals */}
        <section className="py-14 px-4 border-t border-[#111]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { icon: "🚚", title: "Envío a Chile",  desc: "Starken, Chilexpress y Blue Express" },
                { icon: "🔒", title: "Pago seguro",    desc: "WebPay, Mercado Pago y Flow" },
                { icon: "⚡", title: "Stock real",     desc: "Disponibilidad en tiempo real" },
                { icon: "🛠️", title: "Garantía",       desc: "Respaldo técnico postventa" },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-[#555]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
