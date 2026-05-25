"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export type SceneRow = { scene: string; voiceover: string; text: string }

const EMPTY_ROW = (): SceneRow => ({ scene: "", voiceover: "", text: "" })

const HEADERS = [
  { key: "scene" as const,     label: "Scene / Visual",  placeholder: "มืด → fade in เห็น Passion X บน console\n(wide shot ทั้งห้อง)" },
  { key: "voiceover" as const, label: "Voice Over",       placeholder: "มีคนถามว่าตกแต่งบ้านเริ่มจากอะไรก่อน\n\nจริงๆ เราเริ่มจากของที่อยากได้..." },
  { key: "text" as const,      label: "Text Pop-up",      placeholder: '"HiFuture Passion X"' },
]

// ── Conversion helpers ──────────────────────────────────────

const MARKER_PREFIX = "<!--scene-table:"
const MARKER_SUFFIX = "-->"

export function sceneRowsToHTML(rows: SceneRow[]): string {
  const marker = `${MARKER_PREFIX}${JSON.stringify(rows)}${MARKER_SUFFIX}`
  const thead = `<thead><tr>${HEADERS.map(h => `<th>${h.label}</th>`).join("")}</tr></thead>`
  const tbody = `<tbody>${rows.map(r =>
    `<tr>${[r.scene, r.voiceover, r.text].map(v =>
      `<td>${v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</td>`
    ).join("")}</tr>`
  ).join("")}</tbody>`
  return `${marker}<table>${thead}${tbody}</table>`
}

export function parseSceneRows(script: string): SceneRow[] | null {
  if (!script.startsWith(MARKER_PREFIX)) return null
  const end = script.indexOf(MARKER_SUFFIX)
  if (end === -1) return null
  try {
    return JSON.parse(script.slice(MARKER_PREFIX.length, end))
  } catch {
    return null
  }
}

// ── Component ───────────────────────────────────────────────

export function SceneTableEditor({
  rows,
  onChange,
}: {
  rows: SceneRow[]
  onChange: (rows: SceneRow[]) => void
}) {
  const [focusedCell, setFocusedCell] = useState<string | null>(null)

  function update(idx: number, field: keyof SceneRow, value: string) {
    const next = rows.map((r, i) => i === idx ? { ...r, [field]: value } : r)
    onChange(next)
  }

  function addRow() {
    onChange([...rows, EMPTY_ROW()])
  }

  function removeRow(idx: number) {
    if (rows.length <= 1) { onChange([EMPTY_ROW()]); return }
    onChange(rows.filter((_, i) => i !== idx))
  }

  function moveRow(from: number, to: number) {
    if (to < 0 || to >= rows.length) return
    const next = [...rows]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid md:grid-cols-[28px_1fr_1fr_1fr_32px] gap-2 px-1">
        <div />
        {HEADERS.map(h => (
          <div key={h.key} className="text-xs font-semibold text-center text-[hsl(25,20%,15%)] bg-[hsl(25,20%,15%)] text-white rounded py-1.5 px-2">
            {h.label}
          </div>
        ))}
        <div />
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="group relative md:grid md:grid-cols-[28px_1fr_1fr_1fr_32px] gap-2 bg-white border border-[hsl(35,20%,88%)] rounded-xl p-3 md:p-0 md:border-0 md:rounded-none md:bg-transparent"
          >
            {/* Drag handle / row number */}
            <div className="hidden md:flex items-start justify-center pt-2.5 text-xs text-[hsl(25,10%,60%)] select-none">
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveRow(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-0.5 rounded hover:bg-[hsl(35,25%,92%)] disabled:opacity-20 transition-colors"
                  title="ขึ้น"
                >
                  <GripVertical className="w-3.5 h-3.5 text-[hsl(25,10%,55%)]" />
                </button>
                <span className="text-[10px] font-medium text-[hsl(25,10%,55%)]">{idx + 1}</span>
              </div>
            </div>

            {/* 3 cell textareas */}
            {HEADERS.map(h => (
              <div key={h.key} className="flex flex-col gap-1 md:gap-0">
                {/* Mobile: show label */}
                <label className="md:hidden text-[10px] font-semibold text-[hsl(25,10%,45%)] uppercase tracking-wide">{h.label}</label>
                <textarea
                  value={row[h.key]}
                  onChange={e => update(idx, h.key, e.target.value)}
                  onFocus={() => setFocusedCell(`${idx}-${h.key}`)}
                  onBlur={() => setFocusedCell(null)}
                  placeholder={h.placeholder}
                  rows={3}
                  className={[
                    "w-full resize-none rounded-lg border text-sm leading-snug p-2.5 transition-colors",
                    "placeholder:text-[hsl(25,10%,70%)] placeholder:text-xs",
                    "focus:outline-none",
                    focusedCell === `${idx}-${h.key}`
                      ? "border-[hsl(24,85%,50%)] ring-1 ring-[hsl(24,85%,50%)] bg-white"
                      : "border-[hsl(35,20%,85%)] bg-[hsl(35,30%,98%)] hover:border-[hsl(35,20%,72%)]",
                  ].join(" ")}
                />
              </div>
            ))}

            {/* Delete button */}
            <div className="hidden md:flex items-start justify-center pt-2.5">
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="p-1 rounded hover:bg-red-50 text-[hsl(25,10%,60%)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="ลบแถวนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile: delete */}
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="md:hidden flex items-center gap-1 text-xs text-red-400 hover:text-red-500 mt-1 self-end ml-auto"
            >
              <Trash2 className="w-3 h-3" />ลบ
            </button>
          </div>
        ))}
      </div>

      {/* Add row */}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 text-sm text-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,40%)] font-medium transition-colors px-1"
      >
        <Plus className="w-4 h-4" />เพิ่มฉาก
      </button>

      {/* Preview hint */}
      <p className="text-xs text-[hsl(25,10%,55%)] px-1">
        บันทึกแล้ว Preview จะแสดงเป็นตารางอัตโนมัติ
      </p>
    </div>
  )
}
