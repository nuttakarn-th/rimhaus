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
    <>
      {/* Reset zoom when printing so PDF output is full A4 size */}
      <style>{`@media print { .doc-scaler { zoom: 1 !important; } }`}</style>
      <div ref={containerRef} className="w-full overflow-x-clip print:overflow-visible">
        <div className="doc-scaler" style={zoom < 1 ? { zoom } : undefined}>
          {children}
        </div>
      </div>
    </>
  )
}
