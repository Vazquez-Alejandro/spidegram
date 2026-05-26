"use client"

import { useState, useRef, useCallback } from "react"

export function PullToRefresh({
  children,
  onRefresh,
}: {
  children: React.ReactNode
  onRefresh: () => Promise<void>
}) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pullDist = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling) return
      pullDist.current = Math.max(0, e.touches[0].clientY - startY.current)
    },
    [pulling],
  )

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return
    setPulling(false)
    if (pullDist.current > 80) {
      setRefreshing(true)
      await onRefresh()
      setRefreshing(false)
    }
    pullDist.current = 0
  }, [pulling, onRefresh])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {refreshing && (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
      {children}
    </div>
  )
}
