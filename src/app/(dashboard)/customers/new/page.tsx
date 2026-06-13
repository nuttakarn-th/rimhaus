import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { CustomerForm } from "@/components/customers/CustomerForm"

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "ลูกค้า", href: "/customers" }, { label: "เพิ่มลูกค้า" }]} />
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">เพิ่มลูกค้า</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">กรอกข้อมูล Brand / เอเจนซี่</p>
      </div>
      <CustomerForm />
    </div>
  )
}
