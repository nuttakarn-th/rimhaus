import Link from "next/link"
import { getCustomersWithStats } from "@/actions/customers.actions"
import { DeleteCustomerButton } from "@/components/customers/DeleteCustomerButton"
import { CustomerImport } from "@/components/customers/CustomerImport"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Building2, Phone, Mail, MessageCircle, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function CustomersPage() {
  const customers = await getCustomersWithStats()

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">ลูกค้า</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">ฐานข้อมูล Brand / เอเจนซี่</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CustomerImport />
          <Link href="/customers/new">
            <Button size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />เพิ่มลูกค้า
            </Button>
          </Link>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 text-center">
          <Building2 className="w-10 h-10 text-[hsl(25,10%,75%)] mx-auto mb-3" />
          <p className="text-[hsl(25,10%,50%)] text-sm">ยังไม่มีข้อมูลลูกค้า</p>
          <p className="text-xs text-[hsl(25,10%,60%)] mt-1 mb-4">เพิ่มทีละคน หรือดาวน์โหลด Template แล้วนำเข้าจาก Excel</p>
          <Link href="/customers/new" className="inline-block">
            <Button size="sm" variant="outline">เพิ่มลูกค้าคนแรก</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map(c => (
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
                {c.latest_invoice_date && (
                  <div className="text-xs text-[hsl(25,10%,60%)] mt-0.5 flex items-center gap-1">
                    <span className="text-[hsl(25,10%,70%)]">ใบแจ้งหนี้ล่าสุด:</span>
                    <span className="font-medium">{formatDate(c.latest_invoice_date)}</span>
                  </div>
                )}
                {c.tax_id && (
                  <div className="text-xs text-[hsl(25,10%,65%)] mt-0.5">เลขภาษี: {c.tax_id}</div>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
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
