import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://medibook.app"
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/check-symptoms`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/book`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ]
}
