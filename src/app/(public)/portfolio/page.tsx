import Image from "next/image"
import { getPublicPortfolioItems } from "@/lib/public-data"
import type { PortfolioItem } from "@/lib/types"

const ARROW = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
)

function VideoCard({ item }: { item: PortfolioItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden bg-[hsl(25,20%,18%)]"
    >
      {item.image_url && (
        <Image
          src={item.image_url}
          alt={item.title ?? ""}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 33vw, 25vw"
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
      {/* ↗ */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-black opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 transition-all duration-200">
        {ARROW}
      </div>
    </a>
  )
}

function PhotoCard({ item }: { item: PortfolioItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden bg-[hsl(35,20%,88%)]"
    >
      {item.image_url && (
        <Image
          src={item.image_url}
          alt={item.title ?? ""}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 33vw, 25vw"
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
      {/* ↗ */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-black opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 transition-all duration-200">
        {ARROW}
      </div>
    </a>
  )
}

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

      {/* ── VDO section — dark ─────────────────────────── */}
      {videos.length > 0 && (
        <section className="bg-[hsl(25,20%,12%)] w-full">
          <div className="px-4 pt-5 pb-3 flex items-baseline gap-2">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/30">SHORT VDO</p>
            <sup className="text-[9px] text-white/20">{videos.length}</sup>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-[hsl(25,20%,22%)]">
            {videos.map(item => <VideoCard key={item.id} item={item} />)}
          </div>
        </section>
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

      {/* ── Photo section — light ──────────────────────── */}
      {photos.length > 0 && (
        <section className="bg-background">
          <div className="px-4 pt-2 pb-3 flex items-baseline gap-2">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/50">PHOTO</p>
            <sup className="text-[9px] text-muted-foreground">{photos.length}</sup>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-border">
            {photos.map(item => <PhotoCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      <div className="pb-10 bg-background" />

    </div>
  )
}
