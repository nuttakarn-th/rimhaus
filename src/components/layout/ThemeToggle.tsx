"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = stored === "dark" || (!stored && prefersDark)
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  if (!mounted) return <div className="h-10" />

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
        "text-[hsl(25,10%,50%)] hover:bg-[hsl(35,25%,92%)] hover:text-[hsl(25,20%,15%)]",
        "dark:text-[hsl(35,15%,60%)] dark:hover:bg-[hsl(25,12%,20%)] dark:hover:text-[hsl(35,20%,88%)]"
      )}
      title={dark ? "เปลี่ยนเป็น Light Mode" : "เปลี่ยนเป็น Dark Mode"}
    >
      {dark ? (
        <>
          <Sun className="w-4 h-4 shrink-0" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 shrink-0" />
          Dark Mode
        </>
      )}
    </button>
  )
}
