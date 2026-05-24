"use client"

import { useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"

const MAX_KB = 100

async function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = e => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const tryEncode = (w: number, h: number, q: number) => {
          const canvas = document.createElement("canvas")
          canvas.width = w; canvas.height = h
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
          return canvas.toDataURL("image/jpeg", q)
        }

        let w = img.naturalWidth, h = img.naturalHeight
        if (w > 1200) { h = Math.round(h * 1200 / w); w = 1200 }
        if (h > 1200) { w = Math.round(w * 1200 / h); h = 1200 }

        const sizeKB = (s: string) => (s.length * 3) / 4 / 1024

        // Try quality reduction first
        for (const q of [0.85, 0.7, 0.55, 0.4, 0.3, 0.2, 0.1]) {
          const data = tryEncode(w, h, q)
          if (sizeKB(data) <= MAX_KB) { resolve(data); return }
        }
        // Try dimension reduction
        for (const s of [0.7, 0.5, 0.35, 0.25]) {
          const data = tryEncode(Math.round(w * s), Math.round(h * s), 0.5)
          if (sizeKB(data) <= MAX_KB) { resolve(data); return }
        }
        resolve(tryEncode(300, Math.round(300 * h / w), 0.3))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

type Props = {
  images: string[]
  onChange: (images: string[]) => void
}

export function PhotoAlbumUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (images.length + files.length > 20) {
      toast.error("อัปโหลดได้สูงสุด 20 ภาพ")
      e.target.value = ""
      return
    }
    try {
      const compressed = await Promise.all(files.map(f => compressToBase64(f)))
      onChange([...images, ...compressed])
    } catch {
      toast.error("เกิดข้อผิดพลาดในการประมวลผลภาพ")
    }
    e.target.value = ""
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx))
  }

  function moveImage(from: number, to: number) {
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {/* Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-[hsl(35,20%,88%)] bg-[hsl(35,30%,97%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`ภาพที่ ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Order label */}
              <div className="absolute bottom-1 left-1 text-xs bg-black/50 text-white rounded px-1 py-0.5 font-mono">
                {idx + 1}
              </div>
              {/* Move left/right */}
              <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {idx > 0 && (
                  <button type="button" onClick={() => moveImage(idx, idx - 1)}
                    className="w-5 h-5 bg-black/60 text-white rounded text-xs flex items-center justify-center hover:bg-black/80">
                    ←
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(idx, idx + 1)}
                    className="w-5 h-5 bg-black/60 text-white rounded text-xs flex items-center justify-center hover:bg-black/80">
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* Add more button (in grid) */}
          {images.length < 20 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-[hsl(35,20%,82%)] hover:border-[hsl(24,85%,50%)] hover:bg-orange-50 transition-colors flex flex-col items-center justify-center gap-1 text-[hsl(25,10%,60%)] hover:text-[hsl(24,85%,50%)]"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs">เพิ่มภาพ</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state upload area */}
      {images.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-[hsl(35,20%,82%)] hover:border-[hsl(24,85%,50%)] hover:bg-orange-50 transition-colors rounded-xl py-10 flex flex-col items-center gap-2 text-[hsl(25,10%,55%)] hover:text-[hsl(24,85%,50%)]"
        >
          <ImagePlus className="w-8 h-8" />
          <span className="text-sm font-medium">คลิกเพื่ออัปโหลดภาพ</span>
          <span className="text-xs text-[hsl(25,10%,65%)]">รองรับ JPG, PNG, WebP — อัดบีบอัตโนมัติ ≤ {MAX_KB}KB/ภาพ, สูงสุด 20 ภาพ</span>
        </button>
      )}

      {images.length > 0 && (
        <p className="text-xs text-[hsl(25,10%,60%)]">
          {images.length} ภาพ · กด × เพื่อลบ · กด ← → เพื่อเรียงลำดับ · บีบอัดแล้ว ≤{MAX_KB}KB/ภาพ
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  )
}
