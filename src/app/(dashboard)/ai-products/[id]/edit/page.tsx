import { notFound } from "next/navigation"
import { getAiProductById } from "@/actions/ai-product.actions"
import { AiProductForm } from "@/components/admin/AiProductForm"

export default async function EditAiProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getAiProductById(id)
  if (!product) notFound()
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-bold text-[hsl(25,20%,15%)]">แก้ไขสินค้า</h1>
      <AiProductForm product={product} />
    </div>
  )
}
