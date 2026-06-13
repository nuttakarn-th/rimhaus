"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PitchScript, ActionResult } from "@/lib/types"

export async function getPitchScripts(): Promise<PitchScript[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pitch_scripts")
    .select("*")
    .order("created_at", { ascending: false })
  return (data as PitchScript[]) ?? []
}

export async function getPitchScript(id: string): Promise<PitchScript | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("pitch_scripts").select("*").eq("id", id).single()
  return data as PitchScript | null
}

export async function upsertPitchScript(
  input: Partial<PitchScript> & { name: string; content: string }
): Promise<ActionResult<PitchScript>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "ไม่ได้เข้าสู่ระบบ" }

  const payload = {
    user_id: user.id,
    name: input.name,
    content: input.content,
    category: input.category ?? "general",
    customer_id: input.customer_id || null,
    notes: input.notes || null,
  }

  const { data, error } = input.id
    ? await supabase.from("pitch_scripts").update(payload).eq("id", input.id).select().single()
    : await supabase.from("pitch_scripts").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/pitch-scripts")
  return { success: true, data: data as PitchScript }
}

export async function deletePitchScript(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from("pitch_scripts").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/pitch-scripts")
  return { success: true, data: null }
}
