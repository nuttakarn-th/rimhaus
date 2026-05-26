"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, SocialPost, PostStatus } from "@/lib/types"

export interface PostFormValues {
  platform: string
  post_title: string
  post_url?: string
  caption?: string
  hashtags?: string
  post_date?: string | null
  status: PostStatus
  views?: number | null
  likes?: number | null
  comments?: number | null
  shares?: number | null
  saves?: number | null
  reach?: number | null
  notes?: string
  review_job_id?: string | null
  content_item_id?: string | null
}

export async function createPost(data: PostFormValues): Promise<ActionResult<SocialPost>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: post, error } = await supabase
    .from("social_posts")
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/posts")
  revalidatePath("/dashboard")
  return { success: true, data: post }
}

export async function updatePost(id: string, data: Partial<PostFormValues>): Promise<ActionResult<SocialPost>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: post, error } = await supabase
    .from("social_posts")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/posts")
  return { success: true, data: post }
}

export async function deletePost(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase
    .from("social_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/posts")
  return { success: true, data: undefined }
}

export async function getPost(id: string): Promise<SocialPost | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  return (data as SocialPost) ?? null
}

export async function getPosts(filters?: { platform?: string; status?: string; review_job_id?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("social_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("post_date", { ascending: false, nullsFirst: false })

  if (filters?.platform && filters.platform !== "all") {
    query = query.eq("platform", filters.platform)
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }
  if (filters?.review_job_id) {
    query = query.eq("review_job_id", filters.review_job_id)
  }

  const { data } = await query
  return (data as SocialPost[]) ?? []
}

export async function getPlatformCounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("social_posts")
    .select("platform")
    .eq("user_id", user.id)
    .eq("status", "posted")

  const counts: Record<string, number> = {}
  data?.forEach(p => { counts[p.platform] = (counts[p.platform] ?? 0) + 1 })
  return Object.entries(counts).map(([platform, count]) => ({ platform, count }))
}
