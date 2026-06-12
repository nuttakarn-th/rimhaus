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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
)

export function RateCardNav({ pageName, hasPortfolio, hasPartners, hasGallery, contactLine }: Props) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  const [scrolled, setScrolled] = useState(!isHome)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const check = () => setScrolled(window.scrollY > 60)
    check()
    window.addEventListener("scroll", check, { passive: true })
    return () => window.removeEventListener("scroll", check)
  }, [isHome])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  const ghost = isHome && !scrolled

  const navItems = [
    { label: "Rate Card",        href: "/",            always: true },
    { label: "ตัวอย่าง Content", href: "/portfolio",  show: hasPortfolio },
    { label: "Gallery",          href: "/gallery",    show: hasGallery },
    { label: "All Partner",      href: "/partners",   show: hasPartners },
  ]
  const visibleItems = navItems.filter(item => item.always || item.show)

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        ghost
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md border-b border-border shadow-sm"
      }`}>
        <div className="max-w-4xl mx-auto px-4 relative">
          <div className="h-14 flex items-center justify-between gap-2">

            {/* Brand */}
            <span
              className={`shrink-0 transition-colors duration-300 tracking-tight text-[15px] ${ghost ? "text-white" : "text-foreground"}`}
              style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)", fontWeight: 700 }}
            >
              unfinished house
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
                        ? ghost ? "bg-white/20 text-white" : "bg-primary text-white"
                        : ghost ? "text-white/75 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-background"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              {/* LINE — desktop only */}
              {contactLine && (
                <a
                  href={`https://line.me/ti/p/~${contactLine}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-[#06C755] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-[#05b34c] transition-all whitespace-nowrap"
                >
                  {LINE_ICON}
                  LINE: {contactLine}
                </a>
              )}
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label="เมนู"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className={`sm:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  menuOpen
                    ? ghost ? "bg-white/20 text-white" : "bg-secondary text-foreground"
                    : ghost ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {menuOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Floating dropdown card */}
          <div id="mobile-menu" className={`sm:hidden absolute right-4 top-full mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-200 ease-out origin-top-right ${
            menuOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          } ${
            ghost
              ? "bg-foreground/95 backdrop-blur-xl border border-white/10"
              : "bg-white border border-border"
          }`}>
              {/* Nav items */}
              <div className="p-2 space-y-0.5">
                {visibleItems.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? ghost
                            ? "bg-white/15 text-white"
                            : "bg-primary text-white"
                          : ghost
                            ? "text-white/75 hover:bg-white/10 hover:text-white"
                            : "text-muted-foreground hover:bg-background hover:text-foreground"
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Footer: LINE */}
              {contactLine && (
                <div className={`px-2 pb-2 pt-1 ${ghost ? "border-t border-white/10" : "border-t border-border"}`}>
                  <a
                    href={`https://line.me/ti/p/~${contactLine}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#06C755] text-white text-sm font-bold px-3 py-2.5 rounded-xl hover:bg-[#05b34c] transition-colors mt-1"
                  >
                    {LINE_ICON}
                    ติดต่อ LINE
                  </a>
                </div>
              )}
            </div>
        </div>
      </header>

      {/* Backdrop */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}
