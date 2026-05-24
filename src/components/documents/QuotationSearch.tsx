"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import type { Document } from "@/lib/types"

type Props = {
  quotations: Document[]
  value: string
  onChange: (id: string) => void
}

export function QuotationSearch({ quotations, value, onChange }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = quotations.find(q => q.id === value)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  const filtered = quotations.filter(q => {
    const s = query.toLowerCase()
    return (
      q.doc_number.toLowerCase().includes(s) ||
      (q.customer_name ?? "").toLowerCase().includes(s) ||
      (q.customer_tax_id ?? "").toLowerCase().includes(s) ||
      (q.customer_contact ?? "").toLowerCase().includes(s) ||
      (q.customer_address ?? "").toLowerCase().includes(s)
    )
  })

  function handleSelect(id: string) {
    onChange(id)
    setQuery("")
    setOpen(false)
  }

  function handleClear() {
    onChange("")
    setQuery("")
  }

  return (
    <div ref={ref} className="relative">
      {selected && !open ? (
        <div className="flex items-center gap-2 border border-[hsl(35,20%,80%)] rounded-md px-3 py-2 bg-white">
          <div className="flex-1 text-sm">
            <span className="font-medium text-[hsl(25,20%,15%)]">{selected.doc_number}</span>
            <span className="text-[hsl(25,10%,55%)] ml-2">· {selected.customer_name}</span>
          </div>
          <button type="button" onClick={handleClear} className="text-[hsl(25,10%,55%)] hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(25,10%,60%)]" />
          <Input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="ค้นหาด้วยเลขที่ / ชื่อ / เลขภาษี / ผู้ติดต่อ..."
            className="pl-9"
          />
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[hsl(35,20%,88%)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-[hsl(25,10%,55%)] text-center py-4">ไม่พบใบเสนอราคา</p>
          ) : (
            filtered.map(q => (
              <button
                key={q.id}
                type="button"
                className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors border-b border-[hsl(35,20%,92%)] last:border-0"
                onClick={() => handleSelect(q.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-semibold text-[hsl(25,20%,15%)]">{q.doc_number}</span>
                    <span className="text-xs text-[hsl(25,10%,50%)] ml-2">{q.customer_name}</span>
                  </div>
                  <span className="text-xs text-[hsl(24,85%,50%)] font-medium shrink-0">
                    {new Date(q.doc_date).toLocaleDateString("th-TH")}
                  </span>
                </div>
                {q.customer_tax_id && (
                  <div className="text-xs text-[hsl(25,10%,60%)] mt-0.5">เลขภาษี {q.customer_tax_id}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
