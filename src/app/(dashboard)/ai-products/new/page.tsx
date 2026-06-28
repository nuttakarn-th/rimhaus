import { AiProductForm } from "@/components/admin/AiProductForm"

export default function NewAiProductPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-bold text-[hsl(25,20%,15%)]">เพิ่มสินค้า Affiliate</h1>
      <AiProductForm />
    </div>
  )
}
