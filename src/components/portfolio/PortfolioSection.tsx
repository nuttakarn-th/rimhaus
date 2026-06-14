"use client"

import { useState } from "react"
import Image from "next/image"
import { PlatformBubble } from "@/components/ui/PlatformIcon"
import type { PortfolioItem } from "@/lib/types"

const INIT = 9
const PAGE = 9

function detectPlatform(url: string): string | null {
  if (url.includes("facebook.com") || url.includes("fb.com")) return "facebook"
  if (url.includes("tiktok.com")) return "tiktok"
  if (url.includes("instagram.com")) return "instagram"
  if (url.includes("lemon8")) return "lemon8"
  return null
}

const ARROW = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
)

function PortfolioCard({ item, dark, isFeatured = false }: { item: PortfolioItem; dark: boolean; isFeatured?: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden ${
        isFeatured
          ? "col-span-3 sm:col-span-2 aspect-square sm:aspect-[2/1]"
          : "aspect-square"
      } ${dark ? "bg-[hsl(25,20%,18%)]" : "bg-[hsl(35,20%,88%)]"}`}
    >
      {item.image_url && (
        <Image
          src={item.image_url}
          alt={item.title ?? ""}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes={isFeatured ? "100vw" : "(max-width: 640px) 33vw, 25vw"}
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

      {/* ↗ arrow */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-black opacity-60 sm:opacity-0 sm:group-hover:opacity-100 sm:-translate-y-0.5 sm:group-hover:translate-y-0 transition-all duration-200">
        {ARROW}
      </div>

      {/* VDO badge — top left */}
      {item.type === "video" && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
          <svg width="6" height="7" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
          <span className="text-[8px] text-white font-bold tracking-widest">VDO</span>
        </div>
      )}

      {/* Title overlay — VDO: always visible / Photo: hover only */}
      {item.title && (
        <div className={`absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-6 bg-gradient-to-t from-black/75 to-transparent transition-opacity duration-300 ${
          item.type === "video"
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}>
          <p className={`text-white font-bold leading-tight line-clamp-2 ${isFeatured ? "text-sm" : "text-[9px]"}`}>
            {item.title}
          </p>
        </div>
      )}
    </a>
  )
}

export function PortfolioSection({
  items,
  dark,
  label,
  hasFeatured = false,
}: {
  items: PortfolioItem[]
  dark: boolean
  label: string
  hasFeatured?: boolean
}) {
  const [limit, setLimit] = useState(INIT)
  const visible = items.slice(0, limit)
  const remaining = items.length - limit

  const platforms = Array.from(new Set(
    items.map(i => detectPlatform(i.url ?? "")).filter(Boolean) as string[]
  ))

  return (
    <section className={dark ? "bg-[hsl(25,20%,12%)]" : "bg-background"}>

      {/* Label */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <p className={`text-sm font-bold tracking-[0.3em] uppercase ${
          dark ? "text-white/50" : "text-brand-tx/70"
        }`}>
          {label}
        </p>
        <span className={`text-xs font-bold ${dark ? "text-white/25" : "text-muted-foreground"}`}>
          {items.length}
        </span>
        {platforms.length > 0 && (
          <div className="flex items-center gap-1 ml-1">
            {platforms.map(p => (
              <PlatformBubble key={p} platform={p} size={18} noHover />
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-3 sm:grid-cols-4 gap-px ${
        dark ? "bg-[hsl(25,20%,22%)]" : "bg-border"
      }`}>
        {visible.map((item, index) => (
          <PortfolioCard
            key={item.id}
            item={item}
            dark={dark}
            isFeatured={hasFeatured && index === 0}
          />
        ))}
      </div>

      {/* Load More */}
      {remaining > 0 && (
        <div className={`flex justify-center py-5 ${dark ? "bg-[hsl(25,20%,12%)]" : "bg-background"}`}>
          <button
            onClick={() => setLimit(l => l + PAGE)}
            className={`px-5 py-2 rounded-full text-xs font-bold border transition-colors ${
              dark
                ? "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            ดูเพิ่ม {Math.min(remaining, PAGE)} รายการ
          </button>
        </div>
      )}

    </section>
  )
}
