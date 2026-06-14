import { getPublicPortfolioItems } from "@/lib/public-data"
import { PortfolioSection } from "@/components/portfolio/PortfolioSection"

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
    <div>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="px-4 pt-10 pb-6 text-center bg-background">
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

      {/* ── VDO — dark ─────────────────────────────────── */}
      {videos.length > 0 && (
        <PortfolioSection items={videos} dark label="SHORT VDO" />
      )}

      {/* ── Editorial separator ─────────────────────────── */}
      {videos.length > 0 && photos.length > 0 && (
        <div className="py-10 sm:py-14 px-6 text-center bg-background">
          <p
            className="text-3xl sm:text-[2.5rem] leading-snug text-foreground/50 max-w-sm mx-auto"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            Content that moves. Content that stays.
          </p>
        </div>
      )}

      {/* ── Photo — light ──────────────────────────────── */}
      {photos.length > 0 && (
        <PortfolioSection items={photos} dark={false} label="PHOTO" />
      )}

      <div className="pb-10 bg-background" />

    </div>
  )
}
