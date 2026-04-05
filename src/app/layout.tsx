import type { Metadata } from "next";
import { Orbitron, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AuthSessionProvider } from "@/lib/session-provider";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "COMPUELITE — PC Gaming Chile",
    template: "%s | COMPUELITE",
  },
  description:
    "Arma tu PC gamer ideal con nuestro configurador 3D interactivo. Los mejores componentes gaming en Chile con garantía y envío a todo el país.",
  keywords: ["PC gamer", "componentes PC", "PC builder", "gaming Chile", "RTX", "AMD", "Intel"],
  openGraph: {
    title: "COMPUELITE — PC Gaming Chile",
    description: "Arma tu PC gamer ideal con nuestro configurador 3D interactivo.",
    url: "https://www.compuelite.cl",
    siteName: "COMPUELITE",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COMPUELITE — PC Gaming Chile",
    description: "Arma tu PC gamer ideal con nuestro configurador 3D interactivo.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <AuthSessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
