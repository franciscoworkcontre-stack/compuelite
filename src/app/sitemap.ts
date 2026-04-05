import { type MetadataRoute } from "next";
import { db } from "@/server/db/client";

const BASE_URL = "https://www.compuelite.cl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), priority: 1 },
    { url: `${BASE_URL}/productos`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE_URL}/builder`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE_URL}/builds`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE_URL}/marcas`, lastModified: new Date(), priority: 0.7 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/productos/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
