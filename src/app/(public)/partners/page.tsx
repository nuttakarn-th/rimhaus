import Image from "next/image"
import { getPublicPartners } from "@/lib/public-data"

export default async function PartnersPage() {
  const partners = await getPublicPartners()

  if (partners.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-[hsl(25,10%,50%)]">ยังไม่มีข้อมูล Partner</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[hsl(25,20%,15%)]">All Partner</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">แบรนด์ที่เคยร่วมงานด้วย</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-5">
        {partners.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <Image
              src={p.logo_url}
              alt={p.name ?? "Partner"}
              width={112}
              height={56}
              className="h-14 w-full object-contain"
            />
            {p.name && (
              <p className="text-xs text-[hsl(25,10%,50%)] text-center font-medium">{p.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
