import Link from "next/link"
import { getCustomers } from "@/actions/customers.actions"
import { DeleteCustomerButton } from "@/components/customers/DeleteCustomerButton"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Building2, Phone, Mail } from "lucide-react"

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">ลูกค้า</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">ฐานข้อมูล Brand / เอเจนซี่</p>
        </div>
        <Link href="/customers/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />เพิ่มลูกค้า
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 text-center">
          <Building2 className="w-10 h-10 text-[hsl(25,10%,75%)] mx-auto mb-3" />
          <p className="text-[hsl(25,10%,50%)] text-sm">ยังไม่มีข้อมูลลูกค้า</p>
          <Link href="/customers/new" className="mt-3 inline-block">
            <Button size="sm" variant="outline">เพิ่มลูกค้าคนแรก</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[hsl(24,85%,50%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[hsl(25,20%,15%)] text-sm">{c.name}</div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {c.contact_name && (
                    <span className="text-xs text-[hsl(25,10%,50%)]">{c.contact_name}</span>
                  )}
                  {c.phone && (
                    <span className="text-xs text-[hsl(25,10%,60%)] flex items-center gap-1">
                      <Phone className="w-3 h-3" />{c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="text-xs text-[hsl(25,10%,60%)] flex items-center gap-1">
                      <Mail className="w-3 h-3" />{c.email}
                    </span>
                  )}
                </div>
                {c.tax_id && (
                  <div className="text-xs text-[hsl(25,10%,65%)] mt-0.5">เลขภาษี: {c.tax_id}</div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/customers/${c.id}/edit`}>
                  <Button size="sm" variant="ghost">
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
