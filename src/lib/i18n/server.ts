import { cookies } from "next/headers"
import en from "./en.json"
import es from "./es.json"

type Locale = "en" | "es"

const messages: Record<Locale, any> = { en, es }

function resolve(m: any, path: string): string {
  const keys = path.split(".")
  let value: any = m
  for (const k of keys) {
    if (value == null) return path
    value = value[k]
  }
  return typeof value === "string" ? value : path
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const stored = cookieStore.get("locale")?.value as Locale | undefined
  return stored || "en"
}

export async function getTranslations() {
  const locale = await getLocale()
  const msgs = messages[locale] || messages.en
  return {
    t: (path: string) => resolve(msgs, path),
    locale,
  }
}
