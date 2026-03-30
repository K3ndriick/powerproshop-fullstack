import { getAllSuppliers } from '@/lib/actions/admin/suppliers';
import { getAllProducts } from '@/lib/actions/admin/products';
import { createClient } from '@/lib/supabase/server';
import { CreatePoForm } from '@/components/admin/create-po-form';
import { notFound } from 'next/navigation';

export default async function NewPurchaseOrderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [suppliers, products] = await Promise.all([
    getAllSuppliers(),
    getAllProducts(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New purchase order</h1>
      <CreatePoForm suppliers={suppliers} products={products} adminUserId={user.id} />
    </div>
  );
}
