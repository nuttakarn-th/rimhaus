import { NextRequest, NextResponse } from "next/server"

// Fetch OG image from a product URL (Shopee / Lazada short links)
// Returns { imageUrl: string | null }
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) return NextResponse.json({ imageUrl: null })

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "th,en;q=0.5",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return NextResponse.json({ imageUrl: null })

    const html = await res.text()

    // Extract og:image meta tag
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

    const imageUrl = match?.[1] ?? null

    return NextResponse.json({ imageUrl }, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    })
  } catch {
    return NextResponse.json({ imageUrl: null })
  }
}
