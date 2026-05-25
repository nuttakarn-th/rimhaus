export const dynamic = "force-dynamic"

import { getPortfolioItems } from "@/actions/portfolio.actions"
import type { PortfolioItem } from "@/lib/types"

type EmbedResult =
  | { platform: "youtube" | "tiktok"; embedUrl: string }
  | { platform: "other"; embedUrl: null }

function getEmbedInfo(url: string): EmbedResult {
  const ytMatch = url.match(/(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` }

  const ttMatch = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/)
  if (ttMatch) return { platform: "tiktok", embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` }

  return { platform: "other", embedUrl: null }
}

function VideoCard({ item }: { item: PortfolioItem }) {
  const info = getEmbedInfo(item.url)
  const isTikTok = info.platform === "tiktok"

  return (
    <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
      {info.embedUrl ? (
        <div className={`relative w-full ${isTikTok ? "aspect-[9/16] max-w-[280px] mx-auto" : "aspect-video"}`}>
          <iframe
            src={info.embedUrl}
            title={item.title ?? "video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-[hsl(35,20%,95%)]">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[hsl(24,85%,50%)] underline underline-offset-2"
          >
            ดูวิดีโอ →
          </a>
        </div>
      )}
      {item.title && (
        <div className="px-4 py-2.5">
          <p className="text-sm font-medium text-[hsl(25,20%,15%)]">{item.title}</p>
        </div>
      )}
    </div>
  )
}

function PhotoCard({ item }: { item: PortfolioItem }) {
  return (
    <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt={item.title ?? ""} className="w-full object-cover" />
      {item.title && (
        <div className="px-4 py-2.5">
          <p className="text-sm font-medium text-[hsl(25,20%,15%)]">{item.title}</p>
        </div>
      )}
    </div>
  )
}

export default async function PortfolioPage() {
  const items = await getPortfolioItems()
  const videos = items.filter(i => i.type === "video")
  const photos = items.filter(i => i.type === "photo")

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-[hsl(25,10%,50%)]">ยังไม่มีตัวอย่าง Content</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[hsl(25,20%,15%)]">ตัวอย่าง Content ที่เคยทำ</h1>
      </div>

      {videos.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold text-[hsl(25,20%,15%)] text-lg border-l-4 border-[hsl(24,85%,50%)] pl-3">
            Short VDO
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {videos.map(item => <VideoCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold text-[hsl(25,20%,15%)] text-lg border-l-4 border-[hsl(24,85%,50%)] pl-3">
            Photo Album
          </h2>
          <div className="columns-2 gap-4">
            {photos.map(item => (
              <div key={item.id} className="mb-4 break-inside-avoid">
                <PhotoCard item={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
