"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import type { Article } from "@/lib/types"

function readingTime(content: string | null): number {
  if (!content) return 1
  const text = content.replace(/<[^>]*>/g, " ").replace(/[#*_`>\[\]!]/g, "").replace(/\s+/g, " ").trim()
  return Math.max(1, Math.ceil(text.length / 350))
}

const CATEGORY_PALETTE: Record<string, { bg: string; accent: string; label: string }> = {
  "มุมบ้าน":              { bg: "linear-gradient(135deg,#FDE8D5,#F5C8A0)", accent: "#B85C20", label: "#C06428" },
  "ไอเดีย & วิธีคิด":    { bg: "linear-gradient(135deg,#E8F0E4,#C8DCC0)", accent: "#3D6E38", label: "#3D6E38" },
  "คู่มือซื้อของ":        { bg: "linear-gradient(135deg,#FEF5D8,#F4DFA0)", accent: "#8A6818", label: "#7A5C10" },
  "กระแสตกแต่งบ้าน":     { bg: "linear-gradient(135deg,#D8EAF8,#A8C8E4)", accent: "#1E5C96", label: "#1E5C96" },
  "MID-CENTURY MODERN":   { bg: "linear-gradient(135deg,#EDE8F8,#C8B8E8)", accent: "#4A2A90", label: "#4A2A90" },
  "Mid-Century Modern":   { bg: "linear-gradient(135deg,#EDE8F8,#C8B8E8)", accent: "#4A2A90", label: "#4A2A90" },
}
const DEFAULT_PALETTE = { bg: "linear-gradient(135deg,#F4EDE4,#E4D0BC)", accent: "#8A5830", label: "#8A5830" }

function getPalette(category: string | null) {
  if (!category) return DEFAULT_PALETTE
  return CATEGORY_PALETTE[category] ?? DEFAULT_PALETTE
}

export function BlogList({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<string | null>(null)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    return articles
      .map(a => a.category)
      .filter((c): c is string => !!c && !seen.has(c) && !!seen.add(c))
  }, [articles])

  const filtered = useMemo(
    () => active ? articles.filter(a => a.category === active) : articles,
    [articles, active]
  )

  return (
    <div className="space-y-8">

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              active === null
                ? "bg-[hsl(24,85%,50%)] text-white border-[hsl(24,85%,50%)]"
                : "bg-white text-[hsl(25,10%,45%)] border-[hsl(35,20%,82%)] hover:border-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,45%)]"
            }`}
          >
            ทั้งหมด
            <span className={`ml-1.5 ${active === null ? "opacity-75" : "opacity-50"}`}>
              {articles.length}
            </span>
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(active === cat ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active === cat
                  ? "bg-[hsl(24,85%,50%)] text-white border-[hsl(24,85%,50%)]"
                  : "bg-white text-[hsl(25,10%,45%)] border-[hsl(35,20%,82%)] hover:border-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,45%)]"
              }`}
            >
              {cat}
              <span className={`ml-1.5 ${active === cat ? "opacity-75" : "opacity-50"}`}>
                {articles.filter(a => a.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-16">ไม่พบบทความในหมวดหมู่นี้</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(article => {
            const palette = getPalette(article.category)
            const minutes = readingTime(article.content)
            return (
              <Link key={article.id} href={`/blog/${article.slug}`} className="group block">
                <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

                  {/* Cover / Placeholder */}
                  <div className="aspect-video relative overflow-hidden">
                    {article.cover_image_url ? (
                      <Image
                        src={article.cover_image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6"
                        style={{ background: palette.bg }}
                      >
                        <span
                          className="text-[10px] font-bold tracking-[0.3em] uppercase"
                          style={{ color: palette.accent }}
                        >
                          {article.category ?? "บทความ"}
                        </span>
                        <p
                          className="text-center text-sm font-semibold leading-snug line-clamp-2 opacity-60"
                          style={{ color: palette.accent, fontFamily: "var(--font-display)" }}
                        >
                          {article.title}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {article.category && (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[hsl(24,85%,50%)]">
                          {article.category}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {minutes} นาที
                      </span>
                    </div>
                    <h2 className="font-semibold text-sm text-foreground leading-snug group-hover:text-[hsl(24,85%,50%)] transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
                        : ""}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
