import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { notFound } from "next/navigation"
import { getIssuer } from "@/actions/issuers.actions"
import { IssuerForm } from "@/components/issuers/IssuerForm"

export default async function EditIssuerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issuer = await getIssuer(id)
  if (!issuer) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "ผู้ออกเอกสาร", href: "/settings/issuers" }, { label: "แก้ไขผู้ออกเอกสาร" }]} />
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขผู้ออกเอกสาร</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">{issuer.name}</p>
      </div>
      <IssuerForm issuer={issuer} />
    </div>
  )
}
