"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, ReviewJob, JobStatus, PaymentStatus, DealType } from "@/lib/types"

export interface JobFormValues {
  brand_name: string
  product_name: string
  product_category?: string
  review_type: "short_video" | "photo" | "long_video"
  platforms: string[]
  deadline?: string | null
  deal_type: DealType
  payment_amount: number
  payment_status: PaymentStatus
  status: JobStatus
  product_received: boolean
  product_value?: number | null
  notes?: string
}

export async function createJob(data: JobFormValues): Promise<ActionResult<ReviewJob>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: job, error } = await supabase
    .from("review_jobs")
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/jobs")
  revalidatePath("/dashboard")
  return { success: true, data: job }
}

export async function updateJob(id: string, data: Partial<JobFormValues>): Promise<ActionResult<ReviewJob>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: job, error } = await supabase
    .from("review_jobs")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/jobs")
  revalidatePath(`/jobs/${id}`)
  revalidatePath("/dashboard")
  return { success: true, data: job }
}

export async function deleteJob(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase
    .from("review_jobs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/jobs")
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<ActionResult<ReviewJob>> {
  return updateJob(id, { status })
}

export async function updatePaymentStatus(id: string, payment_status: PaymentStatus): Promise<ActionResult<ReviewJob>> {
  return updateJob(id, { payment_status })
}

export async function getJobs(filters?: { status?: string; platform?: string; search?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("review_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }
  if (filters?.search) {
    query = query.or(`brand_name.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%`)
  }

  const { data } = await query
  return (data as ReviewJob[]) ?? []
}

export async function getJob(id: string): Promise<ReviewJob | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("review_jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  return data as ReviewJob | null
}
