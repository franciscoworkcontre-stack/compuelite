import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout", "/carrito", "/cuenta", "/pedido/"],
      },
    ],
    sitemap: "https://www.compuelite.cl/sitemap.xml",
  };
}
