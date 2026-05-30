"use client"

import { useRef, useState, useEffect } from "react"

const DOC_MIN_WIDTH = 600

export function DocScaler({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(() => {
    if (typeof window === "undefined") return 1
    const available = window.innerWidth - 32 // account for page padding
    return available < DOC_MIN_WIDTH ? available / DOC_MIN_WIDTH : 1
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const available = el.offsetWidth
      setZoom(available < DOC_MIN_WIDTH ? available / DOC_MIN_WIDTH : 1)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full print:[zoom:1]">
      <div style={{ zoom, minWidth: `${DOC_MIN_WIDTH}px` }}>
        {children}
      </div>
    </div>
  )
}
