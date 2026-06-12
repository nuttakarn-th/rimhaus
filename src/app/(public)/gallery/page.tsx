import Link from "next/link"
import Image from "next/image"
import { getPublicAlbumsWithItems } from "@/lib/public-data"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"
import { FolderOpen } from "lucide-react"

export default async function GalleryPage() {
  const albums = await getPublicAlbumsWithItems()

  if (albums.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[hsl(25,20%,12%)] tracking-tight">Gallery</h1>
        </div>
        <div className="text-center py-16">
          <p className="text-[hsl(25,10%,60%)]">ยังไม่มีรูปใน Gallery</p>
        </div>
      </div>
    )
  }

  const totalPhotos = albums.reduce((sum, a) => sum + a.items.length, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[hsl(25,20%,12%)] tracking-tight">Gallery</h1>
        <p className="text-sm text-[hsl(25,10%,55%)] mt-1">
          {albums.length} อัลบั้ม · {totalPhotos} ภาพ
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {albums.map(album => {
          const cover = album.items.find(i => i.image_url) ?? null
          return (
            <Link key={album.id} href={`/gallery/${album.id}`} className="group block">
              <div className="rounded-2xl overflow-hidden border-2 border-[hsl(35,20%,90%)] group-hover:border-[hsl(24,85%,50%)] transition-colors shadow-sm">
                {/* Cover image */}
                <div className="aspect-[4/3] bg-[hsl(35,30%,93%)] relative overflow-hidden">
                  {cover ? (
                    <Image
                      src={cover.image_url}
                      alt={album.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-10 h-10 text-[hsl(35,20%,75%)]" />
                    </div>
                  )}
                  {/* Multi-photo hint strip */}
                  {album.items.length > 1 && (
                    <div className="absolute bottom-0 inset-x-0 h-2 flex gap-0.5 px-1 pb-1">
                      {album.items.slice(1, 4).map((item, i) => (
                        <img
                          key={i}
                          src={item.image_url}
                          alt=""
                          className="flex-1 h-full object-cover rounded-sm opacity-70"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Album info */}
                <div className="px-3 py-2.5 bg-white">
                  <p className="text-sm font-bold text-[hsl(25,20%,12%)] truncate group-hover:text-[hsl(24,85%,50%)] transition-colors">
                    {album.name}
                  </p>
                  <p className="text-[11px] text-[hsl(25,10%,55%)] mt-0.5">{album.items.length} ภาพ</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
