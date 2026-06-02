"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CommissionInput {
  month: string
  cash_income: number
  affiliate: number
  ads_cost: number
  programs_cost: number
  notes?: string
}

export interface CommissionRecord {
  id: string
  month: string
  cash_income: number
  affiliate: number
  ads_cost: number
  programs_cost: number
  net_income: number
  fund_page: number
  fund_future: number
  fund_pagedev: number
  workers_total: number
  palm: number
  richa: number
  affiliate_bonus: number
  notes: string | null
  created_at: string
  updated_at: string
}

const THRESHOLD = 20_000

function computeDistribution(cash: number, affiliate: number, ads: number, programs: number) {
  const net = Math.max(0, cash - ads - programs)
  let fundPage = 0
  let workers = 0
  if (net <= THRESHOLD) {
    fundPage = net * 0.8
    workers = net * 0.2
  } else {
    fundPage = THRESHOLD * 0.8 + (net - THRESHOLD) * 0.6
    workers = THRESHOLD * 0.2 + (net - THRESHOLD) * 0.4
  }
  return {
    net_income: net,
    fund_page: fundPage,
    fund_future: fundPage * 0.75,
    fund_pagedev: fundPage * 0.25,
    workers_total: workers,
    palm: workers * 0.5,
    richa: workers * 0.5,
    affiliate_bonus: affiliate,
  }
}

export async function saveCommissionRecord(input: CommissionInput): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const dist = computeDistribution(input.cash_income, input.affiliate, input.ads_cost, input.programs_cost)

  const { error } = await supabase
    .from("commission_records")
    .upsert(
      {
        user_id: user.id,
        month: input.month,
        cash_income: input.cash_income,
        affiliate: input.affiliate,
        ads_cost: input.ads_cost,
        programs_cost: input.programs_cost,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
        ...dist,
      },
      { onConflict: "user_id,month" }
    )

  if (error) return { success: false, error: error.message }
  revalidatePath("/commission")
  return { success: true }
}

export async function getCommissionRecords(): Promise<CommissionRecord[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("commission_records")
    .select("*")
    .eq("user_id", user.id)
    .order("month", { ascending: false })

  return (data ?? []) as CommissionRecord[]
}

export async function getCommissionRecord(month: string): Promise<CommissionRecord | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("commission_records")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month)
    .single()

  return (data as CommissionRecord) ?? null
}

export async function deleteCommissionRecord(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase
    .from("commission_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/commission")
  return { success: true }
}
