import { getPublicPortfolioItems } from "@/lib/public-data"
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid"

export default async function PortfolioPage() {
  const items = await getPublicPortfolioItems()
  const videos = items.filter(i => i.type === "video")
  const photos = items.filter(i => i.type === "photo")

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
        <h1
          className="text-5xl text-foreground"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
        >
          Portfolio
        </h1>
        <p className="text-sm text-muted-foreground">ยังไม่มีตัวอย่าง Content</p>
      </div>
    )
  }

  return (
    <div className="pb-10">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="px-4 pt-10 pb-6 text-center">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60 mb-2">CONTENT</p>
        <h1
          className="text-5xl sm:text-7xl text-foreground leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
        >
          Portfolio
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          {videos.length > 0 && `${videos.length} VDO`}
          {videos.length > 0 && photos.length > 0 && " · "}
          {photos.length > 0 && `${photos.length} Photo`}
        </p>
      </div>

      {/* ── Grid + Filter (client) ──────────────────────── */}
      <PortfolioGrid items={items} />

    </div>
  )
}
