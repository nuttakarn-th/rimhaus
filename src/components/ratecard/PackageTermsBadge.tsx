"use client"

import { useState } from "react"
import { X, FileText } from "lucide-react"

export function PackageTermsBadge({ name, terms }: { name: string; terms: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        className="flex items-center gap-1 text-[10px] font-medium text-[hsl(25,10%,55%)] hover:text-[hsl(24,85%,50%)] transition-colors mt-1"
      >
        <FileText className="w-3 h-3" />
        ดูเงื่อนไข
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[75vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[hsl(35,20%,85%)]" />
            </div>
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[hsl(35,20%,90%)]">
              <div>
                <p className="text-[10px] font-bold text-[hsl(24,85%,50%)] uppercase tracking-widest mb-0.5">เงื่อนไขการจ้างงาน</p>
                <h3 className="font-black text-sm text-[hsl(25,20%,12%)]">{name}</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[hsl(25,10%,55%)] hover:text-[hsl(25,20%,20%)] transition-colors mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="px-5 py-4 overflow-y-auto">
              <p className="text-sm text-[hsl(25,20%,20%)] leading-relaxed whitespace-pre-line">{terms}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
