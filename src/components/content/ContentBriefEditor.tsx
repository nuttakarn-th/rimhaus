"use client"

import { useState, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
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
  Undo2, Redo2, Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BRIEF_TEMPLATE = `<h2>Story / Concept</h2><p>เล่าเรื่องหรือแนวคิดหลักของคอนเทนต์...</p><h2>Scene</h2><p>Scene 1: ...</p><p>Scene 2: ...</p><p>Scene 3: ...</p>`

// Extend TableCell and TableHeader to preserve inline style (for font-size)
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
}

export function ContentBriefEditor({ value, onChange, placeholder }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const tableButtonRef = useRef<HTMLButtonElement>(null)

  const [tablePopover, setTablePopover] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [tableFontSize, setTableFontSize] = useState(10)

  const editor = useEditor({
    extensions: [
      StarterKit,
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
    content: value || BRIEF_TEMPLATE,
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

  // Close popover on outside click
  useEffect(() => {
    if (!tablePopover) return
    function handler(e: MouseEvent) {
      if (tableButtonRef.current && !tableButtonRef.current.closest("[data-table-popover]")?.contains(e.target as Node)) {
        setTablePopover(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [tablePopover])

  function handleInsertTable() {
    const fs = tableFontSize > 0 ? `font-size:${tableFontSize}pt` : ""
    const thAttr = fs ? ` style="${fs}"` : ""
    const tdAttr = fs ? ` style="${fs}"` : ""
    const numRows = Math.max(1, tableRows)
    const numCols = Math.max(1, tableCols)

    const headerCells = Array(numCols).fill(`<th${thAttr}><p></p></th>`).join("")
    const bodyRows = Array(Math.max(1, numRows - 1))
      .fill(`<tr>${Array(numCols).fill(`<td${tdAttr}><p></p></td>`).join("")}</tr>`)
      .join("")

    const html = `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table><p></p>`
    editor?.chain().focus().insertContent(html).run()
    setTablePopover(false)
  }

  function insertImage() {
    imageInputRef.current?.click()
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run()
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  if (!editor) return null

  const ToolBtn = ({
    onClick, active, title, children, btnRef, "data-table-popover": dataAttr,
  }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
    btnRef?: React.RefObject<HTMLButtonElement | null>
    "data-table-popover"?: string
  }) => (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      title={title}
      data-table-popover={dataAttr}
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
            data-table-popover="trigger"
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
              data-table-popover="panel"
              className="absolute left-0 top-full mt-1 z-50 bg-white border border-[hsl(35,20%,85%)] rounded-xl shadow-lg p-4 w-56"
              onMouseDown={e => e.stopPropagation()}
            >
              <p className="text-xs font-semibold text-[hsl(25,20%,20%)] mb-3">ตั้งค่าตาราง</p>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-[hsl(25,10%,45%)] w-20 shrink-0">จำนวนแถว</label>
                  <input
                    type="number" min={1} max={30} value={tableRows}
                    onChange={e => setTableRows(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-md border border-[hsl(35,20%,85%)] px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[hsl(24,85%,50%)]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-[hsl(25,10%,45%)] w-20 shrink-0">จำนวนคอลัมน์</label>
                  <input
                    type="number" min={1} max={10} value={tableCols}
                    onChange={e => setTableCols(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-md border border-[hsl(35,20%,85%)] px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[hsl(24,85%,50%)]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-[hsl(25,10%,45%)] w-20 shrink-0">ขนาด Text (pt)</label>
                  <div className="relative w-full">
                    <input
                      type="number" min={6} max={72} value={tableFontSize}
                      onChange={e => setTableFontSize(Math.max(6, Number(e.target.value)))}
                      className="w-full rounded-md border border-[hsl(35,20%,85%)] px-2 py-1 pr-7 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[hsl(24,85%,50%)]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[hsl(25,10%,55%)] pointer-events-none">pt</span>
                  </div>
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
