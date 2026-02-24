import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/accounts", "/billing", "/drivers", "/firm-", "/firms", "/orders", "/pending-reviews"],
    },
    sitemap: "https://watergocrm.uz/sitemap.xml",
    host: "https://watergocrm.uz",
  };
}
