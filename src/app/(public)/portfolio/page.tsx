export const dynamic = "force-dynamic"

import { getPortfolioItems } from "@/actions/portfolio.actions"
import type { PortfolioItem } from "@/lib/types"

// ─── Video Card — 9:16, Inter ExtraBold title centered large ────────────────

function VideoCard({ item }: { item: PortfolioItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ aspectRatio: "9/16" }}
    >
      {/* Thumbnail */}
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.title ?? ""} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[hsl(25,15%,14%)]" />
      )}

      {/* Full overlay gradient for title readability */}
      {item.title && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      )}

      {/* Play button — center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/35 transition-colors border border-white/30">
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Title — Inter ExtraBold, centered, large */}
      {item.title && (
        <div className="absolute inset-x-0 bottom-0 px-3 pb-4 text-center">
          <p
            className="text-white text-base leading-tight drop-shadow-lg line-clamp-3"
            style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)", fontWeight: 800 }}
          >
            {item.title}
          </p>
        </div>
      )}
    </a>
  )
}

// ─── Photo Card — 4:5, no title overlay, link icon top-right ────────────────

function PhotoCard({ item }: { item: PortfolioItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ aspectRatio: "4/5" }}
    >
      {/* Thumbnail */}
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.title ?? ""} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[hsl(35,20%,90%)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[hsl(35,20%,75%)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      )}

      {/* Top gradient for icon readability */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/25 to-transparent" />

      {/* External link icon — top right */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/40 transition-colors border border-white/20">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
    </a>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PortfolioPage() {
  const items = await getPortfolioItems()
  const videos = items.filter(i => i.type === "video")
  const photos = items.filter(i => i.type === "photo")

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[hsl(25,10%,50%)]">ยังไม่มีตัวอย่าง Content</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-xl font-black text-[hsl(25,20%,15%)]">ตัวอย่าง Content ที่เคยทำ</h1>
      </div>

      {videos.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-[hsl(25,20%,15%)] text-sm border-l-4 border-[hsl(24,85%,50%)] pl-2.5">
            Short VDO
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {videos.map(item => <VideoCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-[hsl(25,20%,15%)] text-sm border-l-4 border-[hsl(24,85%,50%)] pl-2.5">
            Photo Album
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map(item => <PhotoCard key={item.id} item={item} />)}
          </div>
        </section>
      )}
    </div>
  )
}
