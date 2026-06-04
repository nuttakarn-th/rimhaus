import Link from "next/link"
import { getCustomersWithStats } from "@/actions/customers.actions"
import { CustomerImport } from "@/components/customers/CustomerImport"
import { CustomerList } from "@/components/customers/CustomerList"
import { Button } from "@/components/ui/button"
import { Plus, Building2 } from "lucide-react"

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
        <CustomerList customers={customers} />
      )}
    </div>
  )
}
