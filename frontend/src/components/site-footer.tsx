import { getTranslations } from "next-intl/server"

export async function SiteFooter() {
  const t = await getTranslations("landing")
  return (
    <footer className="border-t px-4 py-6 text-center text-muted-foreground text-sm">
      © 2026 {t("footer")}
    </footer>
  )
}
