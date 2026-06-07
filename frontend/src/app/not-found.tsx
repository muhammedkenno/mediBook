import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Home, Search } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default async function NotFound() {
  const t = await getTranslations("errors")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* 404 number */}
      <div className="relative mb-6 select-none">
        <span className="text-[9rem] font-black leading-none text-muted/30 dark:text-muted-foreground/10">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="size-16 text-muted-foreground/40" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">{t("notFound")}</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">{t("notFoundDesc")}</p>

      <Link href="/" className={buttonVariants({ variant: "default" }) + " gap-2"}>
        <Home className="size-4" />
        {t("goHome")}
      </Link>
    </div>
  )
}
