"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, Search, X } from "lucide-react"
import { DeleteArticleButton } from "@/components/articles/DeleteArticleButton"
import type { Article } from "@/lib/types"

type Status = "all" | "published" | "draft"

export function ArticleList({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<Status>("all")

  const counts = useMemo(() => ({
    all: articles.length,
    published: articles.filter(a => a.status === "published").length,
    draft: articles.filter(a => a.status === "draft").length,
  }), [articles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter(a => {
      if (status !== "all" && a.status !== status) return false
      if (q && !a.title.toLowerCase().includes(q) && !(a.category ?? "").toLowerCase().includes(q)) return false
      return true
    })
  }, [articles, query, status])

  const TABS: { key: Status; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "published", label: "เผยแพร่แล้ว" },
    { key: "draft", label: "ฉบับร่าง" },
  ]

  return (
    <div className="space-y-4">
      {/* Search + filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(25,10%,60%)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อบทความหรือหมวดหมู่..."
            className="w-full pl-8 pr-8 py-2 text-sm border border-[hsl(35,20%,85%)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)] focus:border-transparent placeholder:text-[hsl(25,10%,65%)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(25,10%,60%)] hover:text-[hsl(25,20%,20%)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-[hsl(35,25%,94%)] rounded-lg p-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatus(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                status === tab.key
                  ? "bg-white text-[hsl(25,20%,15%)] shadow-sm"
                  : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,20%)]"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] ${
                status === tab.key ? "text-[hsl(24,85%,50%)]" : "text-[hsl(25,10%,65%)]"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {(query || status !== "all") && (
        <p className="text-xs text-[hsl(25,10%,55%)]">
          พบ {filtered.length} จาก {articles.length} บทความ
          {(query || status !== "all") && (
            <button
              type="button"
              onClick={() => { setQuery(""); setStatus("all") }}
              className="ml-2 text-[hsl(24,85%,50%)] hover:underline"
            >
              ล้างตัวกรอง
            </button>
          )}
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-10 text-center">
          <p className="text-sm text-[hsl(25,10%,50%)]">ไม่พบบทความที่ตรงกัน</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(article => (
            <div
              key={article.id}
              className="group bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden hover:border-[hsl(35,20%,78%)] hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 px-5 py-4">
                {/* Main content — click area → edit */}
                <Link
                  href={`/articles/${article.id}/edit`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[hsl(25,20%,15%)] group-hover:text-[hsl(24,85%,45%)] transition-colors leading-snug">
                      {article.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      article.status === "published"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {article.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {article.category && (
                      <span className="text-[11px] bg-[hsl(35,30%,94%)] text-[hsl(25,20%,40%)] px-2 py-0.5 rounded-full">
                        {article.category}
                      </span>
                    )}
                    <span className="text-xs text-[hsl(25,10%,65%)]">
                      {new Date(article.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    {article.slug && (
                      <span className="text-[11px] font-mono text-[hsl(25,10%,68%)] truncate max-w-[280px]">
                        /{article.slug}
                      </span>
                    )}
                  </div>
                  {article.excerpt && (
                    <p className="text-xs text-[hsl(25,10%,52%)] mt-1.5 line-clamp-1 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Link href={`/articles/${article.id}/edit`}>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="แก้ไข">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <DeleteArticleButton id={article.id} title={article.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
