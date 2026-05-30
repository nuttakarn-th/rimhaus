import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const fbError = searchParams.get("error")

  if (fbError || !code) {
    const reason = fbError === "access_denied" ? "cancelled" : fbError ?? "no_code"
    return NextResponse.redirect(new URL(`/settings/instagram?error=${reason}`, request.url))
  }

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!
  const appSecret = process.env.FACEBOOK_APP_SECRET!
  const callbackUrl = new URL("/api/instagram/callback", request.url).toString()
  const settingsUrl = new URL("/settings/instagram", request.url)

  try {
    // 1. Exchange auth code for short-lived user access token
    const tokenRes = await fetch(
      "https://graph.facebook.com/v21.0/oauth/access_token?" +
      new URLSearchParams({ client_id: appId, redirect_uri: callbackUrl, client_secret: appSecret, code }).toString()
    )
    const tokenData = await tokenRes.json()
    if (tokenData.error) throw new Error(tokenData.error.message)

    // 2. Extend to 60-day long-lived token
    const longRes = await fetch(
      "https://graph.facebook.com/v21.0/oauth/access_token?" +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: tokenData.access_token,
      }).toString()
    )
    const longData = await longRes.json()
    const longToken = longData.access_token as string
    const expiresIn = (longData.expires_in as number) ?? 5183944 // ~60 days fallback

    // 3. Get Facebook Pages this user manages
    const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${longToken}`)
    const pagesData = await pagesRes.json()
    if (!pagesData.data?.length) {
      throw new Error("ไม่พบ Facebook Page กรุณาสร้าง Page ก่อน")
    }
    const page = pagesData.data[0] as { id: string; name: string; access_token: string }

    // 4. Get linked Instagram Business Account
    const igRes = await fetch(
      `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    )
    const igData = await igRes.json()
    const igUserId = igData.instagram_business_account?.id as string | undefined
    if (!igUserId) {
      throw new Error("ไม่พบ Instagram Business/Creator Account ที่ผูกกับ Page นี้")
    }

    // 5. Fetch IG profile info
    const profileRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}?fields=followers_count,follows_count,media_count,username&access_token=${longToken}`
    )
    const profile = await profileRes.json()
    if (profile.error) throw new Error(profile.error.message)

    // 6. Fetch reach/impressions (best-effort, may require app review for some accounts)
    let avgReach: number | null = null
    let avgImpressions: number | null = null
    try {
      const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600
      const until = Math.floor(Date.now() / 1000)
      const reachRes = await fetch(
        `https://graph.facebook.com/v21.0/${igUserId}/insights?metric=reach,impressions&period=day&since=${since}&until=${until}&access_token=${longToken}`
      )
      const reachData = await reachRes.json()
      if (reachData.data) {
        const reachArr = (reachData.data.find((d: { name: string }) => d.name === "reach")?.values ?? []) as { value: number }[]
        const impArr = (reachData.data.find((d: { name: string }) => d.name === "impressions")?.values ?? []) as { value: number }[]
        if (reachArr.length) avgReach = reachArr.reduce((s, v) => s + v.value, 0) / reachArr.length
        if (impArr.length) avgImpressions = impArr.reduce((s, v) => s + v.value, 0) / impArr.length
      }
    } catch { /* non-fatal */ }

    // 7. Fetch audience demographics (best-effort)
    let audienceGenderAge = null
    let audienceCity = null
    let audienceCountry = null
    try {
      const demoRes = await fetch(
        `https://graph.facebook.com/v21.0/${igUserId}/insights?metric=audience_gender_age,audience_city,audience_country&period=lifetime&access_token=${longToken}`
      )
      const demoData = await demoRes.json()
      if (demoData.data) {
        audienceGenderAge = demoData.data.find((d: { name: string }) => d.name === "audience_gender_age")?.values?.[0]?.value ?? null
        audienceCity = demoData.data.find((d: { name: string }) => d.name === "audience_city")?.values?.[0]?.value ?? null
        audienceCountry = demoData.data.find((d: { name: string }) => d.name === "audience_country")?.values?.[0]?.value ?? null
      }
    } catch { /* non-fatal */ }

    // 8. Save to DB
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL("/login", request.url))

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
    const followers = profile.followers_count as number | null
    const engagementRate = avgReach && followers ? Math.round((avgReach / followers) * 1000) / 10 : null

    await supabase.from("social_tokens").upsert(
      {
        user_id: user.id,
        platform: "instagram",
        access_token: longToken,
        expires_at: expiresAt,
        page_id: page.id,
        page_name: page.name,
        ig_user_id: igUserId,
        ig_username: profile.username,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" }
    )

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

    // Mirror public-facing stats into rate_card_settings
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

    settingsUrl.searchParams.set("success", "1")
    return NextResponse.redirect(settingsUrl.toString())
  } catch (err) {
    console.error("Instagram OAuth error:", err)
    const msg = err instanceof Error ? encodeURIComponent(err.message) : "unknown"
    settingsUrl.searchParams.set("error", msg)
    return NextResponse.redirect(settingsUrl.toString())
  }
}
