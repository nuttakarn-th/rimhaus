"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertPackage, deletePackage, reorderPackages } from "@/actions/ratecard.actions"
import { RATE_CARD_CATEGORY_LABELS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2, Plus, X, Check, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { PlatformBubble, PLATFORM_LABELS } from "@/components/ui/PlatformIcon"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { RateCardPackage, RateCardCategory } from "@/lib/types"

const PLATFORM_KEYS = ["facebook", "instagram", "tiktok", "lemon8", "youtube", "shopee"] as const

const emptyForm = {
  name: "", category: "per_platform" as RateCardCategory, price: "" as string | number,
  original_price: "" as string | number, unit: "", description: "",
  is_featured: false, is_active: true, sort_order: 99,
  sub_items: [] as Array<{ label: string; price: number }>,
  platforms: [] as string[],
  content_type: null as "video" | "photo" | null,
}

type FormState = typeof emptyForm

interface PackageFormProps {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  saving: boolean
  id?: string
  onSave: (id?: string) => void
  onCancel: () => void
}

function PackageForm({ form, setForm, saving, id, onSave, onCancel }: PackageFormProps) {
  return (
    <div className="border-2 border-[hsl(24,85%,50%)] rounded-xl p-4 space-y-3 bg-orange-50">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">ชื่อ Package *</Label>
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Album Photo" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">หมวดหมู่</Label>
          <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as RateCardCategory }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(RATE_CARD_CATEGORY_LABELS) as [RateCardCategory, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">ราคา (บาท)</Label>
          <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="4000" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">ราคาเดิม (บาท)</Label>
          <Input type="number" value={form.original_price} onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))} placeholder="6000" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">หน่วย</Label>
          <Input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="THB/clip/platform" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">คำอธิบาย</Label>
        <Textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>
      {/* Content type */}
      <div className="space-y-1.5">
        <Label className="text-xs">ประเภทคอนเทนต์</Label>
        <div className="flex gap-2">
          {([
            { value: "video", label: "🎬 VDO" },
            { value: "photo", label: "📷 Photo Album" },
          ] as const).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm(p => ({ ...p, content_type: p.content_type === opt.value ? null : opt.value }))}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                form.content_type === opt.value
                  ? "border-[hsl(24,85%,50%)] bg-orange-50 text-[hsl(24,85%,40%)]"
                  : "border-[hsl(35,20%,88%)] bg-white text-[hsl(25,10%,50%)] hover:border-[hsl(24,85%,60%)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform selector */}
      <div className="space-y-1.5">
        <Label className="text-xs">Platform (เลือกได้หลายอัน)</Label>
        <div className="flex gap-2 flex-wrap">
          {PLATFORM_KEYS.map(p => {
            const selected = form.platforms.includes(p)
            return (
              <button
                key={p}
                type="button"
                onClick={() => setForm(prev => ({
                  ...prev,
                  platforms: selected
                    ? prev.platforms.filter(x => x !== p)
                    : [...prev.platforms, p],
                }))}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  selected
                    ? "border-[hsl(24,85%,50%)] bg-orange-50 text-[hsl(24,85%,40%)]"
                    : "border-[hsl(35,20%,88%)] bg-white text-[hsl(25,10%,50%)] hover:border-[hsl(24,85%,60%)]"
                }`}
              >
                <PlatformBubble platform={p} size={18} noHover />
                <span>{PLATFORM_LABELS[p] ?? p}</span>
                {selected && <span className="text-[hsl(24,85%,50%)]">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: Boolean(v) }))} />
          เด่น (Featured)
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: Boolean(v) }))} />
          แสดงผล
        </label>
        <div className="flex items-center gap-2 ml-auto">
          <Label className="text-xs">ลำดับ</Label>
          <Input type="number" className="w-16" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3.5 h-3.5 mr-1" />ยกเลิก
        </Button>
        <Button size="sm" onClick={() => onSave(id)} disabled={!form.name || saving}>
          <Check className="w-3.5 h-3.5 mr-1" />{saving ? "บันทึก..." : "บันทึก"}
        </Button>
      </div>
    </div>
  )
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

interface SortableRowProps {
  pkg: RateCardPackage
  editId: string | null
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  saving: boolean
  onEdit: (pkg: RateCardPackage) => void
  onSave: (id?: string) => void
  onCancel: () => void
  onDelete: (id: string, name: string) => void
}

function SortableRow({ pkg, editId, form, setForm, saving, onEdit, onSave, onCancel, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pkg.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  if (editId === pkg.id) {
    return (
      <div ref={setNodeRef} style={style}>
        <PackageForm id={pkg.id} form={form} setForm={setForm} saving={saving} onSave={onSave} onCancel={onCancel} />
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-white rounded-xl border border-[hsl(35,20%,88%)] px-3 py-3">
      <button
        {...attributes}
        {...listeners}
        className="text-[hsl(25,10%,65%)] hover:text-[hsl(25,10%,35%)] cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="ลาก"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-[hsl(25,20%,15%)]">{pkg.name}</span>
          {pkg.is_featured && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">เด่น</span>}
          {!pkg.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">ซ่อน</span>}
          {pkg.platforms && pkg.platforms.length > 0 && (
            <div className="flex gap-1">
              {pkg.platforms.map(p => <PlatformBubble key={p} platform={p} size={16} noHover />)}
            </div>
          )}
          {pkg.content_type === "video" && <span className="text-sm">🎬</span>}
          {pkg.content_type === "photo" && <span className="text-sm">📷</span>}
        </div>
        <div className="text-xs text-[hsl(25,10%,50%)] mt-0.5">
          {pkg.price != null ? formatCurrency(pkg.price) : pkg.sub_items?.length ? `${pkg.sub_items.length} ระดับราคา` : "ราคาตามตกลง"}
          {pkg.unit && ` · ${pkg.unit}`}
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={() => onEdit(pkg)}><Pencil className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => onDelete(pkg.id, pkg.name)}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

// ─── Sortable category group ──────────────────────────────────────────────────

interface SortableGroupProps {
  cat: RateCardCategory
  items: RateCardPackage[]
  onReorder: (cat: RateCardCategory, newItems: RateCardPackage[]) => void
  editId: string | null
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  saving: boolean
  onEdit: (pkg: RateCardPackage) => void
  onSave: (id?: string) => void
  onCancel: () => void
  onDelete: (id: string, name: string) => void
}

function SortableGroup({ cat, items, onReorder, ...rowProps }: SortableGroupProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    onReorder(cat, arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map(pkg => (
            <SortableRow key={pkg.id} pkg={pkg} {...rowProps} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const CATS = ["per_platform", "bundle", "addon", "barter"] as RateCardCategory[]

export function AdminPackages({ packages }: { packages: RateCardPackage[] }) {
  const router = useRouter()
  const [editId, setEditId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const [groups, setGroups] = useState<Record<RateCardCategory, RateCardPackage[]>>(
    () => Object.fromEntries(CATS.map(cat => [cat, packages.filter(p => p.category === cat)])) as Record<RateCardCategory, RateCardPackage[]>
  )

  function startEdit(pkg: RateCardPackage) {
    setAdding(false)
    setEditId(pkg.id)
    setForm({
      name: pkg.name, category: pkg.category,
      price: pkg.price ?? "", original_price: pkg.original_price ?? "",
      unit: pkg.unit ?? "", description: pkg.description ?? "",
      is_featured: pkg.is_featured, is_active: pkg.is_active,
      sort_order: pkg.sort_order, sub_items: pkg.sub_items ?? [],
      platforms: pkg.platforms ?? [],
      content_type: pkg.content_type ?? null,
    })
  }

  function startAdd() {
    setEditId(null)
    setForm({ ...emptyForm })
    setAdding(true)
  }

  async function handleSave(id?: string) {
    setSaving(true)
    const result = await upsertPackage({
      ...(id ? { id } : {}),
      name: form.name,
      category: form.category,
      price: form.price !== "" ? Number(form.price) : null,
      original_price: form.original_price !== "" ? Number(form.original_price) : null,
      unit: form.unit || null,
      description: form.description || null,
      sub_items: form.sub_items,
      is_featured: form.is_featured,
      is_active: form.is_active,
      sort_order: form.sort_order,
      platforms: form.platforms,
      content_type: form.content_type,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("บันทึกสำเร็จ")
    setEditId(null)
    setAdding(false)
    router.refresh()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`ลบ "${name}" ใช่มั้ย?`)) return
    const result = await deletePackage(id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    setGroups(prev => {
      const next = { ...prev }
      for (const cat of CATS) next[cat] = next[cat].filter(p => p.id !== id)
      return next
    })
  }

  async function handleReorder(cat: RateCardCategory, newItems: RateCardPackage[]) {
    setGroups(prev => ({ ...prev, [cat]: newItems }))
    await reorderPackages(newItems.map((item, idx) => ({ id: item.id, sort_order: idx })))
  }

  const cancelForm = () => { setEditId(null); setAdding(false) }

  const rowProps = { editId, form, setForm, saving, onEdit: startEdit, onSave: handleSave, onCancel: cancelForm, onDelete: handleDelete }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[hsl(25,20%,15%)]">จัดการ Packages</h3>
        <Button size="sm" onClick={startAdd} disabled={adding}>
          <Plus className="w-3.5 h-3.5 mr-1" />เพิ่ม Package
        </Button>
      </div>
      {adding && <PackageForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={cancelForm} />}
      {CATS.map(cat => groups[cat].length === 0 ? null : (
        <div key={cat} className="space-y-2">
          <h4 className="text-sm font-semibold text-[hsl(25,10%,50%)] uppercase tracking-wide flex items-center gap-1.5">
            {RATE_CARD_CATEGORY_LABELS[cat]}
            <span className="text-[10px] font-normal text-[hsl(25,10%,65%)] normal-case tracking-normal">· ลากเพื่อจัดลำดับ</span>
          </h4>
          <SortableGroup cat={cat} items={groups[cat]} onReorder={handleReorder} {...rowProps} />
        </div>
      ))}
    </div>
  )
}
