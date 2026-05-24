"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Document, DocType, DocStatus, ActionResult } from "@/lib/types"

export async function getDocuments(docType?: DocType): Promise<Document[]> {
  const supabase = await createClient()
  let query = supabase
    .from("documents")
    .select("*, customers(name)")
    .order("doc_date", { ascending: false })
    .order("created_at", { ascending: false })
  if (docType) query = query.eq("doc_type", docType)
  const { data, error } = await query
  if (error) return []
  return data
}

export type DocumentWithLinks = Document & {
  invoice_count: number
  receipt_count: number
}

export async function getDocumentsWithLinks(docType?: DocType): Promise<DocumentWithLinks[]> {
  const supabase = await createClient()
  let query = supabase
    .from("documents")
    .select("*, customers(name)")
    .order("created_at", { ascending: false })
  if (docType) query = query.eq("doc_type", docType)
  const { data, error } = await query
  if (error || !data) return []

  // Fetch invoice/receipt counts for quotations
  const quotationIds = data.filter(d => d.doc_type === "quotation").map(d => d.id)
  let linkMap: Record<string, { invoice_count: number; receipt_count: number }> = {}
  if (quotationIds.length > 0) {
    const { data: linked } = await supabase
      .from("documents")
      .select("linked_quotation_id, doc_type")
      .in("linked_quotation_id", quotationIds)
    for (const l of linked ?? []) {
      if (!l.linked_quotation_id) continue
      if (!linkMap[l.linked_quotation_id]) linkMap[l.linked_quotation_id] = { invoice_count: 0, receipt_count: 0 }
      if (l.doc_type === "invoice") linkMap[l.linked_quotation_id].invoice_count++
      else if (l.doc_type === "receipt") linkMap[l.linked_quotation_id].receipt_count++
    }
  }

  return data.map(d => ({
    ...d,
    invoice_count: linkMap[d.id]?.invoice_count ?? 0,
    receipt_count: linkMap[d.id]?.receipt_count ?? 0,
  }))
}

export async function getDocument(id: string): Promise<Document | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("documents")
    .select("*, document_items(*), customers(name), review_jobs(brand_name, product_name)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "document_items", ascending: true })
    .single()
  return data
}

export async function getQuotations(): Promise<Document[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("documents")
    .select("id, doc_number, doc_date, customer_name, subtotal, total")
    .eq("doc_type", "quotation")
    .order("doc_date", { ascending: false })
  return (data as Document[]) ?? []
}

export async function generateDocNumber(docType: DocType): Promise<string> {
  const supabase = await createClient()
  const year = new Date().getFullYear()
  const prefix = docType === "quotation" ? "QT" : docType === "invoice" ? "INV" : "REC"
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("doc_type", docType)
    .gte("doc_date", `${year}-01-01`)
    .lte("doc_date", `${year}-12-31`)
  const seq = String((count ?? 0) + 1).padStart(3, "0")
  return `${prefix}-${year}-${seq}`
}

type UpsertDocumentInput = {
  id?: string
  customer_id?: string | null
  review_job_id?: string | null
  linked_quotation_id?: string | null
  doc_type: DocType
  doc_number: string
  doc_date: string
  due_date?: string | null
  status: DocStatus
  customer_name?: string | null
  customer_address?: string | null
  customer_tax_id?: string | null
  customer_contact?: string | null
  subtotal: number
  wht_rate: number
  wht_amount: number
  total: number
  notes?: string | null
  doc_remarks?: string | null
  payment_terms?: string | null
  issuer_profile_id?: string | null
  issuer_name?: string | null
  issuer_id_card?: string | null
  issuer_address?: string | null
  issuer_phone?: string | null
  issuer_email?: string | null
  issuer_bank_name?: string | null
  issuer_bank_branch?: string | null
  issuer_account_name?: string | null
  issuer_account_number?: string | null
  issuer_signature_url?: string | null
  issuer_header_image_url?: string | null
  issuer_contact_line?: string | null
  items: Array<{ description: string; quantity: number; unit_price: number; amount: number; sort_order: number }>
}

export async function upsertDocument(input: UpsertDocumentInput): Promise<ActionResult<Document>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "ไม่ได้เข้าสู่ระบบ" }

  const payload = {
    user_id: user.id,
    customer_id: input.customer_id || null,
    review_job_id: input.review_job_id || null,
    linked_quotation_id: input.linked_quotation_id || null,
    doc_type: input.doc_type,
    doc_number: input.doc_number,
    doc_date: input.doc_date,
    due_date: input.due_date || null,
    status: input.status,
    customer_name: input.customer_name || null,
    customer_address: input.customer_address || null,
    customer_tax_id: input.customer_tax_id || null,
    customer_contact: input.customer_contact || null,
    subtotal: input.subtotal,
    wht_rate: input.wht_rate,
    wht_amount: input.wht_amount,
    total: input.total,
    notes: input.notes || null,
    doc_remarks: input.doc_remarks || null,
    payment_terms: input.payment_terms || null,
    issuer_profile_id: input.issuer_profile_id || null,
    issuer_name: input.issuer_name || null,
    issuer_id_card: input.issuer_id_card || null,
    issuer_address: input.issuer_address || null,
    issuer_phone: input.issuer_phone || null,
    issuer_email: input.issuer_email || null,
    issuer_bank_name: input.issuer_bank_name || null,
    issuer_bank_branch: input.issuer_bank_branch || null,
    issuer_account_name: input.issuer_account_name || null,
    issuer_account_number: input.issuer_account_number || null,
    issuer_signature_url: input.issuer_signature_url || null,
    issuer_header_image_url: input.issuer_header_image_url || null,
    issuer_contact_line: input.issuer_contact_line || null,
  }

  let docId: string
  if (input.id) {
    const { data, error } = await supabase.from("documents").update(payload).eq("id", input.id).select().single()
    if (error) return { success: false, error: error.message }
    docId = data.id
    await supabase.from("document_items").delete().eq("document_id", docId)
  } else {
    const { data, error } = await supabase.from("documents").insert(payload).select().single()
    if (error) return { success: false, error: error.message }
    docId = data.id
  }

  if (input.items.length > 0) {
    const { error } = await supabase.from("document_items").insert(
      input.items.map(item => ({ ...item, document_id: docId }))
    )
    if (error) return { success: false, error: error.message }
  }

  revalidatePath("/documents")
  revalidatePath(`/documents/${docId}`)

  const doc = await getDocument(docId)
  if (!doc) return { success: false, error: "ไม่พบเอกสาร" }
  return { success: true, data: doc }
}

export async function updateDocumentStatus(id: string, status: DocStatus): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from("documents").update({ status }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/documents")
  revalidatePath(`/documents/${id}`)
  return { success: true, data: null }
}

export async function deleteDocument(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from("documents").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/documents")
  return { success: true, data: null }
}
