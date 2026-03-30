import { SupplierForm } from '@/components/admin/supplier-form';

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add supplier</h1>
      <SupplierForm />
    </div>
  );
}
