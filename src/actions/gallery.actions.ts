"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"
import type { ActionResult, GalleryAlbum, GalleryItem } from "@/lib/types"

const PATHS = ["/", "/gallery", "/settings/ratecard"]
function revalidateAll() {
  PATHS.forEach(p => revalidatePath(p))
  revalidateTag("public-gallery", "default")
}

// ── Albums ────────────────────────────────────────────────────────

export async function getAlbums(): Promise<GalleryAlbum[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("sort_order")
  return (data as GalleryAlbum[]) ?? []
}

export async function getAlbumsWithItems(): Promise<(GalleryAlbum & { items: GalleryItem[] })[]> {
  const supabase = await createClient()
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("sort_order")
  if (!albums?.length) return []

  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .in("album_id", albums.map(a => a.id))
    .order("sort_order")

  return (albums as GalleryAlbum[]).map(album => ({
    ...album,
    items: ((items as GalleryItem[]) ?? []).filter(i => i.album_id === album.id),
  }))
}

export async function upsertAlbum(
  data: { id?: string; name: string; description?: string | null; cover_image_url?: string | null; sort_order?: number }
): Promise<ActionResult<GalleryAlbum>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const payload = { ...data, user_id: user.id }
  const { data: album, error } = data.id
    ? await supabase.from("gallery_albums").update(payload).eq("id", data.id).eq("user_id", user.id).select().single()
    : await supabase.from("gallery_albums").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidateAll()
  return { success: true, data: album as GalleryAlbum }
}

export async function deleteAlbum(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase.from("gallery_albums").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidateAll()
  return { success: true, data: undefined }
}

// ── Items ─────────────────────────────────────────────────────────

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order")
  return (data as GalleryItem[]) ?? []
}

export async function getGalleryItemsByAlbum(albumId: string): Promise<GalleryItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("album_id", albumId)
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
  revalidateAll()
  return { success: true, data: item as GalleryItem }
}

export async function deleteGalleryItem(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase.from("gallery_items").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidateAll()
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

  revalidateAll()
  return { success: true, data: undefined }
}
