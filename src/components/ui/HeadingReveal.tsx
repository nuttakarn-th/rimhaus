"use client"

import { useEffect, useRef } from "react"

export function HeadingReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view")
          observer.unobserve(el)
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -30px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className="heading-reveal">{children}</div>
}
