"use server"

import { getLineAccount } from "@/actions/line.actions"
import { LineSettingsClient } from "./LineSettingsClient"
import { MessageSquare, CheckCircle } from "lucide-react"

export default async function LineSettingsPage() {
  const account = await getLineAccount()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">LINE Bot</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">
          เชื่อม LINE กับบัญชี Rimhaus เพื่อสร้างเอกสารผ่านแชท
        </p>
      </div>

      {/* Link status card */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${account ? "bg-green-50" : "bg-orange-50"}`}>
            {account ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <MessageSquare className="w-5 h-5 text-[hsl(24,85%,50%)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {account ? (
              <>
                <p className="text-sm font-semibold text-[hsl(25,20%,15%)]">เชื่อมแล้ว</p>
                {account.displayName && (
                  <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5">
                    LINE: {account.displayName}
                  </p>
                )}
                <p className="text-xs text-[hsl(25,10%,60%)] mt-0.5 font-mono">
                  {account.lineUserId}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[hsl(25,20%,15%)]">ยังไม่ได้เชื่อม LINE</p>
                <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5">
                  สร้าง Token แล้วส่งให้ LINE Bot เพื่อเชื่อมบัญชี
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Client component handles token generation + unlink */}
      <LineSettingsClient isLinked={!!account} />

      {/* Command reference table */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[hsl(35,20%,88%)]">
          <h2 className="text-sm font-semibold text-[hsl(25,20%,15%)]">คำสั่งที่ใช้ได้</h2>
        </div>
        <div className="divide-y divide-[hsl(35,20%,90%)]">
          {[
            {
              format: "เชื่อม [TOKEN]",
              description: "เชื่อมบัญชี LINE กับ Rimhaus",
              example: "เชื่อม ABC123",
            },
            {
              format: "qt [ลูกค้า] | [รายการ] | [ราคา]",
              description: "สร้างใบเสนอราคา",
              example: "qt บริษัท ABC | ถ่ายภาพสินค้า | 5000",
            },
            {
              format: "inv [ลูกค้า] | [รายการ] | [ราคา]",
              description: "สร้างใบแจ้งหนี้",
              example: "inv บริษัท ABC | ถ่ายภาพสินค้า | 5000",
            },
            {
              format: "rec [ลูกค้า] | [รายการ] | [ราคา]",
              description: "สร้างใบเสร็จรับเงิน",
              example: "rec บริษัท ABC | ถ่ายภาพสินค้า | 5000",
            },
            {
              format: "รายการ",
              description: "ดู 5 เอกสารล่าสุด",
              example: "รายการ",
            },
          ].map((cmd) => (
            <div key={cmd.format} className="px-5 py-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <code className="text-xs bg-[hsl(35,30%,97%)] border border-[hsl(35,20%,88%)] px-1.5 py-0.5 rounded text-[hsl(24,85%,45%)] font-mono">
                    {cmd.format}
                  </code>
                  <p className="text-xs text-[hsl(25,10%,45%)] mt-1">{cmd.description}</p>
                </div>
              </div>
              <p className="text-xs text-[hsl(25,10%,60%)] mt-1.5">
                ตัวอย่าง:{" "}
                <code className="text-[hsl(24,85%,45%)] font-mono">{cmd.example}</code>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
