"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type Flash = { type: "success" | "error"; message: string } | null

function ToastInner() {
  const searchParams = useSearchParams()
  const [flash, setFlash] = useState<Flash>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const type = searchParams.get("flash_type")
    const msg = searchParams.get("flash_msg")
    if (type && msg) {
      setFlash({ type: type as "success" | "error", message: decodeURIComponent(msg) })
      setVisible(true)

      const params = new URLSearchParams(searchParams.toString())
      params.delete("flash_type")
      params.delete("flash_msg")
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
      window.history.replaceState(null, "", newUrl)

      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => setFlash(null), 300)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!flash) return null

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className={`rounded-2xl px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl flex items-center gap-2.5 ${
          flash.type === "success"
            ? "bg-emerald-900/80 text-emerald-200 border border-emerald-700/50"
            : "bg-red-900/80 text-red-200 border border-red-700/50"
        }`}
      >
        {flash.type === "success" ? (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {flash.message}
      </div>
    </div>
  )
}

export function Toast() {
  return (
    <Suspense fallback={null}>
      <ToastInner />
    </Suspense>
  )
}
