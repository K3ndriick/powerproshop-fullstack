import { getSupplierById, toggleSupplierActive } from '@/lib/actions/admin/suppliers';
import { SupplierForm } from '@/components/admin/supplier-form';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSupplierPage({ params }: Props) {
  const { id } = await params;

  let supplier;
  try {
    supplier = await getSupplierById(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">Edit supplier</h1>

        {/* Toggle active inline via a small server action form */}
        <form
          action={async () => {
            'use server';
            await toggleSupplierActive(id, !supplier.active);
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            {supplier.active ? 'Deactivate' : 'Reactivate'}
          </Button>
        </form>
      </div>

      <SupplierForm supplier={supplier} />
    </div>
  );
}
