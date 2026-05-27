"use client"

import { useState, useEffect } from "react"

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export function NotificationPrompt() {
  const [supported, setSupported] = useState(false)
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "loading">("idle")

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setSupported(true)
      setStatus(Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "idle")
    }
  }, [])

  async function requestPermission() {
    setStatus("loading")
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      await subscribe()
      setStatus("granted")
    } else {
      setStatus("denied")
    }
  }

  async function subscribe() {
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (subscription) return

    const res = await fetch("/api/push-vapid-key")
    const { publicKey } = await res.json()

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    await fetch("/api/push-subscribe", {
      method: "POST",
      body: JSON.stringify(subscription.toJSON()),
    })
  }

  if (!supported || status === "granted" || status === "denied") return null

  return (
    <div className="rounded-2xl bg-surface border border-border p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium">Enable notifications</p>
          <p className="text-xs text-gray-500">Get alerts for new comments and photo uploads</p>
        </div>
      </div>
      <button
        onClick={requestPermission}
        disabled={status === "loading"}
        className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold hover:opacity-90 transition-all shrink-0 disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Enable"}
      </button>
    </div>
  )
}
