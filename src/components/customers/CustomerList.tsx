"use client"

import { useState } from "react"
import Link from "next/link"
import { DeleteCustomerButton } from "@/components/customers/DeleteCustomerButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Phone, Mail, MessageCircle, FileText, Pencil, FilePlus, Search, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { CustomerWithStats } from "@/actions/customers.actions"

interface Props {
  customers: CustomerWithStats[]
}

export function CustomerList({ customers }: Props) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const filtered = q
    ? customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.contact_name?.toLowerCase().includes(q) ||
        c.tax_id?.includes(q) ||
        c.phone?.includes(q) ||
        c.doc_keywords.toLowerCase().includes(q)
      )
    : customers

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(25,10%,60%)]" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อลูกค้า รายการในเอกสาร เลขภาษี..."
          className="pl-8 pr-8 text-sm"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(25,10%,60%)] hover:text-[hsl(25,20%,25%)]">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Result count when searching */}
      {query && (
        <p className="text-xs text-[hsl(25,10%,55%)] px-1">
          พบ {filtered.length} รายการ
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-8 text-center">
          <p className="text-sm text-[hsl(25,10%,50%)]">ไม่พบลูกค้าที่ค้นหา</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-4 py-3.5 flex items-center gap-3 hover:border-[hsl(24,85%,60%)] transition-colors group">
              <Link href={`/customers/${c.id}`} className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0 hover:bg-orange-100 transition-colors">
                <Building2 className="w-4 h-4 text-[hsl(24,85%,50%)]" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/customers/${c.id}`} className="font-semibold text-[hsl(25,20%,15%)] text-sm hover:text-[hsl(24,85%,50%)] transition-colors">
                    {c.name}
                  </Link>
                  {c.document_count > 0 && (
                    <span className="text-xs bg-orange-50 text-[hsl(24,85%,50%)] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <FileText className="w-2.5 h-2.5" />{c.document_count} เอกสาร
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-x-3 gap-y-0.5 mt-0.5 flex-wrap">
                  {c.contact_name && (
                    <span className="text-xs text-[hsl(25,10%,50%)]">{c.contact_name}</span>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="text-xs text-[hsl(25,10%,60%)] flex items-center gap-1 hover:text-[hsl(24,85%,50%)] transition-colors">
                      <Phone className="w-3 h-3 shrink-0" />{c.phone}
                    </a>
                  )}
                  {c.contact_line && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 shrink-0" />{c.contact_line}
                    </span>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-xs text-[hsl(25,10%,60%)] flex items-center gap-1 min-w-0 hover:text-[hsl(24,85%,50%)] transition-colors">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[160px]">{c.email}</span>
                    </a>
                  )}
                </div>
                {c.latest_doc_date && (
                  <div className="text-xs text-[hsl(25,10%,60%)] mt-0.5 flex items-center gap-1">
                    <span className="text-[hsl(25,10%,70%)]">เอกสารล่าสุด:</span>
                    <span className="font-medium">{formatDate(c.latest_doc_date)}</span>
                  </div>
                )}
                {c.tax_id && (
                  <div className="text-xs text-[hsl(25,10%,65%)] mt-0.5">เลขภาษี: {c.tax_id}</div>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Link href={`/documents/new?customer_id=${c.id}`} title="สร้างเอกสาร">
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-[hsl(24,85%,50%)] hover:bg-orange-50">
                    <FilePlus className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href={`/customers/${c.id}/edit`}>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <DeleteCustomerButton id={c.id} name={c.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
