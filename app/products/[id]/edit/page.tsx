import { ProductsEdit } from "@/components/products-edit"
import { AdminLayout } from "@/components/admin-layout"

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminLayout>
      <ProductsEdit productId={id} />
    </AdminLayout>
  )
}
