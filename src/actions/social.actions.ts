"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, SocialToken, SocialInsight } from "@/lib/types"

export async function getSocialToken(platform: "instagram" | "facebook"): Promise<SocialToken | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("social_tokens")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", platform)
    .maybeSingle()

  return data as SocialToken | null
}

export async function getLatestSocialInsight(platform: "instagram" | "facebook"): Promise<SocialInsight | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("social_insights")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", platform)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as SocialInsight | null
}

export async function disconnectSocial(platform: "instagram" | "facebook"): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { error } = await supabase
    .from("social_tokens")
    .delete()
    .eq("user_id", user.id)
    .eq("platform", platform)

  if (error) return { success: false, error: error.message }

  // Clear social_stats from rate_card_settings
  await supabase
    .from("rate_card_settings")
    .update({ social_stats: null })
    .eq("user_id", user.id)

  revalidatePath("/settings/instagram")
  revalidatePath("/ratecard")
  return { success: true, data: undefined }
}

export async function refreshInstagramInsights(): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบ" }

  const { data: tokenRow } = await supabase
    .from("social_tokens")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", "instagram")
    .maybeSingle()

  if (!tokenRow) return { success: false, error: "ยังไม่ได้เชื่อม Instagram" }

  const { access_token, ig_user_id } = tokenRow as SocialToken

  try {
    // Fetch basic profile
    const profileRes = await fetch(
      `https://graph.facebook.com/v21.0/${ig_user_id}?fields=followers_count,follows_count,media_count,username&access_token=${access_token}`
    )
    const profile = await profileRes.json()
    if (profile.error) throw new Error(profile.error.message)

    // Fetch 30-day reach/impressions (best-effort)
    let avgReach: number | null = null
    let avgImpressions: number | null = null
    try {
      const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600
      const until = Math.floor(Date.now() / 1000)
      const reachRes = await fetch(
        `https://graph.facebook.com/v21.0/${ig_user_id}/insights?metric=reach,impressions&period=day&since=${since}&until=${until}&access_token=${access_token}`
      )
      const reachData = await reachRes.json()
      if (reachData.data) {
        const reachArr = reachData.data.find((d: { name: string }) => d.name === "reach")?.values ?? []
        const impArr = reachData.data.find((d: { name: string }) => d.name === "impressions")?.values ?? []
        if (reachArr.length > 0)
          avgReach = reachArr.reduce((s: number, v: { value: number }) => s + v.value, 0) / reachArr.length
        if (impArr.length > 0)
          avgImpressions = impArr.reduce((s: number, v: { value: number }) => s + v.value, 0) / impArr.length
      }
    } catch { /* insights may require additional permissions */ }

    // Fetch demographics (best-effort)
    let audienceGenderAge = null
    let audienceCity = null
    let audienceCountry = null
    try {
      const demoRes = await fetch(
        `https://graph.facebook.com/v21.0/${ig_user_id}/insights?metric=audience_gender_age,audience_city,audience_country&period=lifetime&access_token=${access_token}`
      )
      const demoData = await demoRes.json()
      if (demoData.data) {
        audienceGenderAge = demoData.data.find((d: { name: string }) => d.name === "audience_gender_age")?.values?.[0]?.value ?? null
        audienceCity = demoData.data.find((d: { name: string }) => d.name === "audience_city")?.values?.[0]?.value ?? null
        audienceCountry = demoData.data.find((d: { name: string }) => d.name === "audience_country")?.values?.[0]?.value ?? null
      }
    } catch { /* demographic data may require additional permissions */ }

    const followers = profile.followers_count as number | null
    const engagementRate = avgReach && followers ? Math.round((avgReach / followers) * 1000) / 10 : null

    // Save snapshot
    await supabase.from("social_insights").insert({
      user_id: user.id,
      platform: "instagram",
      followers,
      follows: profile.follows_count,
      media_count: profile.media_count,
      avg_reach: avgReach,
      avg_impressions: avgImpressions,
      engagement_rate: engagementRate,
      audience_gender_age: audienceGenderAge,
      audience_city: audienceCity,
      audience_country: audienceCountry,
    })

    // Mirror public stats into rate_card_settings for public rate card
    await supabase
      .from("rate_card_settings")
      .update({
        social_stats: {
          ig_followers: followers,
          ig_username: profile.username,
          ig_avg_reach: avgReach ? Math.round(avgReach) : null,
          ig_engagement_rate: engagementRate,
          updated_at: new Date().toISOString(),
        },
      })
      .eq("user_id", user.id)

    revalidatePath("/settings/instagram")
    revalidatePath("/ratecard")
    return { success: true, data: undefined }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
    return { success: false, error: msg }
  }
}
