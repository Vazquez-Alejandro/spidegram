import en from "./en.json"
import es from "./es.json"

export type Locale = "en" | "es"

const messages: Record<Locale, Record<string, any>> = { en, es }

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en
}

export function t(messages: Record<string, any>, path: string): string {
  const keys = path.split(".")
  let value: any = messages
  for (const key of keys) {
    if (value == null) return path
    value = value[key]
  }
  return typeof value === "string" ? value : path
}
