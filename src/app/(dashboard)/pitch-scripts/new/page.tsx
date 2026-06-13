import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { getCustomers } from "@/actions/customers.actions"
import { PitchScriptForm } from "@/components/pitch-scripts/PitchScriptForm"

export default async function NewPitchScriptPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "คีย์โน้ต", href: "/pitch-scripts" }, { label: "เพิ่ม Template" }]} />
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">เพิ่ม Script ใหม่</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">สร้าง script แนะนำตัวสำหรับ pitch แบรนด์</p>
      </div>
      <PitchScriptForm customers={customers} />
    </div>
  )
}
