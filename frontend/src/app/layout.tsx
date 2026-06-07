import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://medibook.app"),
  title: {
    default: "MediBook — AI-Powered Hospital Booking",
    template: "%s | MediBook",
  },
  description:
    "Describe your symptoms, let our AI identify what you might have and recommend the right specialist — then book an appointment instantly.",
  keywords: ["hospital booking", "AI triage", "doctor appointment", "medical", "health"],
  authors: [{ name: "MediBook" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MediBook",
    title: "MediBook — AI-Powered Hospital Booking",
    description:
      "Describe your symptoms, let our AI identify what you might have and recommend the right specialist — then book an appointment instantly.",
    // Images injected automatically from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "MediBook — AI-Powered Hospital Booking",
    description: "AI-guided hospital appointment booking.",
    // Image auto-injected from app/opengraph-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
          <Toaster richColors position={dir === "rtl" ? "bottom-left" : "bottom-right"} />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
