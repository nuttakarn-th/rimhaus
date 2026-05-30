import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  if (!appId) {
    return NextResponse.redirect(new URL("/settings/instagram?error=no_app_configured", request.url))
  }

  const callbackUrl = new URL("/api/instagram/callback", request.url).toString()
  const scope = [
    "instagram_basic",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement",
  ].join(",")

  const oauthUrl = new URL("https://www.facebook.com/dialog/oauth")
  oauthUrl.searchParams.set("client_id", appId)
  oauthUrl.searchParams.set("redirect_uri", callbackUrl)
  oauthUrl.searchParams.set("scope", scope)
  oauthUrl.searchParams.set("response_type", "code")

  return NextResponse.redirect(oauthUrl.toString())
}
