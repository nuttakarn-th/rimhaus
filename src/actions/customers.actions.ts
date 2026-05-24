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

export async function deleteCustomer(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from("customers").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/customers")
  return { success: true, data: null }
}
