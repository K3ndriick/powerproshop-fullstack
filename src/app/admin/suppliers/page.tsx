import Link from 'next/link';
import { getAllSuppliers, toggleSupplierActive } from '@/lib/actions/admin/suppliers';
import { Button } from '@/components/ui/button';

export default async function AdminSuppliersPage() {
  const suppliers = await getAllSuppliers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button asChild>
          <Link href="/admin/suppliers/new">+ Add supplier</Link>
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No suppliers yet.</p>
      ) : (
        <div className="bg-card border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Supplier</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.contact_name ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      s.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-4">
                    <Link href={`/admin/suppliers/${s.id}/edit`} className="text-sm hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
