"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { X, ScrollText } from "lucide-react"

export function PackageTermsBadge({ name, terms }: { name: string; terms: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-tx hover:text-brand-tx/80 transition-colors"
      >
        <ScrollText className="w-3 h-3" />
        ดูเงื่อนไข
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                  เงื่อนไขการจ้างงาน
                </p>
                <h3 className="font-black text-base text-foreground">{name}</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors mt-0.5 shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 overflow-y-auto">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{terms}</p>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-3 border-t border-border">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-xl bg-foreground text-white text-sm font-bold hover:bg-foreground/90 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
