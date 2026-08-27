import { NextRequest, NextResponse } from "next/server"

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
  "Accept-Language": "th,en;q=0.5",
}

function shopeeImageUrl(hash: string) {
  return `https://down-th.img.susercontent.com/file/${hash}`
}

async function resolveUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS, redirect: "follow", method: "HEAD",
      signal: AbortSignal.timeout(6000),
    })
    return res.url
  } catch {
    return url
  }
}

async function tryShopeeApi(fullUrl: string): Promise<string | null> {
  const match =
    fullUrl.match(/[\-\/]i\.(\d+)\.(\d+)/i) ??
    fullUrl.match(/\/product\/(\d+)\/(\d+)/i)
  if (!match) return null
  const [, shopId, itemId] = match
  try {
    const res = await fetch(
      `https://shopee.co.th/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`,
      {
        headers: { ...FETCH_HEADERS, "Referer": "https://shopee.co.th/", "X-Api-Source": "pc" },
        signal: AbortSignal.timeout(6000),
      }
    )
    if (!res.ok) return null
    const json = await res.json()
    const images: string[] = json?.data?.images ?? []
    return images.length > 0 ? shopeeImageUrl(images[0]) : null
  } catch { return null }
}

async function tryOgFromHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, redirect: "follow", signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const html = await res.text()
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return m?.[1] ?? null
  } catch { return null }
}

// GET /api/og?url=... → { imageUrl: string | null }
// GET /api/og?proxy=... → proxies image bytes (avoids CORS)
export async function GET(req: NextRequest) {
  const proxyUrl = req.nextUrl.searchParams.get("proxy")
  if (proxyUrl) {
    // Image proxy mode — fetch image and stream back
    try {
      const imgRes = await fetch(proxyUrl, {
        headers: { ...FETCH_HEADERS, "Accept": "image/*" },
        signal: AbortSignal.timeout(8000),
      })
      if (!imgRes.ok) return new NextResponse(null, { status: 404 })
      const contentType = imgRes.headers.get("content-type") ?? "image/jpeg"
      const buffer = await imgRes.arrayBuffer()
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=604800, immutable",
        },
      })
    } catch {
      return new NextResponse(null, { status: 502 })
    }
  }

  const url = req.nextUrl.searchParams.get("url")
  if (!url) return NextResponse.json({ imageUrl: null })

  try {
    const resolvedUrl = await resolveUrl(url)
    let imageUrl: string | null = null

    if (resolvedUrl.includes("shopee")) {
      imageUrl = await tryShopeeApi(resolvedUrl)
      if (!imageUrl) imageUrl = await tryOgFromHtml(resolvedUrl)
    } else {
      imageUrl = await tryOgFromHtml(resolvedUrl)
    }

    // Rewrite image URL to go through our proxy (avoids CORS on Shopee/Lazada CDN)
    if (imageUrl) {
      imageUrl = `/api/og?proxy=${encodeURIComponent(imageUrl)}`
    }

    return NextResponse.json({ imageUrl }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    })
  } catch {
    return NextResponse.json({ imageUrl: null })
  }
}
