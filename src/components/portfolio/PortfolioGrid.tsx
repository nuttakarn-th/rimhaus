"use client"

import { useState } from "react"
import Image from "next/image"
import type { PortfolioItem } from "@/lib/types"

type Filter = "all" | "video" | "photo"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",   label: "All" },
  { value: "video", label: "Short VDO" },
  { value: "photo", label: "Photo" },
]

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState<Filter>("all")

  const videoCount = items.filter(i => i.type === "video").length
  const photoCount = items.filter(i => i.type === "photo").length
  const visible = filter === "all" ? items : items.filter(i => i.type === filter)

  return (
    <>
      {/* ── Filter bar — AFF "Selected Works / Grid List Feed" ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-y border-border">
        <p className="text-xs text-muted-foreground">
          Selected Works
          <sup className="text-[9px] ml-0.5">{items.length}</sup>
        </p>
        <div className="ml-auto flex items-center gap-4">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs font-medium transition-colors whitespace-nowrap ${
                filter === f.value
                  ? "text-foreground underline underline-offset-4 decoration-foreground/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.value === "video" && (
                <span className="ml-0.5 text-muted-foreground/60">{videoCount}</span>
              )}
              {f.value === "photo" && (
                <span className="ml-0.5 text-muted-foreground/60">{photoCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Full-bleed tight grid ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-border">
        {visible.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-background"
          >
            {/* Square image */}
            <div className="relative aspect-square overflow-hidden bg-[hsl(35,20%,88%)]">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.title ?? ""}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 33vw, 25vw"
                />
              )}

              {/* Hover scrim */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

              {/* ↗ arrow — top right, shows on hover */}
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 transition-all duration-200">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </div>

              {/* VDO badge — bottom left */}
              {item.type === "video" && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                  <svg width="6" height="7" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-[8px] text-white font-bold tracking-widest">VDO</span>
                </div>
              )}
            </div>

            {/* Title below — always visible */}
            <div className="px-2 pt-1.5 pb-2 bg-background">
              <p className="text-[11px] font-medium text-foreground truncate leading-tight">
                {item.title ?? "—"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </>
  )
}
