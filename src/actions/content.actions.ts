"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, ContentItem, ContentStatus, ContentPillar } from "@/lib/types"
import type { PillarStat } from "@/components/dashboard/TopPillarWidget"

export interface ContentFormValues {
  title: string
  description?: string
  content_type: string
  platforms: string[]
  planned_date?: string | null
  shoot_date?: string | null
  idea_notes?: string
  script?: string
  caption?: string
  images?: string[]
  hashtags?: string
  status: ContentStatus
  content_pillar?: ContentPillar | null
  is_sponsored: boolean
  link?: string | null
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

export async function getContentItems(filters?: { status?: string; review_job_id?: string }) {
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
  if (filters?.review_job_id) {
    query = query.eq("review_job_id", filters.review_job_id)
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

export async function getPillarEngagement(): Promise<PillarStat[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("social_posts")
    .select("likes, comments, shares, content_items(content_pillar)")
    .eq("user_id", user.id)
    .not("content_item_id", "is", null)

  if (!data) return []

  const map = new Map<ContentPillar, { engagement: number; count: number }>()
  for (const post of data) {
    const item = post.content_items as unknown as { content_pillar: ContentPillar | null } | null
    const pillar = item?.content_pillar
    if (!pillar) continue
    const eng = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0)
    const existing = map.get(pillar) ?? { engagement: 0, count: 0 }
    map.set(pillar, { engagement: existing.engagement + eng, count: existing.count + 1 })
  }

  return Array.from(map.entries()).map(([pillar, { engagement, count }]) => ({ pillar, engagement, count }))
}
