import { getAffiliateProducts } from "@/actions/affiliate.actions"
import { AffiliateProductsClient } from "@/components/affiliate/AffiliateProductsClient"
import { ShoppingBag } from "lucide-react"

export default async function AffiliateProductsPage() {
  const products = await getAffiliateProducts()

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[hsl(24,85%,50%)] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)]">สินค้า Affiliate</h1>
          <p className="text-xs text-[hsl(25,10%,50%)]">{products.length} สินค้า · กระจายอัตโนมัติลงปฏิทิน Content</p>
        </div>
      </div>
      <AffiliateProductsClient products={products} />
    </div>
  )
}
