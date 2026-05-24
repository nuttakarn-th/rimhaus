import { notFound } from "next/navigation"
import Link from "next/link"
import { getCustomer, getCustomerDocuments } from "@/actions/customers.actions"
import { Button } from "@/components/ui/button"
import { Pencil, Building2, Phone, Mail, MessageCircle, MapPin, FileText, FileCheck, Receipt, ChevronLeft } from "lucide-react"
import { DeleteCustomerButton } from "@/components/customers/DeleteCustomerButton"
import { formatDate, formatCurrency, cn } from "@/lib/utils"
import { DOC_TYPE_LABELS, DOC_STATUS_LABELS, DOC_STATUS_COLORS } from "@/lib/constants"

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [customer, docs] = await Promise.all([getCustomer(id), getCustomerDocuments(id)])
  if (!customer) notFound()

  const totalInvoiced = docs.filter(d => d.doc_type === "invoice").reduce((s, d) => s + d.total, 0)
  const totalReceived = docs.filter(d => d.doc_type === "receipt").reduce((s, d) => s + d.total, 0)
  const quotationCount = docs.filter(d => d.doc_type === "quotation").length
  const invoiceCount = docs.filter(d => d.doc_type === "invoice").length
  const receiptCount = docs.filter(d => d.doc_type === "receipt").length
  const latestInvoice = docs.find(d => d.doc_type === "invoice")

  const DocIcon = ({ type }: { type: string }) => {
    if (type === "invoice") return <FileCheck className="w-3.5 h-3.5" />
    if (type === "receipt") return <Receipt className="w-3.5 h-3.5" />
    return <FileText className="w-3.5 h-3.5" />
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="flex items-center gap-1 text-sm text-[hsl(25,10%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors">
          <ChevronLeft className="w-4 h-4" />ลูกค้า
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[hsl(24,85%,50%)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[hsl(25,20%,15%)]">{customer.name}</h1>
            {customer.contact_name && (
              <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">ผู้ติดต่อ: {customer.contact_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href={`/customers/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="w-3.5 h-3.5 mr-1" />แก้ไข</Button>
          </Link>
          <DeleteCustomerButton id={id} name={customer.name} />
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)] mb-3">ข้อมูลติดต่อ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {customer.phone && (
            <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-[hsl(25,20%,25%)] hover:text-[hsl(24,85%,50%)] transition-colors">
              <Phone className="w-4 h-4 text-[hsl(24,85%,50%)] shrink-0" />
              {customer.phone}
            </a>
          )}
          {customer.contact_line && (
            <div className="flex items-center gap-2 text-green-700">
              <MessageCircle className="w-4 h-4 text-green-600 shrink-0" />
              {customer.contact_line}
            </div>
          )}
          {customer.email && (
            <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-[hsl(25,20%,25%)] hover:text-[hsl(24,85%,50%)] transition-colors">
              <Mail className="w-4 h-4 text-[hsl(24,85%,50%)] shrink-0" />
              {customer.email}
            </a>
          )}
          {customer.address && (
            <div className="flex items-start gap-2 text-[hsl(25,10%,45%)] col-span-full">
              <MapPin className="w-4 h-4 text-[hsl(25,10%,60%)] shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{customer.address}</span>
            </div>
          )}
        </div>
        {customer.tax_id && (
          <p className="text-xs text-[hsl(25,10%,55%)] mt-3 pt-3 border-t border-[hsl(35,20%,92%)]">
            เลขประจำตัวผู้เสียภาษี: <span className="font-medium text-[hsl(25,20%,25%)]">{customer.tax_id}</span>
          </p>
        )}
        {customer.notes && (
          <p className="text-xs text-[hsl(25,10%,50%)] mt-2 whitespace-pre-wrap">{customer.notes}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 text-center">
          <div className="text-2xl font-bold text-[hsl(24,85%,50%)]">{quotationCount}</div>
          <div className="text-xs text-[hsl(25,10%,55%)] mt-0.5">ใบเสนอราคา</div>
        </div>
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{invoiceCount}</div>
          <div className="text-xs text-[hsl(25,10%,55%)] mt-0.5">ใบแจ้งหนี้</div>
        </div>
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{receiptCount}</div>
          <div className="text-xs text-[hsl(25,10%,55%)] mt-0.5">ใบเสร็จ</div>
        </div>
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 text-center">
          <div className="text-sm font-bold text-[hsl(25,20%,15%)]">{latestInvoice ? formatDate(latestInvoice.doc_date) : "-"}</div>
          <div className="text-xs text-[hsl(25,10%,55%)] mt-0.5">ใบแจ้งหนี้ล่าสุด</div>
        </div>
      </div>

      {/* Financial summary */}
      {(totalInvoiced > 0 || totalReceived > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <div className="text-xs text-blue-600 font-medium">ยอดแจ้งหนี้รวม</div>
            <div className="text-lg font-bold text-blue-700 mt-1">{formatCurrency(totalInvoiced)}</div>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 p-4">
            <div className="text-xs text-green-600 font-medium">ยอดรับเงินรวม</div>
            <div className="text-lg font-bold text-green-700 mt-1">{formatCurrency(totalReceived)}</div>
          </div>
        </div>
      )}

      {/* Document history */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[hsl(35,20%,88%)] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ประวัติเอกสาร</h3>
          <Link href={`/documents/new`} className="text-xs text-[hsl(24,85%,50%)] hover:underline">
            + สร้างเอกสาร
          </Link>
        </div>
        {docs.length === 0 ? (
          <div className="p-8 text-center text-sm text-[hsl(25,10%,55%)]">ยังไม่มีเอกสาร</div>
        ) : (
          <div className="divide-y divide-[hsl(35,20%,92%)]">
            {docs.map(doc => (
              <Link key={doc.id} href={`/documents/${doc.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(35,30%,98%)] transition-colors">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                  doc.doc_type === "invoice" ? "bg-blue-50 text-blue-600" :
                  doc.doc_type === "receipt" ? "bg-green-50 text-green-600" :
                  "bg-orange-50 text-[hsl(24,85%,50%)]"
                )}>
                  <DocIcon type={doc.doc_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[hsl(25,20%,15%)]">{doc.doc_number}</span>
                    <span className="text-xs text-[hsl(25,10%,60%)]">{DOC_TYPE_LABELS[doc.doc_type as keyof typeof DOC_TYPE_LABELS]}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", DOC_STATUS_COLORS[doc.status as keyof typeof DOC_STATUS_COLORS])}>
                      {DOC_STATUS_LABELS[doc.status as keyof typeof DOC_STATUS_LABELS]}
                    </span>
                  </div>
                  <div className="text-xs text-[hsl(25,10%,55%)] mt-0.5">{formatDate(doc.doc_date)}</div>
                </div>
                <div className="text-sm font-bold text-[hsl(24,85%,50%)] shrink-0">{formatCurrency(doc.total)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
