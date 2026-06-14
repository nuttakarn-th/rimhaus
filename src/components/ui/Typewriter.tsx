"use client"

import { useEffect, useRef, useState } from "react"

export function Typewriter({
  lines,
  speed = 45,
  pauseBetween = 400,
  className,
  style,
}: {
  lines: string[]
  speed?: number
  pauseBetween?: number
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [displayed, setDisplayed] = useState<string[]>(lines.map(() => ""))
  const [typingLine, setTypingLine] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(lines.slice())
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTypingLine(0)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [lines])

  useEffect(() => {
    if (typingLine === null || typingLine >= lines.length) return

    const line = lines[typingLine]
    let i = 0

    const id = setInterval(() => {
      i++
      setDisplayed(prev => {
        const next = [...prev]
        next[typingLine] = line.slice(0, i)
        return next
      })
      if (i >= line.length) {
        clearInterval(id)
        if (typingLine + 1 < lines.length) {
          setTimeout(() => setTypingLine(t => (t ?? 0) + 1), pauseBetween)
        } else {
          setTypingLine(null)
        }
      }
    }, speed)

    return () => clearInterval(id)
  }, [typingLine, lines, speed, pauseBetween])

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} style={style}>
      {/* Invisible spacer — reserves full height from the start */}
      <div aria-hidden className="invisible">
        {lines.map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </div>
      {/* Animated text — absolutely positioned on top */}
      <div className="absolute inset-0">
        {lines.map((_, i) => (
          <span key={i} className="block">
            {displayed[i]}
            {typingLine === i && (
              <span className="inline-block w-[2px] h-[0.85em] bg-current mx-0.5 align-middle animate-pulse" />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
