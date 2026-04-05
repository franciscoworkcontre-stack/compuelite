import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ContentZone } from "@/components/content/ContentZone";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentZone zone="announcement_bar" />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
