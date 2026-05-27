"use client"

import { useState, useEffect } from "react"
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

export function useTranslations() {
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    const cookieMatch = document.cookie.match(/locale=(\w+)/)
    const stored = cookieMatch?.[1] as Locale | undefined
    const browser = navigator.language?.startsWith("es") ? "es" : "en"
    setLocale(stored || browser)
  }, [])

  function t(path: string): string {
    return resolve(messages[locale] || messages.en, path)
  }

  return { t, locale }
}

export function LocaleSwitcher() {
  const { locale } = useTranslations()

  function switchTo(l: Locale) {
    document.cookie = `locale=${l};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchTo("es")}
        className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
          locale === "es" ? "text-white bg-white/10" : "text-gray-500 hover:text-white"
        }`}
      >
        ES
      </button>
      <span className="text-gray-600 text-[10px]">|</span>
      <button
        onClick={() => switchTo("en")}
        className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
          locale === "en" ? "text-white bg-white/10" : "text-gray-500 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  )
}
