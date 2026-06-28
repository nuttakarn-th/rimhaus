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

    const promptText = [
      styleObj.prompt,
      vibeObj?.prompt ?? "",
      "professional interior photography, high quality, realistic, 8k",
    ].filter(Boolean).join(", ")

    const instructPrompt = [
      `Transform this into a ${roomObj?.label ?? "room"} interior.`,
      styleObj.prompt,
      vibeObj?.prompt ?? "",
      "Professional interior photography, high quality, realistic, 8k",
    ].filter(Boolean).join(". ")

    let generatedImage: string | null = null

    // Attempt 1: HuggingFace instruct-pix2pix (img2img, requires HF_TOKEN)
    const hfToken = process.env.HF_TOKEN
    if (hfToken && imageBase64) {
      try {
        // Strip data URL prefix — HF API expects raw base64 only
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
        const response = await fetch(
          "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfToken}`,
              "Content-Type": "application/json",
              "X-Wait-For-Model": "true",
            },
            body: JSON.stringify({
              inputs: instructPrompt,
              parameters: {
                image: base64Data,
                num_inference_steps: 20,
                image_guidance_scale: 1.5,
                guidance_scale: 7,
              },
            }),
            signal: AbortSignal.timeout(70000),
          }
        )
        if (response.ok) {
          const blob = await response.blob()
          const buf = Buffer.from(await blob.arrayBuffer())
          generatedImage = `data:image/jpeg;base64,${buf.toString("base64")}`
        } else {
          console.error("HF API error:", response.status, await response.text().catch(() => ""))
        }
      } catch (e) {
        console.error("HF generation error:", e)
      }
    }

    // Attempt 2: Pollinations.ai (free, no token, text-to-image fallback)
    if (!generatedImage) {
      try {
        const seed = Math.floor(Math.abs(Date.now() % 999983))
        const pollinationsPrompt = encodeURIComponent(
          `${roomObj?.label ?? "interior room"}, ${promptText}, no people, no text`
        )
        const url = `https://image.pollinations.ai/prompt/${pollinationsPrompt}?width=768&height=576&nologo=true&seed=${seed}&model=flux`
        const resp = await fetch(url, { signal: AbortSignal.timeout(55000) })
        if (resp.ok) {
          const buf = Buffer.from(await resp.arrayBuffer())
          generatedImage = `data:image/jpeg;base64,${buf.toString("base64")}`
        }
      } catch (e) {
        console.error("Pollinations fallback error:", e)
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
