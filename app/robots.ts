import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy"],
      disallow: ["/api/", "/dashboard", "/transactions", "/budgets", "/analytics", "/settings"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
