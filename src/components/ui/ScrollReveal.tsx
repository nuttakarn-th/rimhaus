"use client"

import { useEffect, useRef } from "react"

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  variant?: "default" | "scale"
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (delay) el.style.transitionDelay = `${delay}ms`
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view")
          observer.unobserve(el)
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -20px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const baseClass = variant === "scale" ? "reveal-scale" : "reveal"

  return (
    <div ref={ref} className={`${baseClass} ${className}`}>
      {children}
    </div>
  )
}
