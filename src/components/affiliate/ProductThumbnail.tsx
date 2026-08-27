"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

interface Props {
  productId: string
  url: string | null  // shopee_url or lazada_url
  name: string
}

export function ProductThumbnail({ productId, url, name }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!url) { setFailed(true); return }

    // Check localStorage cache first
    const cacheKey = `og_${productId}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached === "null") { setFailed(true); return }
      if (cached) { setImgSrc(cached); return }
    } catch { /* ignore */ }

    // Fetch from API route
    let cancelled = false
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(({ imageUrl }: { imageUrl: string | null }) => {
        if (cancelled) return
        try { localStorage.setItem(cacheKey, imageUrl ?? "null") } catch { /* ignore */ }
        if (imageUrl) setImgSrc(imageUrl)
        else setFailed(true)
      })
      .catch(() => { if (!cancelled) setFailed(true) })

    return () => { cancelled = true }
  }, [productId, url])

  if (failed || (!imgSrc && !loaded)) {
    return (
      <div className="w-10 h-10 rounded-lg bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,20%)] flex items-center justify-center shrink-0">
        {failed
          ? <ShoppingBag className="w-4 h-4 text-[hsl(25,10%,55%)]" />
          : <div className="w-4 h-4 rounded-full border-2 border-[hsl(25,10%,60%)] border-t-transparent animate-spin" />
        }
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,20%)]">
      {imgSrc && (
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover"
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setImgSrc(null) }}
        />
      )}
    </div>
  )
}
