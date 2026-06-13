"use client"

import { useEffect, useRef, useState } from "react"

// Lowercase letters feel organic with serif fonts — not harsh punctuation
const CHARS = "abcdefghijklmnopqrstuvwxyz"
const TOTAL_FRAMES = 78
const CHANGE_EVERY = 3 // update random chars every N frames, not every frame

export function TextScramble({
  text,
  className,
  style,
}: {
  text: string
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)
  const hasRun = useRef(false)
  const charsRef = useRef<string[]>(text.split(""))
  const settleRef = useRef<number[]>([])
  const [display, setDisplay] = useState(text)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function scramble(frame: number) {
      const arr = [...charsRef.current]

      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === " " || ch === "'" || ch === "'" || ch === ",") {
          arr[i] = ch
          continue
        }
        if (frame >= settleRef.current[i]) {
          arr[i] = ch
        } else if (frame % CHANGE_EVERY === 0) {
          arr[i] = CHARS[Math.floor(Math.random() * CHARS.length)]
        }
        // else: keep previous char → smoother, less flicker
      }

      charsRef.current = arr
      setDisplay(arr.join(""))

      if (frame < TOTAL_FRAMES + 10) {
        rafRef.current = requestAnimationFrame(() => scramble(frame + 1))
      } else {
        setDisplay(text)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true
          observer.unobserve(el)

          // Pre-compute settle frame per character with slight noise
          const nonSpaceTotal = text.replace(/[ '']/g, "").length
          let nonSpaceIdx = 0
          settleRef.current = text.split("").map((ch) => {
            if (ch === " " || ch === "'" || ch === "'") return 0
            const progress = nonSpaceIdx++ / nonSpaceTotal
            // ease-out: early chars settle slower, later chars faster
            const eased = Math.pow(progress, 0.7)
            const base = Math.floor(eased * (TOTAL_FRAMES - 18)) + 10
            return base + Math.floor(Math.random() * 6 - 3) // ±3 frames noise
          })

          // Fade in, then scramble
          setVisible(true)
          setTimeout(() => {
            rafRef.current = requestAnimationFrame(() => scramble(0))
          }, 120)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [text])

  return (
    <span
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease-out",
      }}
    >
      {display}
    </span>
  )
}
