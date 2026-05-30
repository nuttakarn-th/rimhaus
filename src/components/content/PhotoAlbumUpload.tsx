"use client"

import { useRef, useState } from "react"
import { ImagePlus, X, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const BUCKET = "content-images"

async function resizeForPreview(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load failed")) }
    img.onload = () => {
      URL.revokeObjectURL(url)
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > 1200) { h = Math.round(h * 1200 / w); w = 1200 }
      if (h > 1200) { w = Math.round(w * 1200 / h); h = 1200 }
      const canvas = document.createElement("canvas")
      canvas.width = w; canvas.height = h
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/jpeg", 0.82)
    }
    img.src = url
  })
}

type Props = {
  images: string[]
  onChange: (images: string[]) => void
}

export function PhotoAlbumUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (images.length + files.length > 20) {
      toast.error("อัปโหลดได้สูงสุด 20 ภาพ")
      e.target.value = ""
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("กรุณาเข้าสู่ระบบ"); return }

    setUploading({ done: 0, total: files.length })
    const urls: string[] = []

    try {
      for (const file of files) {
        // Resize to max 1200px before uploading
        const blob = await resizeForPreview(file)
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { contentType: "image/jpeg", upsert: false })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path)

        urls.push(publicUrl)
        setUploading(p => p ? { ...p, done: p.done + 1 } : null)
      }
      onChange([...images, ...urls])
    } catch (err) {
      console.error(err)
      toast.error("อัปโหลดภาพไม่สำเร็จ กรุณาลองใหม่")
    }

    setUploading(null)
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
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 text-xs bg-black/50 text-white rounded px-1 py-0.5 font-mono">
                {idx + 1}
              </div>
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
          {images.length < 20 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={!!uploading}
              className="aspect-square rounded-lg border-2 border-dashed border-[hsl(35,20%,82%)] hover:border-[hsl(24,85%,50%)] hover:bg-orange-50 transition-colors flex flex-col items-center justify-center gap-1 text-[hsl(25,10%,60%)] hover:text-[hsl(24,85%,50%)] disabled:opacity-50"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs">เพิ่มภาพ</span>
            </button>
          )}
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-[hsl(25,10%,50%)] py-2">
          <Loader2 className="w-4 h-4 animate-spin text-[hsl(24,85%,50%)]" />
          <span>อัปโหลด {uploading.done}/{uploading.total} ภาพ...</span>
          <div className="flex-1 h-1.5 bg-[hsl(35,25%,90%)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(24,85%,50%)] rounded-full transition-all duration-300"
              style={{ width: `${(uploading.done / uploading.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-[hsl(35,20%,82%)] hover:border-[hsl(24,85%,50%)] hover:bg-orange-50 transition-colors rounded-xl py-10 flex flex-col items-center gap-2 text-[hsl(25,10%,55%)] hover:text-[hsl(24,85%,50%)]"
        >
          <ImagePlus className="w-8 h-8" />
          <span className="text-sm font-medium">คลิกเพื่ออัปโหลดภาพ</span>
          <span className="text-xs text-[hsl(25,10%,65%)]">รองรับ JPG, PNG, WebP, HEIC · สูงสุด 20MB/ภาพ · 20 ภาพ</span>
        </button>
      )}

      {images.length > 0 && !uploading && (
        <p className="text-xs text-[hsl(25,10%,60%)] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          {images.length} ภาพ · กด × เพื่อลบ · กด ← → เพื่อเรียงลำดับ
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
