import { notFound } from "next/navigation"
import { getCustomer } from "@/actions/customers.actions"
import { CustomerForm } from "@/components/customers/CustomerForm"

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await getCustomer(id)
  if (!customer) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขลูกค้า</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">{customer.name}</p>
      </div>
      <CustomerForm customer={customer} />
    </div>
  )
}
