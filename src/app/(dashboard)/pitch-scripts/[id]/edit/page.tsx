import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { notFound } from "next/navigation"
import { getPitchScript } from "@/actions/pitch-scripts.actions"
import { getCustomers } from "@/actions/customers.actions"
import { PitchScriptForm } from "@/components/pitch-scripts/PitchScriptForm"

export default async function EditPitchScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [script, customers] = await Promise.all([getPitchScript(id), getCustomers()])
  if (!script) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "คีย์โน้ต", href: "/pitch-scripts" }, { label: "แก้ไข Template" }]} />
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไข Script</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">{script.name}</p>
      </div>
      <PitchScriptForm script={script} customers={customers} />
    </div>
  )
}
