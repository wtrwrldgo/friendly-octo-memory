import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://watergocrm.uz";
  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/favicon.ico`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
