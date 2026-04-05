import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Major hardware brand CDNs used in product images
      { protocol: "https", hostname: "**.corsair.com" },
      { protocol: "https", hostname: "**.asus.com" },
      { protocol: "https", hostname: "**.aorus.com" },
      { protocol: "https", hostname: "**.gigabyte.com" },
      { protocol: "https", hostname: "**.msi.com" },
      { protocol: "https", hostname: "**.nzxt.com" },
      { protocol: "https", hostname: "**.lian-li.com" },
      { protocol: "https", hostname: "**.coolermaster.com" },
      { protocol: "https", hostname: "**.seasonic.com" },
      { protocol: "https", hostname: "**.thermaltake.com" },
      { protocol: "https", hostname: "**.fractal-design.com" },
      { protocol: "https", hostname: "**.evga.com" },
      { protocol: "https", hostname: "**.amd.com" },
      { protocol: "https", hostname: "**.intel.com" },
      { protocol: "https", hostname: "**.nvidia.com" },
      { protocol: "https", hostname: "**.samsung.com" },
      { protocol: "https", hostname: "**.seagate.com" },
      { protocol: "https", hostname: "**.westerndigital.com" },
      { protocol: "https", hostname: "**.kingston.com" },
      { protocol: "https", hostname: "**.crucial.com" },
      { protocol: "https", hostname: "**.hyperxgaming.com" },
      { protocol: "https", hostname: "**.logitech.com" },
      { protocol: "https", hostname: "**.razer.com" },
      { protocol: "https", hostname: "**.steelseries.com" },
      // Generic CDN wildcards for any other brand
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
