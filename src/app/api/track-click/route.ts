import { NextRequest, NextResponse } from "next/server"
import { createPublicClient } from "@/lib/supabase/public"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("p")
  const generationId = searchParams.get("g")
  const sessionId = searchParams.get("s") ?? "unknown"
  const affiliateUrl = searchParams.get("url")

  if (productId) {
    try {
      const supabase = createPublicClient()
      await supabase.from("ai_product_clicks").insert({
        product_id: productId,
        generation_id: generationId || null,
        session_id: sessionId,
      })
    } catch (e) {
      console.error("Track click error:", e)
    }
  }

  if (!affiliateUrl) {
    return NextResponse.json({ error: "no url" }, { status: 400 })
  }

  return NextResponse.redirect(decodeURIComponent(affiliateUrl))
}
