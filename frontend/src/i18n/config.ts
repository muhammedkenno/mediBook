export const COOKIE_NAME = "NEXT_LOCALE"
export const SUPPORTED_LOCALES = ["en", "ar"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"
