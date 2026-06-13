"use client"

import { useEffect, useRef, useState } from "react"

const CHARS = "!<>—_\\/[]{}=+*^?#@$%&"
const TOTAL_FRAMES = 52

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
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function scramble(frame: number) {
      let out = ""
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === " " || ch === "'" || ch === "'" || ch === ",") {
          out += ch
          continue
        }
        const settleAt = Math.floor((i / text.length) * TOTAL_FRAMES) + 10
        out += frame >= settleAt
          ? ch
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      }
      setDisplay(out)
      if (frame < TOTAL_FRAMES + 8) {
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
          rafRef.current = requestAnimationFrame(() => scramble(0))
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [text])

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  )
}
