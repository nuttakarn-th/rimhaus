"use server"

import { createClient } from "@/lib/supabase/server"

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let token = ""
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function getLinkToken(): Promise<{
  token: string
  expiresAt: string
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error } = await supabase.from("line_link_tokens").insert({
    user_id: user.id,
    token,
    expires_at: expiresAt,
  })

  if (error) return null

  return { token, expiresAt }
}

export async function getLineAccount(): Promise<{
  lineUserId: string
  displayName: string | null
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("line_accounts")
    .select("line_user_id, display_name")
    .eq("user_id", user.id)
    .single()

  if (!data) return null

  return { lineUserId: data.line_user_id, displayName: data.display_name }
}

export async function unlinkLineAccount(): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from("line_accounts")
    .delete()
    .eq("user_id", user.id)

  return { success: !error }
}
