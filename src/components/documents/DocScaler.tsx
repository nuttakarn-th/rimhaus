"use client"

import { useRef, useState, useEffect } from "react"

const DOC_MIN_WIDTH = 600

export function DocScaler({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      setZoom(w < DOC_MIN_WIDTH ? w / DOC_MIN_WIDTH : 1)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    // overflow-x-clip clips the 600px child during SSR without creating a scroll container
    <div ref={containerRef} className="w-full overflow-x-clip print:overflow-visible">
      <div style={zoom < 1 ? { zoom } : undefined}>
        {children}
      </div>
    </div>
  )
}
