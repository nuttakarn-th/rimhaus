"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { IssuerProfile, ActionResult } from "@/lib/types"

export async function getIssuers(): Promise<IssuerProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("issuer_profiles").select("*").order("is_default", { ascending: false }).order("created_at")
  return data ?? []
}

export async function getIssuer(id: string): Promise<IssuerProfile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("issuer_profiles").select("*").eq("id", id).single()
  return data
}

export async function upsertIssuer(input: Partial<IssuerProfile> & { name: string }): Promise<ActionResult<IssuerProfile>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "ไม่ได้เข้าสู่ระบบ" }

  const payload = {
    user_id: user.id,
    name: input.name,
    id_card: input.id_card || null,
    address: input.address || null,
    phone: input.phone || null,
    email: input.email || null,
    bank_name: input.bank_name || null,
    bank_branch: input.bank_branch || null,
    account_name: input.account_name || null,
    account_number: input.account_number || null,
    signature_url: input.signature_url || null,
    is_default: input.is_default ?? false,
  }

  // If setting as default, clear others first
  if (payload.is_default) {
    await supabase.from("issuer_profiles").update({ is_default: false }).eq("user_id", user.id)
  }

  const { data, error } = input.id
    ? await supabase.from("issuer_profiles").update(payload).eq("id", input.id).select().single()
    : await supabase.from("issuer_profiles").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/settings/issuers")
  return { success: true, data }
}

export async function updateIssuerSignature(id: string, signature_url: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from("issuer_profiles").update({ signature_url }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/settings/issuers")
  return { success: true, data: null }
}

export async function deleteIssuer(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from("issuer_profiles").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/settings/issuers")
  return { success: true, data: null }
}
