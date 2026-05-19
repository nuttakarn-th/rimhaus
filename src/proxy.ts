import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Optimistic check — just read cookie, no network call (Next.js 16 requirement)
  const hasSession = request.cookies.getAll().some(
    c => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  )

  if (!hasSession && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
