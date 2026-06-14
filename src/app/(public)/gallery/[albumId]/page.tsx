import Link from "next/link"
import { notFound } from "next/navigation"
import { getPublicAlbumsWithItems } from "@/lib/public-data"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"
import { ChevronLeft } from "lucide-react"

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const albums = await getPublicAlbumsWithItems()
  const album = albums.find(a => a.id === albumId)
  if (!album) notFound()

  return (
    <div className="pb-16">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-4 pt-8 pb-6">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          กลับ Gallery
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60 mb-2">ALBUM</p>
          <h1
            className="text-4xl sm:text-5xl text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            {album.name}
          </h1>
          {album.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{album.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{album.items.length} ภาพ</p>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────── */}
      {album.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">ยังไม่มีรูปใน Album นี้</p>
        </div>
      ) : (
        <GalleryGrid items={album.items} />
      )}
    </div>
  )
}
