"use server"
import { revalidatePath, revalidateTag } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"
import type { Article } from "@/lib/types"

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

export async function getArticles(): Promise<Article[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from("articles").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  return (data as Article[]) ?? []
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("articles").select("*").eq("id", id).single()
  return data as Article | null
}

export async function upsertArticle(data: {
  id?: string
  title: string
  slug?: string
  excerpt?: string | null
  content?: string | null
  cover_image_url?: string | null
  category?: string | null
  tags?: string[]
  status: 'draft' | 'published'
}): Promise<ActionResult<Article>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const slug = data.slug?.trim() || toSlug(data.title)
  const payload = {
    ...data,
    slug,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  }

  const { data: article, error } = data.id
    ? await supabase.from("articles").update(payload).eq("id", data.id).eq("user_id", user.id).select().single()
    : await supabase.from("articles").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/articles")
  revalidateTag("public-articles", "default")
  return { success: true, data: article as Article }
}

export async function deleteArticle(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const { error } = await supabase.from("articles").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/articles")
  revalidateTag("public-articles", "default")
  return { success: true, data: undefined }
}

export async function bulkDeleteArticles(ids: string[]): Promise<ActionResult<void>> {
  if (!ids.length) return { success: true, data: undefined }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const { error } = await supabase.from("articles").delete().in("id", ids).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/articles")
  revalidateTag("public-articles", "default")
  return { success: true, data: undefined }
}

export async function bulkUpdateArticleStatus(ids: string[], status: 'draft' | 'published'): Promise<ActionResult<void>> {
  if (!ids.length) return { success: true, data: undefined }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }
  const payload = {
    status,
    updated_at: new Date().toISOString(),
    published_at: status === 'published' ? new Date().toISOString() : null,
  }
  const { error } = await supabase.from("articles").update(payload).in("id", ids).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/articles")
  revalidateTag("public-articles", "default")
  return { success: true, data: undefined }
}
