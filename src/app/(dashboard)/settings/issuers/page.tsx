import Link from "next/link"
import { getIssuers } from "@/actions/issuers.actions"
import { DeleteIssuerButton } from "@/components/issuers/DeleteIssuerButton"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, User, Star } from "lucide-react"

export default async function IssuersPage() {
  const issuers = await getIssuers()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">ผู้ออกเอกสาร</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">จัดการชื่อและลายเซ็นสำหรับออกใบเสนอราคา / ใบแจ้งหนี้</p>
        </div>
        <Link href="/settings/issuers/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />เพิ่มผู้ออกเอกสาร
          </Button>
        </Link>
      </div>

      {issuers.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 text-center">
          <User className="w-10 h-10 text-[hsl(25,10%,75%)] mx-auto mb-3" />
          <p className="text-sm text-[hsl(25,10%,50%)]">ยังไม่มีข้อมูลผู้ออกเอกสาร</p>
          <Link href="/settings/issuers/new" className="mt-3 inline-block">
            <Button size="sm" variant="outline">เพิ่มชื่อแรก</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {issuers.map(issuer => (
            <div key={issuer.id} className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[hsl(24,85%,50%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[hsl(25,20%,15%)]">{issuer.name}</span>
                  {issuer.is_default && (
                    <span className="flex items-center gap-0.5 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" />ค่าเริ่มต้น
                    </span>
                  )}
                </div>
                <div className="text-xs text-[hsl(25,10%,55%)] mt-0.5">{issuer.phone}{issuer.email ? ` · ${issuer.email}` : ""}</div>
                <div className="flex items-center gap-2 mt-1">
                  {issuer.signature_url ? (
                    <span className="text-xs text-green-600">✓ มีลายเซ็น</span>
                  ) : (
                    <span className="text-xs text-[hsl(25,10%,65%)]">ไม่มีลายเซ็น</span>
                  )}
                  {issuer.account_number && (
                    <span className="text-xs text-[hsl(25,10%,60%)]">· บัญชี {issuer.bank_name} {issuer.account_number}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/settings/issuers/${issuer.id}/edit`}>
                  <Button size="sm" variant="ghost"><Pencil className="w-3.5 h-3.5" /></Button>
                </Link>
                <DeleteIssuerButton id={issuer.id} name={issuer.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
