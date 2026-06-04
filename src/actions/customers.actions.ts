"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Customer, ActionResult } from "@/lib/types"

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name")
  if (error) return []
  return data
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("customers").select("*").eq("id", id).single()
  return data
}

export async function upsertCustomer(
  input: Partial<Customer> & { name: string }
): Promise<ActionResult<Customer>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "ไม่ได้เข้าสู่ระบบ" }

  const payload = {
    user_id: user.id,
    name: input.name,
    contact_name: input.contact_name || null,
    email: input.email || null,
    phone: input.phone || null,
    contact_line: input.contact_line || null,
    address: input.address || null,
    tax_id: input.tax_id || null,
    notes: input.notes || null,
  }

  const { data, error } = input.id
    ? await supabase.from("customers").update(payload).eq("id", input.id).select().single()
    : await supabase.from("customers").insert(payload).select().single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/customers")
  return { success: true, data }
}

type ImportCustomer = {
  name: string
  tax_id?: string | null
  address?: string | null
  contact_name?: string | null
  phone?: string | null
  contact_line?: string | null
  email?: string | null
  notes?: string | null
}

export async function bulkImportCustomers(customers: ImportCustomer[]): Promise<ActionResult<number>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "ไม่ได้เข้าสู่ระบบ" }

  const payload = customers.map(c => ({
    user_id: user.id,
    name: c.name,
    contact_name: c.contact_name || null,
    email: c.email || null,
    phone: c.phone || null,
    contact_line: c.contact_line || null,
    address: c.address || null,
    tax_id: c.tax_id || null,
    notes: c.notes || null,
  }))

  const { error } = await supabase.from("customers").insert(payload)
  if (error) return { success: false, error: error.message }
  revalidatePath("/customers")
  return { success: true, data: customers.length }
}

export type CustomerWithStats = Customer & {
  latest_invoice_date: string | null
  latest_doc_date: string | null
  document_count: number
  doc_keywords: string
}

export async function getCustomersWithStats(): Promise<CustomerWithStats[]> {
  const supabase = await createClient()
  const { data: customers } = await supabase.from("customers").select("*").order("name")
  if (!customers || customers.length === 0) return []

  const ids = customers.map((c: Customer) => c.id)
  const { data: docs } = await supabase
    .from("documents")
    .select("customer_id, doc_type, doc_date, document_items(description)")
    .in("customer_id", ids)
    .order("doc_date", { ascending: false })

  const latestInvoiceMap: Record<string, string> = {}
  const latestDocMap: Record<string, string> = {}
  const docCountMap: Record<string, number> = {}
  const keywordsMap: Record<string, string[]> = {}

  for (const d of docs ?? []) {
    if (!d.customer_id) continue
    docCountMap[d.customer_id] = (docCountMap[d.customer_id] ?? 0) + 1
    if (!latestDocMap[d.customer_id]) latestDocMap[d.customer_id] = d.doc_date
    if (d.doc_type === "invoice" && !latestInvoiceMap[d.customer_id]) {
      latestInvoiceMap[d.customer_id] = d.doc_date
    }
    const items = (d.document_items ?? []) as Array<{ description: string }>
    for (const item of items) {
      if (item.description) {
        if (!keywordsMap[d.customer_id]) keywordsMap[d.customer_id] = []
        keywordsMap[d.customer_id].push(item.description)
      }
    }
  }

  const result = customers.map((c: Customer) => ({
    ...c,
    latest_invoice_date: latestInvoiceMap[c.id] ?? null,
    latest_doc_date: latestDocMap[c.id] ?? null,
    document_count: docCountMap[c.id] ?? 0,
    doc_keywords: (keywordsMap[c.id] ?? []).join(" "),
  }))

  // Sort: customers with recent docs first, then alphabetical
  result.sort((a, b) => {
    if (a.latest_doc_date && b.latest_doc_date) {
      return b.latest_doc_date.localeCompare(a.latest_doc_date)
    }
    if (a.latest_doc_date) return -1
    if (b.latest_doc_date) return 1
    return a.name.localeCompare(b.name, "th")
  })

  return result
}

export type CustomerDocument = {
  id: string
  doc_type: string
  doc_number: string
  doc_date: string
  total: number
  status: string
  wht_rate: number
}

export async function getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("documents")
    .select("id, doc_type, doc_number, doc_date, total, status, wht_rate")
    .eq("customer_id", customerId)
    .order("doc_date", { ascending: false })
  return (data as CustomerDocument[]) ?? []
}

export async function deleteCustomer(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from("customers").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/customers")
  return { success: true, data: null }
}
