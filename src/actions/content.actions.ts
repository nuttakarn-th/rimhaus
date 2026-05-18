"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, ContentItem, ContentStatus } from "@/lib/types"

export interface ContentFormValues {
  title: string
  description?: string
  content_type: string
  platforms: string[]
  planned_date?: string | null
  shoot_date?: string | null
  idea_notes?: string
  script?: string
  hashtags?: string
  status: ContentStatus
  is_sponsored: boolean
  review_job_id?: string | null
}

export async function createContentItem(data: ContentFormValues): Promise<ActionResult<ContentItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: item, error } = await supabase
    .from("content_items")
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/content")
  revalidatePath("/dashboard")
  return { success: true, data: item }
}

export async function updateContentItem(id: string, data: Partial<ContentFormValues>): Promise<ActionResult<ContentItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: item, error } = await supabase
    .from("content_items")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/content")
  revalidatePath(`/content/${id}`)
  return { success: true, data: item }
}

export async function deleteContentItem(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/content")
  return { success: true, data: undefined }
}

export async function getContentItems(filters?: { status?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("content_items")
    .select("*")
    .eq("user_id", user.id)
    .order("planned_date", { ascending: true, nullsFirst: false })

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  const { data } = await query
  return (data as ContentItem[]) ?? []
}

export async function getContentItem(id: string): Promise<ContentItem | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  return data as ContentItem | null
}
