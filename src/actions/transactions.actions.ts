"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, Transaction, TransactionType } from "@/lib/types"

export interface TransactionFormValues {
  type: TransactionType
  amount: number
  category?: string
  description?: string
  transaction_date: string
  payment_method?: string
  review_job_id?: string | null
}

export async function createTransaction(data: TransactionFormValues): Promise<ActionResult<Transaction>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: tx, error } = await supabase
    .from("transactions")
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/finances")
  revalidatePath("/dashboard")
  return { success: true, data: tx }
}

export async function deleteTransaction(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/finances")
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function getTransactions(filters?: { type?: string; month?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("transactions")
    .select("*, review_jobs(brand_name, product_name)")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type)
  }
  if (filters?.month) {
    const [year, month] = filters.month.split("-")
    const start = `${year}-${month}-01`
    const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split("T")[0]
    query = query.gte("transaction_date", start).lte("transaction_date", end)
  }

  const { data } = await query
  return (data as Transaction[]) ?? []
}

export async function getFinanceSummary(month: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { income: 0, expense: 0, net: 0 }

  const [year, mon] = month.split("-")
  const start = `${year}-${mon}-01`
  const end = new Date(parseInt(year), parseInt(mon), 0).toISOString().split("T")[0]

  const { data } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .gte("transaction_date", start)
    .lte("transaction_date", end)

  const income = data?.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0) ?? 0
  const expense = data?.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) ?? 0
  return { income, expense, net: income - expense }
}

export async function getMonthlyIncome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const months: { month: string; income: number }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const mon = String(d.getMonth() + 1).padStart(2, "0")
    const start = `${year}-${mon}-01`
    const end = new Date(year, d.getMonth() + 1, 0).toISOString().split("T")[0]

    const { data } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "income")
      .gte("transaction_date", start)
      .lte("transaction_date", end)

    const income = data?.reduce((s, t) => s + t.amount, 0) ?? 0
    months.push({ month: `${d.toLocaleString("th-TH", { month: "short" })} ${year}`, income })
  }

  return months
}
