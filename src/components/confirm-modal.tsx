"use client"

import { useState } from "react"

export function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: "danger" | "primary"
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
