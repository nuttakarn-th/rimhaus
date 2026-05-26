export const dynamic = "force-dynamic"

import { getPortfolioItems } from "@/actions/portfolio.actions"
import type { PortfolioItem } from "@/lib/types"

type EmbedPlatform = "youtube" | "tiktok" | "instagram" | "facebook_reel" | "facebook_video" | "facebook_photo" | "other"
type EmbedResult = { platform: EmbedPlatform; embedUrl: string | null }

function getEmbedInfo(url: string): EmbedResult {
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` }

  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/)
  if (ttMatch) return { platform: "tiktok", embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` }

  // Instagram Reel / Post
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/)
  if (igMatch) return { platform: "instagram", embedUrl: `https://www.instagram.com/reel/${igMatch[1]}/embed/` }

  // Facebook Reel (portrait) — reel/ or share/r/
  if (/facebook\.com\/(reel\/|share\/r\/)/.test(url)) {
    return {
      platform: "facebook_reel",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=280`,
    }
  }

  // Facebook regular video — watch, /videos/, share/v/, fb.watch
  if (/facebook\.com\/(watch|share\/v\/|.*\/videos\/)|fb\.watch/.test(url)) {
    return {
      platform: "facebook_video",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`,
    }
  }

  // Facebook photo / album — photo, media/set, share/p/
  if (/facebook\.com\/(photo|media\/set|share\/p\/)/.test(url)) {
    return {
      platform: "facebook_photo",
      embedUrl: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&width=500&show_text=true`,
    }
  }

  return { platform: "other", embedUrl: null }
}

const YT_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
const IG_ALLOW = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"

function ExternalLink({ url, label }: { url: string; label: string }) {
  return (
    <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-[hsl(35,20%,95%)]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(24,85%,50%)] text-white text-sm font-medium hover:bg-[hsl(24,85%,43%)] transition-colors"
      >
        {label} →
      </a>
    </div>
  )
}

function VideoCard({ item }: { item: PortfolioItem }) {
  const { platform, embedUrl } = getEmbedInfo(item.url)
  const isFacebook = platform === "facebook_reel" || platform === "facebook_video"

  return (
    <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
      {isFacebook ? (
        <ExternalLink url={item.url} label="ดูใน Facebook" />
      ) : platform === "instagram" && embedUrl ? (
        // Clip Instagram footer UI (likes/comments) — show video portion only
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "9/16", maxWidth: 280, margin: "0 auto" }}
        >
          <iframe
            src={embedUrl}
            title={item.title ?? "video"}
            allow={IG_ALLOW}
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            scrolling="no"
            className="absolute top-0 left-0 w-full border-0"
            style={{ height: "calc(100% + 210px)" }}
          />
        </div>
      ) : embedUrl ? (
        <div className={`relative w-full ${platform === "tiktok" ? "aspect-[9/16] max-w-[280px] mx-auto" : "aspect-video"}`}>
          <iframe
            src={embedUrl}
            title={item.title ?? "video"}
            allow={YT_ALLOW}
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      ) : (
        <ExternalLink url={item.url} label="ดูวิดีโอ" />
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
  const { platform } = getEmbedInfo(item.url)

  if (platform === "facebook_photo") {
    return (
      <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
        <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-[hsl(35,20%,95%)]">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(24,85%,50%)] text-white text-sm font-medium hover:bg-[hsl(24,85%,43%)] transition-colors"
          >
            ดูรูปใน Facebook →
          </a>
        </div>
        {item.title && (
          <div className="px-4 py-2.5">
            <p className="text-sm font-medium text-[hsl(25,20%,15%)]">{item.title}</p>
          </div>
        )}
      </div>
    )
  }

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
          <div className="grid grid-cols-2 gap-4 items-start">
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
