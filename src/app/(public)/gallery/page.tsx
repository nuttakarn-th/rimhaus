export const dynamic = "force-dynamic"

import { getGalleryItems } from "@/actions/gallery.actions"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"

export default async function GalleryPage() {
  const items = await getGalleryItems()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[hsl(25,20%,12%)] tracking-tight">Gallery</h1>
        <p className="text-sm text-[hsl(25,10%,55%)] mt-1">{items.length} ภาพ</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[hsl(25,10%,60%)]">ยังไม่มีรูปใน Gallery</p>
        </div>
      ) : (
        <GalleryGrid items={items} />
      )}
    </div>
  )
}
