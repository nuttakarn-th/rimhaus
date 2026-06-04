"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { GalleryItem } from "@/lib/types"

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null)

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(() => setIndex(i => i !== null ? (i - 1 + items.length) % items.length : null), [items.length])
  const next = useCallback(() => setIndex(i => i !== null ? (i + 1) % items.length : null), [items.length])

  useEffect(() => {
    if (index === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, close, prev, next])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = index !== null ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [index])

  const current = index !== null ? items[index] : null

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIndex(i)}
            className="relative group overflow-hidden rounded-2xl aspect-square bg-[hsl(35,30%,93%)] cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.caption ?? ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {item.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white">{item.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium tabular-nums">
            {(index ?? 0) + 1} / {items.length}
          </div>

          {/* Prev */}
          {items.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image_url}
              alt={current.caption ?? ""}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            {current.caption && (
              <p className="text-white/80 text-sm text-center px-4">{current.caption}</p>
            )}
          </div>

          {/* Next */}
          {items.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
