"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pencil, Search, X, ImageIcon, Globe, Trash2, ArrowUpDown } from "lucide-react"
import { DeleteArticleButton } from "@/components/articles/DeleteArticleButton"
import { bulkDeleteArticles, bulkUpdateArticleStatus } from "@/actions/article.actions"
import { toast } from "sonner"
import type { Article } from "@/lib/types"

type StatusFilter = "all" | "published" | "draft"
type SortKey = "newest" | "oldest" | "title_asc" | "title_desc"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "ล่าสุดก่อน" },
  { key: "oldest", label: "เก่าสุดก่อน" },
  { key: "title_asc", label: "ชื่อ A → Z" },
  { key: "title_desc", label: "ชื่อ Z → A" },
]

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "published", label: "เผยแพร่แล้ว" },
  { key: "draft", label: "ฉบับร่าง" },
]

export function ArticleList({ articles }: { articles: Article[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("newest")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const counts = useMemo(() => ({
    all: articles.length,
    published: articles.filter(a => a.status === "published").length,
    draft: articles.filter(a => a.status === "draft").length,
  }), [articles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = articles.filter(a => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false
      if (q && !a.title.toLowerCase().includes(q) && !(a.category ?? "").toLowerCase().includes(q)) return false
      return true
    })
    return list.sort((a, b) => {
      if (sortKey === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortKey === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortKey === "title_asc") return a.title.localeCompare(b.title, "th")
      if (sortKey === "title_desc") return b.title.localeCompare(a.title, "th")
      return 0
    })
  }, [articles, query, statusFilter, sortKey])

  const allFilteredSelected = filtered.length > 0 && filtered.every(a => selected.has(a.id))
  const someSelected = selected.size > 0

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(a => a.id)))
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleBulkPublish() {
    setBulkLoading(true)
    const result = await bulkUpdateArticleStatus([...selected], "published")
    setBulkLoading(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(`เผยแพร่ ${selected.size} บทความสำเร็จ`)
    setSelected(new Set())
    router.refresh()
  }

  async function handleBulkDelete() {
    if (!confirm(`ลบ ${selected.size} บทความที่เลือก? ไม่สามารถย้อนกลับได้`)) return
    setBulkLoading(true)
    const result = await bulkDeleteArticles([...selected])
    setBulkLoading(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(`ลบ ${selected.size} บทความสำเร็จ`)
    setSelected(new Set())
    router.refresh()
  }

  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(25,10%,60%)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อหรือหมวดหมู่..."
            className="w-full pl-8 pr-8 py-2 text-sm border border-[hsl(35,20%,85%)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)] focus:border-transparent placeholder:text-[hsl(25,10%,65%)]"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(25,10%,60%)] hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[hsl(35,20%,85%)] rounded-lg bg-white text-xs text-[hsl(25,10%,45%)]">
          <ArrowUpDown className="w-3 h-3 shrink-0" />
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="bg-transparent focus:outline-none text-xs text-[hsl(25,20%,25%)] cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-0.5 bg-[hsl(35,25%,94%)] rounded-lg p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab.key} type="button" onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-white text-[hsl(25,20%,15%)] shadow-sm"
                  : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,20%)]"
              }`}>
              {tab.label}
              <span className={`ml-1 text-[10px] ${statusFilter === tab.key ? "text-[hsl(24,85%,50%)]" : "text-[hsl(25,10%,65%)]"}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {someSelected ? (
        <div className="flex items-center gap-3 bg-[hsl(24,85%,50%)] text-white rounded-xl px-4 py-2.5">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-white cursor-pointer shrink-0"
          />
          <span className="text-sm font-medium flex-1">
            {selected.size} บทความที่เลือก
          </span>
          <Button
            size="sm"
            onClick={handleBulkPublish}
            disabled={bulkLoading}
            className="bg-white/20 hover:bg-white/30 text-white border-0 h-7 text-xs font-semibold"
          >
            <Globe className="w-3.5 h-3.5 mr-1" />
            เผยแพร่
          </Button>
          <Button
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkLoading}
            className="bg-white/20 hover:bg-red-500/80 text-white border-0 h-7 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            ลบ
          </Button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            disabled={bulkLoading}
            className="text-white/80 hover:text-white text-xs ml-1"
          >
            ยกเลิก
          </button>
        </div>
      ) : (
        /* Select-all row + result count */
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[hsl(24,85%,50%)] cursor-pointer"
            />
            <span className="text-xs text-[hsl(25,10%,55%)]">เลือกทั้งหมด</span>
          </label>
          {(query || statusFilter !== "all") && (
            <>
              <span className="text-[hsl(35,20%,80%)]">·</span>
              <span className="text-xs text-[hsl(25,10%,55%)]">พบ {filtered.length} รายการ</span>
              <button type="button" onClick={() => { setQuery(""); setStatusFilter("all") }}
                className="text-xs text-[hsl(24,85%,50%)] hover:underline">
                ล้างตัวกรอง
              </button>
            </>
          )}
        </div>
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
              className={`group bg-white rounded-xl border overflow-hidden hover:shadow-sm transition-all ${
                selected.has(article.id)
                  ? "border-[hsl(24,85%,50%)] bg-[hsl(24,85%,99%)]"
                  : "border-[hsl(35,20%,88%)] hover:border-[hsl(35,20%,78%)]"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">

                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(article.id)}
                  onChange={() => toggleSelect(article.id)}
                  className="w-4 h-4 accent-[hsl(24,85%,50%)] cursor-pointer shrink-0"
                />

                {/* Thumbnail */}
                <Link href={`/articles/${article.id}/edit`} className="shrink-0">
                  <div className="w-20 h-[54px] rounded-lg overflow-hidden bg-[hsl(35,25%,94%)] flex items-center justify-center">
                    {article.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.cover_image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[hsl(35,20%,75%)]" />
                    )}
                  </div>
                </Link>

                {/* Content */}
                <Link href={`/articles/${article.id}/edit`} className="flex-1 min-w-0">
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
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {article.category && (
                      <span className="text-[11px] bg-[hsl(35,30%,94%)] text-[hsl(25,20%,40%)] px-2 py-0.5 rounded-full">
                        {article.category}
                      </span>
                    )}
                    <span className="text-[11px] text-[hsl(25,10%,65%)]">
                      {new Date(article.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    {article.slug && (
                      <span className="text-[11px] font-mono text-[hsl(25,10%,68%)] truncate max-w-[240px]">
                        /{article.slug}
                      </span>
                    )}
                  </div>
                  {article.excerpt && (
                    <p className="text-[11px] text-[hsl(25,10%,55%)] mt-1 line-clamp-1 leading-relaxed">
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
