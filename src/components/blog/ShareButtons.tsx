"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function ShareButtons() {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function shareToLine() {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-[hsl(25,10%,55%)] font-medium uppercase tracking-wider">แชร์</span>

      <button
        type="button"
        onClick={copyLink}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          copied
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-[hsl(35,30%,96%)] text-[hsl(25,20%,30%)] border-[hsl(35,20%,85%)] hover:border-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,45%)]"
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
      </button>

      <button
        type="button"
        onClick={shareToLine}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-[#06C755]/5 text-[#06C755] border-[#06C755]/25 hover:bg-[#06C755]/10 transition-all"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.04 2 11.04c0 3.47 2.2 6.52 5.47 8.23l-.7 2.6 3.04-1.58c.69.19 1.44.29 2.19.29 5.52 0 10-4.04 10-9.04C22 6.04 17.52 2 12 2zm5.14 11.76l-1.37-.98-1.3 1.95-2.4-1.95-3.15 3.43 2.28-3.61-1.98-1.62 1.47-.02L12 9.1l2.02 2.14 1.36-.01-2.05 1.67 3.81-.14z"/>
        </svg>
        แชร์ LINE
      </button>
    </div>
  )
}
