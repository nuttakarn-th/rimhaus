export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { getAlbumsWithItems } from "@/actions/gallery.actions"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"
import { ChevronLeft } from "lucide-react"

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const albums = await getAlbumsWithItems()
  const album = albums.find(a => a.id === albumId)
  if (!album) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/gallery"
        className="inline-flex items-center gap-1 text-sm text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)] mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        กลับ Gallery
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[hsl(25,20%,12%)] tracking-tight">{album.name}</h1>
        <p className="text-sm text-[hsl(25,10%,55%)] mt-1">{album.items.length} ภาพ</p>
      </div>

      {album.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[hsl(25,10%,60%)]">ยังไม่มีรูปใน Album นี้</p>
        </div>
      ) : (
        <GalleryGrid items={album.items} />
      )}
    </div>
  )
}
