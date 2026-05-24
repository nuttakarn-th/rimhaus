import { IssuerForm } from "@/components/issuers/IssuerForm"

export default function NewIssuerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">เพิ่มผู้ออกเอกสาร</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">กรอกข้อมูลและอัปโหลดลายเซ็น</p>
      </div>
      <IssuerForm />
    </div>
  )
}
