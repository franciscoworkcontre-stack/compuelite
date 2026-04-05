import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { HeroSection } from "@/components/shop/HeroSection";
import { CategoriesSection } from "@/components/shop/CategoriesSection";
import { BuilderCTASection } from "@/components/shop/BuilderCTASection";
import { FeaturedBuilds } from "@/components/shop/FeaturedBuilds";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoriesSection />
        <BuilderCTASection />
        <FeaturedBuilds />

        {/* Trust section */}
        <section className="py-16 px-4 border-t border-[#222]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                {
                  icon: "🚚",
                  title: "Envío a Chile",
                  desc: "Starken, Chilexpress y Blue Express",
                },
                {
                  icon: "🔒",
                  title: "Pago seguro",
                  desc: "WebPay, Mercado Pago y Flow",
                },
                {
                  icon: "⚡",
                  title: "Stock real",
                  desc: "Disponibilidad en tiempo real",
                },
                {
                  icon: "🛠️",
                  title: "Garantía",
                  desc: "Respaldo técnico postventa",
                },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">
                      {item.title}
                    </div>
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
