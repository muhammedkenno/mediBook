import Link from "next/link"
import { Stethoscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { VerifyForm } from "./verify-form"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email = "" } = await searchParams
  const t = await getTranslations("verify")

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.72_0.12_215/0.15),transparent)]"
      />
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="size-4" />
        </span>
        MediBook
      </Link>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {email ? t("subtitle", { email }) : t("missingEmail")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {email ? (
            <VerifyForm email={email} />
          ) : (
            <Link href="/signup" className="text-sm underline underline-offset-2">
              {t("missingEmail")}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
