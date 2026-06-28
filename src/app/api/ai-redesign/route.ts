import { NextRequest, NextResponse } from "next/server"
import { createPublicClient } from "@/lib/supabase/public"
import { AI_STYLES, AI_ROOM_TYPES, AI_VIBES } from "@/lib/constants/ai-redesign"

export const maxDuration = 90

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, style, roomType, vibe, sessionId } = await req.json()

    const styleObj = AI_STYLES.find(s => s.key === style) ?? AI_STYLES[0]
    const roomObj = AI_ROOM_TYPES.find(r => r.key === roomType)
    const vibeObj = AI_VIBES.find(v => v.key === vibe)

    const prompt = [
      `Transform this room into a ${roomObj?.label ?? "room"} interior.`,
      styleObj.prompt,
      vibeObj?.prompt ?? "",
      "Professional interior photography, high quality, realistic, 8k",
    ].filter(Boolean).join(". ")

    let generatedImage: string | null = null

    const hfToken = process.env.HF_TOKEN
    if (hfToken) {
      try {
        const response = await fetch(
          "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                image: imageBase64,
                num_inference_steps: 20,
                image_guidance_scale: 1.5,
                guidance_scale: 7,
              },
            }),
            signal: AbortSignal.timeout(75000),
          }
        )
        if (response.ok) {
          const blob = await response.blob()
          const buf = Buffer.from(await blob.arrayBuffer())
          generatedImage = `data:image/jpeg;base64,${buf.toString("base64")}`
        }
      } catch (e) {
        console.error("HF generation error:", e)
      }
    }

    // Select products (65% chance)
    const showProducts = Math.random() < 0.65
    let products: Record<string, unknown>[] = []

    const supabase = createPublicClient()
    if (showProducts) {
      const { data } = await supabase
        .from("ai_products")
        .select("*")
        .eq("is_active", true)
        .or(`room_types.cs.{"${roomType}"},style_tags.cs.{"${style}"}`)
        .limit(20)

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        products = shuffled.slice(0, Math.floor(Math.random() * 3) + 2)
      }
    }

    const productIds = products.map(p => p.id)
    const { data: generation } = await supabase
      .from("ai_generations")
      .insert({
        session_id: sessionId ?? "unknown",
        style,
        room_type: roomType,
        vibe: vibe ?? null,
        generated_image_url: generatedImage,
        products_shown: productIds,
      })
      .select("id")
      .single()

    return NextResponse.json({
      generatedImage,
      products,
      generationId: generation?.id ?? null,
    })
  } catch (e) {
    console.error("AI redesign error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
