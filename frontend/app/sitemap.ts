import type { MetadataRoute } from "next";
import { PUBLIC_PAGES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.keys(PUBLIC_PAGES).map((path) => ({
    url: new URL(path, SITE_URL).toString(),
  }));
}
