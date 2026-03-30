import Link from 'next/link';
import { getAllPurchaseOrders } from '@/lib/actions/admin/purchase-orders';
import { Button } from '@/components/ui/button';
import type { PurchaseOrderStatus } from '@/lib/types';

const statusStyles: Record<PurchaseOrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  ordered:   'bg-blue-100 text-blue-800',
  received:  'bg-green-100 text-green-800',
  cancelled: 'bg-muted text-muted-foreground',
};

export default async function AdminPurchaseOrdersPage() {
  const orders = await getAllPurchaseOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button asChild>
          <Link href="/admin/purchase-orders/new">+ New order</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No purchase orders yet.</p>
      ) : (
        <div className="bg-card border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order #</th>
                <th className="text-left px-4 py-3 font-medium">Supplier</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Expected</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((po) => {
                const createdDate = new Date(po.created_at).toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                });
                return (
                  <tr key={po.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium">{po.order_number}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {po.suppliers?.name ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${statusStyles[po.status]}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {po.total_cost != null ? `$${po.total_cost.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {po.expected_delivery ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{createdDate}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/purchase-orders/${po.id}`}
                        className="text-sm hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
