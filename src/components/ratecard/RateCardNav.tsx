"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Props {
  pageName: string
  hasPortfolio: boolean
  hasPartners: boolean
  hasGallery: boolean
  contactLine: string | null
}

const LINE_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
)

export function RateCardNav({ pageName, hasPortfolio, hasPartners, hasGallery, contactLine }: Props) {
  const pathname = usePathname()
  const isHome = pathname === "/ratecard"

  // Start opaque on non-home pages, start transparent on home
  const [scrolled, setScrolled] = useState(!isHome)

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const check = () => setScrolled(window.scrollY > 60)
    check()
    window.addEventListener("scroll", check, { passive: true })
    return () => window.removeEventListener("scroll", check)
  }, [isHome])

  const ghost = isHome && !scrolled

  const navItems = [
    { label: "Rate Card",        href: "/ratecard",           always: true },
    { label: "ตัวอย่าง Content", href: "/ratecard/portfolio", show: hasPortfolio },
    { label: "Gallery",          href: "/ratecard/gallery",   show: hasGallery },
    { label: "All Partner",      href: "/ratecard/partners",  show: hasPartners },
  ]
  const visibleItems = navItems.filter(item => item.always || item.show)

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      ghost
        ? "bg-transparent border-b border-white/10"
        : "bg-white/95 backdrop-blur-md border-b border-[hsl(35,20%,88%)] shadow-sm"
    }`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Top row */}
        <div className="h-14 flex items-center justify-between gap-2">
          <span className={`font-black text-base truncate shrink-0 transition-colors duration-300 ${ghost ? "text-white" : "text-[hsl(25,20%,15%)]"}`}>
            🏠 {pageName}
          </span>

          {/* Desktop nav (center) */}
          <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
            {visibleItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? ghost
                        ? "bg-white/20 text-white"
                        : "bg-[hsl(24,85%,50%)] text-white"
                      : ghost
                        ? "text-white/75 hover:text-white hover:bg-white/10"
                        : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)] hover:bg-[hsl(35,30%,97%)]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: LINE CTA + Admin */}
          <div className="flex items-center gap-2 shrink-0">
            {contactLine && (
              <a
                href={`https://line.me/ti/p/~${contactLine}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#06C755] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-[#05b34c] hover:shadow-md transition-all whitespace-nowrap"
              >
                {LINE_ICON}
                LINE: {contactLine}
              </a>
            )}
            <Link
              href="/dashboard"
              className={`text-xs transition-colors duration-300 ${ghost ? "text-white/70 hover:text-white" : "text-[hsl(25,10%,50%)] hover:text-[hsl(24,85%,50%)]"}`}
            >
              Admin →
            </Link>
          </div>
        </div>

        {/* Mobile: nav + LINE on second row */}
        <div className={`flex sm:hidden items-center gap-1.5 pb-2 overflow-x-auto ${ghost ? "border-t border-white/10" : ""}`}>
          {visibleItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? ghost
                      ? "bg-white/20 text-white"
                      : "bg-[hsl(24,85%,50%)] text-white"
                    : ghost
                      ? "text-white/75 hover:text-white hover:bg-white/10"
                      : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)] hover:bg-[hsl(35,30%,97%)]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          {contactLine && (
            <a
              href={`https://line.me/ti/p/~${contactLine}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-[#06C755] text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ml-auto shrink-0"
            >
              {LINE_ICON}
              LINE
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
