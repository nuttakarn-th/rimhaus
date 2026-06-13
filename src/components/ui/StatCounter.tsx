"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  to: number
  decimals?: number
  suffix?: string
  duration?: number
  delay?: number
}

export function StatCounter({ to, decimals = 0, suffix = "", duration = 1800, delay = 0 }: Props) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(to)
      return
    }

    const timer = window.setTimeout(() => {
      const startTime = performance.now()

      function tick(now: number) {
        const elapsed = now - startTime
        const t = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - t, 4) // ease-out quart (dramatic decel)
        const current = to * eased
        setDisplay(parseFloat(current.toFixed(decimals)))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setDisplay(to)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [to, decimals, duration, delay])

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString()

  return <span className="tabular-nums">{formatted}{suffix}</span>
}
