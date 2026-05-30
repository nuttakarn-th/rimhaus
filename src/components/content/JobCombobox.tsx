"use client"

import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReviewJob } from "@/lib/types"

interface Props {
  jobs: ReviewJob[]
  value: string | null       // review_job_id or null
  onChange: (id: string | null) => void
}

export function JobCombobox({ jobs, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = jobs.find(j => j.id === value) ?? null

  const filtered = query.trim() === ""
    ? jobs
    : jobs.filter(j =>
        `${j.brand_name} ${j.product_name}`.toLowerCase().includes(query.toLowerCase())
      )

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [open])

  function select(id: string | null) {
    onChange(id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border border-[hsl(35,20%,85%)] bg-white px-3 py-2 text-sm",
            "hover:border-[hsl(35,20%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)] focus:ring-offset-1",
            "transition-colors"
          )}
        >
          <span className={selected ? "text-[hsl(25,20%,15%)]" : "text-[hsl(25,10%,55%)]"}>
            {selected ? `${selected.brand_name} — ${selected.product_name}` : "ไม่เชื่อมกับงานไหน"}
          </span>
          <ChevronsUpDown className="w-3.5 h-3.5 text-[hsl(25,10%,55%)] shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        sideOffset={4}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[hsl(35,20%,90%)]">
          <Search className="w-3.5 h-3.5 text-[hsl(25,10%,55%)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหาแบรนด์หรือสินค้า..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-[hsl(25,10%,60%)]"
          />
        </div>

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto py-1">
          {/* "No link" option */}
          <button
            type="button"
            onClick={() => select(null)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
              value === null
                ? "bg-[hsl(35,25%,95%)] text-[hsl(25,20%,15%)]"
                : "text-[hsl(25,10%,50%)] hover:bg-[hsl(35,25%,96%)]"
            )}
          >
            <Check className={cn("w-3.5 h-3.5 shrink-0", value === null ? "opacity-100" : "opacity-0")} />
            ไม่เชื่อมกับงานไหน
          </button>

          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-xs text-center text-[hsl(25,10%,55%)]">
              ไม่พบงานที่ตรงกัน
            </p>
          ) : (
            filtered.map(j => (
              <button
                key={j.id}
                type="button"
                onClick={() => select(j.id)}
                className={cn(
                  "w-full flex items-start gap-2 px-3 py-2 text-sm text-left transition-colors",
                  value === j.id
                    ? "bg-[hsl(35,25%,95%)] text-[hsl(25,20%,15%)]"
                    : "hover:bg-[hsl(35,25%,96%)]"
                )}
              >
                <Check className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", value === j.id ? "opacity-100 text-[hsl(24,85%,50%)]" : "opacity-0")} />
                <span className="leading-snug">
                  <span className="font-medium text-[hsl(25,20%,15%)]">{j.brand_name}</span>
                  <span className="text-[hsl(25,10%,50%)]"> — {j.product_name}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
