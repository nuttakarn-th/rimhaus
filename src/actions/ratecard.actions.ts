"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, RateCardPackage, RateCardSettings } from "@/lib/types"

export async function getPackages(): Promise<RateCardPackage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("rate_card_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  return (data as RateCardPackage[]) ?? []
}

export async function getAllPackages(): Promise<RateCardPackage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("rate_card_packages")
    .select("*")
    .order("sort_order")
  return (data as RateCardPackage[]) ?? []
}

export async function getSettings(): Promise<RateCardSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("rate_card_settings")
    .select("*")
    .limit(1)
    .single()
  return data as RateCardSettings | null
}

export async function upsertPackage(
  data: Omit<RateCardPackage, "id" | "user_id" | "created_at"> & { id?: string }
): Promise<ActionResult<RateCardPackage>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const payload = { ...data, user_id: user.id }
  const { data: pkg, error } = data.id
    ? await supabase.from("rate_card_packages").update(payload).eq("id", data.id).eq("user_id", user.id).select().single()
    : await supabase.from("rate_card_packages").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/ratecard")
  revalidatePath("/dashboard/ratecard")
  return { success: true, data: pkg as RateCardPackage }
}

export async function deletePackage(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase.from("rate_card_packages").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/ratecard")
  revalidatePath("/dashboard/ratecard")
  return { success: true, data: undefined }
}

export async function upsertSettings(
  data: Partial<Omit<RateCardSettings, "id" | "user_id" | "updated_at">>
): Promise<ActionResult<RateCardSettings>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const existing = await getSettings()
  const payload = { ...data, updated_at: new Date().toISOString() }
  const { data: settings, error } = existing
    ? await supabase.from("rate_card_settings").update(payload).eq("user_id", user.id).select().single()
    : await supabase.from("rate_card_settings").insert({ ...payload, user_id: user.id }).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/ratecard")
  revalidatePath("/dashboard/ratecard")
  return { success: true, data: settings as RateCardSettings }
}
