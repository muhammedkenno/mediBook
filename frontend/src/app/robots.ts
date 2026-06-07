import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://medibook.app"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/check-symptoms", "/book"],
        disallow: [
          "/admin/",
          "/login",
          "/signup",
          "/verify-email",
          "/appointments",
          "/profile",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
