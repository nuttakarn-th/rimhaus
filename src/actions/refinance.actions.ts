"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface RefinanceSessionData {
  principal: number
  installment: number
  extra: number
  loanTermYears?: number
  banks: unknown[]
}

export interface RefinanceSession {
  id: string
  name: string
  data: RefinanceSessionData
  created_at: string
  updated_at: string
}

export async function saveRefinanceSession(
  name: string,
  data: RefinanceSessionData,
  existingId?: string,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "กรุณาล็อกอินก่อน" }

    if (existingId) {
      const { error } = await supabase
        .from("refinance_sessions")
        .update({ name, data })
        .eq("id", existingId)
        .eq("user_id", user.id)
      if (error) return { success: false, error: error.message }
      revalidatePath("/refinance")
      return { success: true, id: existingId }
    }

    const { data: row, error } = await supabase
      .from("refinance_sessions")
      .insert({ name, data, user_id: user.id })
      .select("id")
      .single()
    if (error) return { success: false, error: error.message }
    revalidatePath("/refinance")
    return { success: true, id: row.id }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function listRefinanceSessions(): Promise<RefinanceSession[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await supabase
      .from("refinance_sessions")
      .select("id, name, data, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20)
    return (data ?? []) as RefinanceSession[]
  } catch {
    return []
  }
}

export async function deleteRefinanceSession(id: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("refinance_sessions").delete().eq("id", id).eq("user_id", user.id)
    revalidatePath("/refinance")
  } catch { /* ignore */ }
}
