export const dynamic = "force-dynamic"

import { getGalleryItems } from "@/actions/gallery.actions"

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
        <div className="grid grid-cols-3 gap-2">
          {items.map(item => (
            <div
              key={item.id}
              className="relative group overflow-hidden rounded-2xl aspect-square bg-[hsl(35,30%,93%)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.caption ?? ""}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
