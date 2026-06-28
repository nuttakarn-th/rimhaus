"use server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult, AiProduct } from "@/lib/types"

export async function getAiProducts(): Promise<AiProduct[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from("ai_products").select("*").eq("user_id", user.id).order("sort_order")
  return (data as AiProduct[]) ?? []
}

export async function getAiProductById(id: string): Promise<AiProduct | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("ai_products").select("*").eq("id", id).single()
  return data as AiProduct | null
}

export async function upsertAiProduct(data: {
  id?: string
  name: string
  description?: string | null
  image_url?: string | null
  price?: number | null
  affiliate_url: string
  affiliate_platform?: string | null
  category: string
  room_types?: string[]
  style_tags?: string[]
  is_active?: boolean
}): Promise<ActionResult<AiProduct>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const payload = { ...data, user_id: user.id }
  const { data: product, error } = data.id
    ? await supabase.from("ai_products").update(payload).eq("id", data.id).eq("user_id", user.id).select().single()
    : await supabase.from("ai_products").insert(payload).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath("/ai-products")
  return { success: true, data: product as AiProduct }
}

export async function deleteAiProduct(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const { error } = await supabase.from("ai_products").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/ai-products")
  return { success: true, data: undefined }
}

export async function getAiStats(): Promise<{
  total_generations: number
  total_clicks: number
  top_style: string | null
  top_room: string | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { total_generations: 0, total_clicks: 0, top_style: null, top_room: null }

  const [{ count: genCount }, { count: clickCount }, { data: gens }] = await Promise.all([
    supabase.from("ai_generations").select("*", { count: "exact", head: true }),
    supabase.from("ai_product_clicks").select("*", { count: "exact", head: true }),
    supabase.from("ai_generations").select("style, room_type"),
  ])

  const styleCounts: Record<string, number> = {}
  const roomCounts: Record<string, number> = {}
  for (const g of gens ?? []) {
    styleCounts[g.style] = (styleCounts[g.style] ?? 0) + 1
    roomCounts[g.room_type] = (roomCounts[g.room_type] ?? 0) + 1
  }
  const top_style = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const top_room = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    total_generations: genCount ?? 0,
    total_clicks: clickCount ?? 0,
    top_style,
    top_room,
  }
}
