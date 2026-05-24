"use client"

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
import { useEffect, useRef } from "react"
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  TableIcon, Image as ImageIcon,
  Undo2, Redo2, Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BRIEF_TEMPLATE = `<h2>Story / Concept</h2><p>เล่าเรื่องหรือแนวคิดหลักของคอนเทนต์...</p><h2>Scene</h2><p>Scene 1: ...</p><p>Scene 2: ...</p><p>Scene 3: ...</p>`

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function ContentBriefEditor({ value, onChange, placeholder }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
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

  // Sync external value changes (e.g., when editing existing item)
  useEffect(() => {
    if (!editor) return
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function insertTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
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
    onClick, active, title, children,
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
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

        <ToolBtn onClick={insertTable} title="แทรกตาราง" active={false}>
          <TableIcon className="w-3.5 h-3.5" />
        </ToolBtn>
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
