"use client"

import { useState, useRef, useCallback } from "react"

export function PullToRefresh({ children, onRefresh }: { children: React.ReactNode; onRefresh?: () => Promise<void> }) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const THRESHOLD = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current
    if (!el || el.scrollTop > 0) return
    startY.current = e.touches[0].clientY
    setPulling(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling) return
    const diff = e.touches[0].clientY - startY.current
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5))
    }
  }, [pulling])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true)
      if (onRefresh) {
        await onRefresh()
      } else {
        window.location.reload()
      }
    }
    setPulling(false)
    setPullDistance(0)
  }, [pullDistance, onRefresh])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {pulling && pullDistance > 0 && (
        <div
          className="flex justify-center items-center transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{
                transform: pullDistance >= THRESHOLD ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <span>
              {refreshing
                ? "Refreshing..."
                : pullDistance >= THRESHOLD
                ? "Release to refresh"
                : "Pull down to refresh"}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
