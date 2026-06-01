"use client"

import { useState, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { Mark, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  TableIcon, Image as ImageIcon,
  Undo2, Redo2, Minus, Type,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BRIEF_TEMPLATE = `<h2>Story / Concept</h2><p>เล่าเรื่องหรือแนวคิดหลักของคอนเทนต์...</p><h2>Scene</h2><p>Scene 1: ...</p><p>Scene 2: ...</p><p>Scene 3: ...</p>`

// Custom mark: wraps selected text with inline styles (font-size, color, background-color)
const FontSizeMark = Mark.create({
  name: "textStyle",
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: el => (el as HTMLElement).style.fontSize || null,
        renderHTML: () => ({}),
      },
      color: {
        default: null,
        parseHTML: el => (el as HTMLElement).style.color || null,
        renderHTML: () => ({}),
      },
      backgroundColor: {
        default: null,
        parseHTML: el => (el as HTMLElement).style.backgroundColor || null,
        renderHTML: () => ({}),
      },
    }
  },
  parseHTML() { return [{ tag: "span[style]" }] },
  renderHTML({ HTMLAttributes }) {
    const styles: string[] = []
    if (HTMLAttributes.fontSize) styles.push(`font-size: ${HTMLAttributes.fontSize}`)
    if (HTMLAttributes.color) styles.push(`color: ${HTMLAttributes.color}`)
    if (HTMLAttributes.backgroundColor) styles.push(`background-color: ${HTMLAttributes.backgroundColor}`)
    return ["span", styles.length ? { style: styles.join("; ") } : {}, 0]
  },
})

// Extend TableCell and TableHeader to preserve inline style
const StyledTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: el => el.getAttribute("style"),
        renderHTML: attrs => attrs.style ? { style: attrs.style } : {},
      },
    }
  },
})

const StyledTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: el => el.getAttribute("style"),
        renderHTML: attrs => attrs.style ? { style: attrs.style } : {},
      },
    }
  },
})

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  defaultContent?: string
}

export function ContentBriefEditor({ value, onChange, placeholder, defaultContent }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const tableButtonRef = useRef<HTMLButtonElement>(null)

  const [tablePopover, setTablePopover] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  const FONT_SIZE_OPTIONS = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 24, 36]
  const [toolbarFontSize, setToolbarFontSize] = useState(7)

  const TEXT_COLORS = [
    "#000000","#444444","#666666","#999999","#cccccc","#ffffff",
    "#cc0000","#e67e22","#f1c232","#27ae60","#2980b9","#8e44ad",
    "#e74c3c","#f39c12","#a3cb38","#16a085","#2c82c9","#c27ba0",
  ]
  const BG_COLORS = [
    "remove","#fce5cd","#fff2cc","#d9ead3","#d0e4f7","#ead1dc",
    "#d9d2e9","#f4cccc","#fce8b2","#b6d7a8","#9fc5e8","#c9daf8",
    "#ffcccc","#ffd9b3","#ffffb3","#ccffcc","#b3d9ff","#e6ccff",
  ]
  const [textColor, setTextColor] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<string | null>(null)
  const [colorPickerOpen, setColorPickerOpen] = useState<"text" | "bg" | null>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      FontSizeMark,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      StyledTableHeader,
      StyledTableCell,
      Placeholder.configure({
        placeholder: placeholder ?? "เขียน Brief/Script ที่นี่...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || defaultContent || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[320px] px-4 py-3",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Sync toolbar state from cursor position
  useEffect(() => {
    if (!editor) return
    function update() {
      const attrs = editor.getAttributes("textStyle")
      if (attrs.fontSize) {
        const num = parseFloat(attrs.fontSize)
        if (!isNaN(num)) setToolbarFontSize(num)
      }
      setTextColor(attrs.color ?? null)
      setBgColor(attrs.backgroundColor ?? null)
    }
    editor.on("selectionUpdate", update)
    return () => { editor.off("selectionUpdate", update) }
  }, [editor])

  // Close color picker on outside click
  useEffect(() => {
    if (!colorPickerOpen) return
    function handler(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [colorPickerOpen])

  // Close table popover on outside click
  useEffect(() => {
    if (!tablePopover) return
    function handler(e: MouseEvent) {
      const panel = document.querySelector("[data-table-popover='container']")
      if (panel && !panel.contains(e.target as Node)) setTablePopover(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [tablePopover])

  function applyFontSize(size: number) {
    if (!editor) return
    editor.chain().focus().setMark("textStyle", { fontSize: `${size}pt` }).run()
  }

  function applyTextColor(color: string) {
    if (!editor) return
    editor.chain().focus().setMark("textStyle", { color: color === "remove" ? null : color }).run()
    setTextColor(color === "remove" ? null : color)
    setColorPickerOpen(null)
  }

  function applyBgColor(color: string) {
    if (!editor) return
    editor.chain().focus().setMark("textStyle", { backgroundColor: color === "remove" ? null : color }).run()
    setBgColor(color === "remove" ? null : color)
    setColorPickerOpen(null)
  }

  function handleInsertTable() {
    const numRows = Math.max(1, tableRows)
    const numCols = Math.max(1, tableCols)
    const headerCells = Array(numCols).fill(`<th style="font-size: 7pt"><p></p></th>`).join("")
    const bodyRows = Array(Math.max(1, numRows - 1))
      .fill(`<tr>${Array(numCols).fill(`<td><p></p></td>`).join("")}</tr>`)
      .join("")
    const html = `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table><p></p>`
    editor?.chain().focus().insertContent(html).run()
    setTablePopover(false)
  }

  function insertImage() { imageInputRef.current?.click() }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const reader = new FileReader()
    reader.onload = () => { editor.chain().focus().setImage({ src: reader.result as string }).run() }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  if (!editor) return null

  const ToolBtn = ({
    onClick, active, title, children,
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button" onClick={onClick} title={title}
      className={cn(
        "p-1.5 rounded hover:bg-[hsl(35,25%,92%)] transition-colors",
        active ? "bg-[hsl(35,25%,88%)] text-[hsl(24,85%,50%)]" : "text-[hsl(25,20%,35%)]"
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-[hsl(35,20%,88%)] rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[hsl(35,20%,92%)] bg-[hsl(35,30%,98%)] flex-wrap">

        {/* Font size — dropdown */}
        <div className="flex items-center gap-1 mr-1" title="ขนาด Text">
          <Type className="w-3.5 h-3.5 text-[hsl(25,20%,35%)]" />
          <select
            value={toolbarFontSize}
            onChange={e => {
              const size = Number(e.target.value)
              setToolbarFontSize(size)
              applyFontSize(size)
            }}
            className="px-1 py-0.5 text-xs border border-[hsl(35,20%,83%)] rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(24,85%,50%)] bg-white"
          >
            {FONT_SIZE_OPTIONS.map(s => (
              <option key={s} value={s}>{s} pt</option>
            ))}
          </select>
        </div>

        <span className="w-px h-4 bg-[hsl(35,20%,85%)] mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="ตัวหนา">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="ตัวเอียง">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="ขีดเส้นใต้">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="ขีดทับ">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>

        {/* Color pickers */}
        <div className="relative flex items-center" ref={colorPickerRef}>
          {/* Text color */}
          <button
            type="button"
            title="สีตัวอักษร"
            onClick={() => setColorPickerOpen(v => v === "text" ? null : "text")}
            className={cn("p-1.5 rounded hover:bg-[hsl(35,25%,92%)] transition-colors flex flex-col items-center gap-0", colorPickerOpen === "text" ? "bg-[hsl(35,25%,88%)]" : "")}
          >
            <span className="text-[11px] font-bold leading-none" style={{ color: textColor ?? "#000" }}>A</span>
            <div className="w-3.5 h-1 rounded-sm mt-0.5" style={{ backgroundColor: textColor ?? "#000" }} />
          </button>
          {/* Background color */}
          <button
            type="button"
            title="สีพื้นหลังข้อความ"
            onClick={() => setColorPickerOpen(v => v === "bg" ? null : "bg")}
            className={cn("p-1.5 rounded hover:bg-[hsl(35,25%,92%)] transition-colors flex flex-col items-center gap-0", colorPickerOpen === "bg" ? "bg-[hsl(35,25%,88%)]" : "")}
          >
            <div className="w-3.5 h-3.5 rounded-sm border border-[hsl(35,20%,70%)] text-[9px] flex items-center justify-center font-bold"
              style={{ backgroundColor: bgColor && bgColor !== "remove" ? bgColor : "#fff" }}>
              <span style={{ color: bgColor && bgColor !== "remove" ? "#333" : "#999" }}>a</span>
            </div>
          </button>

          {/* Color palette dropdown */}
          {colorPickerOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-[hsl(35,20%,85%)] rounded-xl shadow-xl p-3 w-36"
              onMouseDown={e => e.stopPropagation()}>
              <p className="text-[10px] font-semibold text-[hsl(25,10%,50%)] mb-2 uppercase tracking-wide">
                {colorPickerOpen === "text" ? "สีตัวอักษร" : "สีพื้นหลัง"}
              </p>
              <div className="grid grid-cols-6 gap-1">
                {(colorPickerOpen === "text" ? TEXT_COLORS : BG_COLORS).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => colorPickerOpen === "text" ? applyTextColor(color) : applyBgColor(color)}
                    className="w-4 h-4 rounded-sm border border-[hsl(35,20%,78%)] hover:scale-125 transition-transform flex items-center justify-center"
                    style={{ backgroundColor: color === "remove" ? "#fff" : color }}
                    title={color === "remove" ? "ลบสี" : color}
                  >
                    {color === "remove" && <span className="text-red-400 text-[9px] leading-none font-bold">×</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="w-px h-4 bg-[hsl(35,20%,85%)] mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="หัวข้อ 1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="หัวข้อ 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="หัวข้อ 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="w-px h-4 bg-[hsl(35,20%,85%)] mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="รายการหัวข้อย่อย">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="รายการลำดับ">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="w-px h-4 bg-[hsl(35,20%,85%)] mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="ชิดซ้าย">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="กึ่งกลาง">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="ชิดขวา">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="w-px h-4 bg-[hsl(35,20%,85%)] mx-1" />

        {/* Table button with popover */}
        <div className="relative" data-table-popover="container">
          <button
            ref={tableButtonRef}
            type="button"
            title="แทรกตาราง"
            onClick={() => setTablePopover(v => !v)}
            className={cn(
              "p-1.5 rounded hover:bg-[hsl(35,25%,92%)] transition-colors",
              tablePopover ? "bg-[hsl(35,25%,88%)] text-[hsl(24,85%,50%)]" : "text-[hsl(25,20%,35%)]"
            )}
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>

          {tablePopover && (
            <div
              className="absolute left-0 top-full mt-1 z-50 bg-white border border-[hsl(35,20%,85%)] rounded-xl shadow-lg p-4 w-44"
              onMouseDown={e => e.stopPropagation()}
            >
              <p className="text-xs font-semibold text-[hsl(25,20%,20%)] mb-3">ตั้งค่าตาราง</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-[hsl(25,10%,45%)] shrink-0">แถว</label>
                  <input
                    type="number" min={1} max={30} value={tableRows}
                    onChange={e => setTableRows(Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded-md border border-[hsl(35,20%,85%)] px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[hsl(24,85%,50%)]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-[hsl(25,10%,45%)] shrink-0">คอลัมน์</label>
                  <input
                    type="number" min={1} max={10} value={tableCols}
                    onChange={e => setTableCols(Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded-md border border-[hsl(35,20%,85%)] px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[hsl(24,85%,50%)]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleInsertTable}
                className="mt-3 w-full rounded-lg bg-[hsl(24,85%,50%)] hover:bg-[hsl(24,85%,44%)] text-white text-xs font-semibold py-2 transition-colors"
              >
                แทรกตาราง
              </button>
            </div>
          )}
        </div>

        <ToolBtn onClick={insertImage} title="แทรกรูปภาพ" active={false}>
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="เส้นแบ่ง" active={false}>
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="w-px h-4 bg-[hsl(35,20%,85%)] mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="ย้อนกลับ" active={false}>
          <Undo2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="ทำซ้ำ" active={false}>
          <Redo2 className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </div>
  )
}
