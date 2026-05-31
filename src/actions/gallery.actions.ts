"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, GalleryItem } from "@/lib/types"

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order")
  return (data as GalleryItem[]) ?? []
}

export async function upsertGalleryItem(
  data: Omit<GalleryItem, "id" | "user_id" | "created_at"> & { id?: string }
): Promise<ActionResult<GalleryItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const payload = { ...data, user_id: user.id }
  const { data: item, error } = data.id
    ? await supabase.from("gallery_items").update(payload).eq("id", data.id).eq("user_id", user.id).select().single()
    : await supabase.from("gallery_items").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/gallery")
  revalidatePath("/settings/ratecard")
  return { success: true, data: item as GalleryItem }
}

export async function deleteGalleryItem(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase.from("gallery_items").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/gallery")
  revalidatePath("/settings/ratecard")
  return { success: true, data: undefined }
}

export async function reorderGalleryItems(orderedIds: string[]): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const updates = orderedIds.map((id, index) =>
    supabase.from("gallery_items").update({ sort_order: index }).eq("id", id).eq("user_id", user.id)
  )
  const results = await Promise.all(updates)
  const failed = results.find(r => r.error)
  if (failed?.error) return { success: false, error: failed.error.message }

  revalidatePath("/")
  revalidatePath("/gallery")
  revalidatePath("/settings/ratecard")
  return { success: true, data: undefined }
}
