import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { HeroSection } from "@/components/shop/HeroSection";
import { CategoriesSection } from "@/components/shop/CategoriesSection";
import { FeaturedBuilds } from "@/components/shop/FeaturedBuilds";
import { ContentZone } from "@/components/content/ContentZone";

export default function HomePage() {
  return (
    <>
      {/* Global announcement bar */}
      <ContentZone zone="announcement_bar" />

      <Navbar />

      <main className="pt-16">
        {/* 1 · Hero — 3D builder teaser */}
        <HeroSection />

        {/* 2 · Live stock ticker — real-time urgency, not fake discounts */}
        <ContentZone zone="homepage_live" />

        {/* 3 · Dual audience entry — Gamer vs AI Dev */}
        <ContentZone zone="homepage_dual" />

        {/* 4 · Editorial spotlight — opinion + recommendation, replaces banner */}
        <ContentZone zone="homepage_editorial" />

        {/* 5 · Category grid — browse by type */}
        <CategoriesSection />

        {/* 6 · AI capability showcase — targets AI dev audience */}
        <ContentZone zone="homepage_ai" />

        {/* 7 · Promo / countdown — only when there's actually a sale */}
        <ContentZone zone="homepage_promo" />

        {/* 8 · Featured community builds */}
        <FeaturedBuilds />

        {/* 9 · Community build spotlight */}
        <ContentZone zone="homepage_community" />

        {/* 10 · Quiz — help users find their build */}
        <ContentZone zone="homepage_quiz" />

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
