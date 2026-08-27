"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, AffiliateProduct, AffiliateZone } from "@/lib/types"

export async function getAffiliateProducts(): Promise<AffiliateProduct[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from("affiliate_products")
    .select("*")
    .eq("user_id", user.id)
    .order("zone")
    .order("name")
  return data ?? []
}

export async function addAffiliateProduct(product: {
  zone: AffiliateZone; name: string; shopee_url?: string | null; lazada_url?: string | null
}): Promise<ActionResult<AffiliateProduct>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const zone_label = (await import("@/lib/affiliate-zones")).ZONE_CONFIG[product.zone].label
  const { data, error } = await supabase
    .from("affiliate_products")
    .insert({ ...product, zone_label, user_id: user.id })
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  revalidatePath("/affiliate-products")
  return { success: true, data }
}

export async function importAffiliateProducts(
  products: Array<{ zone: AffiliateZone; zone_label: string; name: string; shopee_url?: string | null; lazada_url?: string | null }>
): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const rows = products.map(p => ({ ...p, user_id: user.id }))
  const { error, count } = await supabase.from("affiliate_products").insert(rows, { count: "exact" })
  if (error) return { success: false, error: error.message }
  revalidatePath("/affiliate-products")
  return { success: true, data: { count: count ?? rows.length } }
}

export async function toggleAffiliateProduct(id: string, is_active: boolean): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const { error } = await supabase
    .from("affiliate_products")
    .update({ is_active })
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/affiliate-products")
  return { success: true, data: undefined }
}

export async function deleteAffiliateProduct(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const { error } = await supabase
    .from("affiliate_products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/affiliate-products")
  return { success: true, data: undefined }
}

// Distribute affiliate products into content_items for a date range.
// weekdays (Mon–Fri) → photo, weekends (Sat–Sun) → short_video
export async function distributeAffiliateToCalendar(
  startDate: string,
  endDate: string,
  slotsPerDay: number = 1
): Promise<ActionResult<{ created: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  // Fetch active products ordered by last_scheduled_at NULLS FIRST (rotation)
  const { data: products, error: fetchErr } = await supabase
    .from("affiliate_products")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("last_scheduled_at", { ascending: true, nullsFirst: true })
    .order("scheduled_count", { ascending: true })

  if (fetchErr) return { success: false, error: fetchErr.message }
  if (!products || products.length === 0) return { success: false, error: "ไม่มีสินค้า Affiliate ที่เปิดใช้งาน" }

  // Build date list
  const dates: string[] = []
  const cur = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  if (dates.length === 0) return { success: false, error: "ไม่พบวันในช่วงที่เลือก" }

  // Assign products to slots using round-robin with zone diversity
  const contentItems: Array<Record<string, unknown>> = []
  const usedProductIds = new Set<string>()
  let queueIdx = 0
  let lastZone = ""

  for (const date of dates) {
    const dow = new Date(date + "T00:00:00").getDay() // 0=Sun,6=Sat
    const isWeekend = dow === 0 || dow === 6
    const contentType = isWeekend ? "short_video" : "photo"

    for (let slot = 0; slot < slotsPerDay; slot++) {
      // Pick product: prefer different zone from previous
      let pickedIdx = -1
      for (let attempt = 0; attempt < products.length; attempt++) {
        const idx = (queueIdx + attempt) % products.length
        if (products[idx].zone !== lastZone) {
          pickedIdx = idx
          break
        }
      }
      if (pickedIdx === -1) pickedIdx = queueIdx % products.length

      const product = products[pickedIdx]
      lastZone = product.zone
      usedProductIds.add(product.id)

      const linkParts = [
        product.shopee_url ? `Shopee: ${product.shopee_url}` : null,
        product.lazada_url ? `Lazada: ${product.lazada_url}` : null,
      ].filter(Boolean)

      contentItems.push({
        user_id: user.id,
        title: `[Affiliate] ${product.name}`,
        content_type: contentType,
        platforms: ["instagram"],
        planned_date: date,
        status: "idea",
        content_category: "affiliate",
        is_sponsored: false,
        idea_notes: linkParts.length > 0 ? linkParts.join("\n") : null,
        link: product.shopee_url ?? product.lazada_url ?? null,
      })

      queueIdx = (pickedIdx + 1) % products.length
    }
  }

  // Insert all content items
  const { error: insertErr } = await supabase.from("content_items").insert(contentItems)
  if (insertErr) return { success: false, error: insertErr.message }

  // Update last_scheduled_at for used products (drives rotation)
  const now = new Date().toISOString()
  if (usedProductIds.size > 0) {
    await supabase
      .from("affiliate_products")
      .update({ last_scheduled_at: now })
      .in("id", [...usedProductIds])
      .eq("user_id", user.id)
  }

  revalidatePath("/planner")
  revalidatePath("/affiliate-products")
  return { success: true, data: { created: contentItems.length } }
}
