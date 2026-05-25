"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { ActionResult, PortfolioItem, Partner } from "@/lib/types"

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("type")
    .order("sort_order")
  return (data as PortfolioItem[]) ?? []
}

export async function upsertPortfolioItem(
  data: Omit<PortfolioItem, "id" | "user_id" | "created_at"> & { id?: string }
): Promise<ActionResult<PortfolioItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const payload = { ...data, user_id: user.id }
  const { data: item, error } = data.id
    ? await supabase.from("portfolio_items").update(payload).eq("id", data.id).eq("user_id", user.id).select().single()
    : await supabase.from("portfolio_items").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/ratecard/portfolio")
  revalidatePath("/settings/ratecard")
  return { success: true, data: item as PortfolioItem }
}

export async function deletePortfolioItem(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase.from("portfolio_items").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/ratecard/portfolio")
  revalidatePath("/settings/ratecard")
  return { success: true, data: undefined }
}

export async function getPartners(): Promise<Partner[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("partners")
    .select("*")
    .order("sort_order")
  return (data as Partner[]) ?? []
}

export async function upsertPartner(
  data: Omit<Partner, "id" | "user_id" | "created_at"> & { id?: string }
): Promise<ActionResult<Partner>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const payload = { ...data, user_id: user.id }
  const { data: partner, error } = data.id
    ? await supabase.from("partners").update(payload).eq("id", data.id).eq("user_id", user.id).select().single()
    : await supabase.from("partners").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/ratecard/partners")
  revalidatePath("/settings/ratecard")
  return { success: true, data: partner as Partner }
}

export async function deletePartner(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase.from("partners").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/ratecard/partners")
  revalidatePath("/settings/ratecard")
  return { success: true, data: undefined }
}
