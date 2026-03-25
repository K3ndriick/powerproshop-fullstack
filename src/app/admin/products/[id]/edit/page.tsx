import { notFound } from 'next/navigation';
import { getAdminProductById } from '@/lib/actions/admin/products';
import { ProductForm } from '@/components/admin/product-form';

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;

  const adminProductToEdit = await getAdminProductById(id);

  if (!adminProductToEdit) {
    notFound(); 
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm product={adminProductToEdit} />
    </div>
  )
}