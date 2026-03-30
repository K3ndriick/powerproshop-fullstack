import { getPurchaseOrderById } from '@/lib/actions/admin/purchase-orders';
import { createClient } from '@/lib/supabase/server';
import { PoActionsForm } from '@/components/admin/po-actions-form';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { PurchaseOrderStatus } from '@/lib/types';

type Props = {
  params: Promise<{ id: string }>;
};

const statusStyles: Record<PurchaseOrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  ordered:   'bg-blue-100 text-blue-800',
  received:  'bg-green-100 text-green-800',
  cancelled: 'bg-muted text-muted-foreground',
};

export default async function PurchaseOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  let po;
  try {
    po = await getPurchaseOrderById(id);
  } catch {
    notFound();
  }

  const createdDate = new Date(po.created_at).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/purchase-orders" className="hover:underline">Purchase Orders</Link>
        <span className="mx-2">/</span>
        <span className="font-mono">{po.order_number}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">{po.order_number}</h1>
          <p className="text-sm text-muted-foreground mt-1">Created {createdDate}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded capitalize font-medium ${statusStyles[po.status]}`}>
          {po.status}
        </span>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Supplier</p>
          <p className="font-medium">{po.suppliers?.name ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total cost</p>
          <p className="font-medium font-mono">
            {po.total_cost != null ? `$${po.total_cost.toFixed(2)}` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Expected delivery</p>
          <p className="font-medium">{po.expected_delivery ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Received at</p>
          <p className="font-medium">
            {po.received_at
              ? new Date(po.received_at).toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
              : '-'}
          </p>
        </div>
      </div>

      {po.notes && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm">{po.notes}</p>
        </div>
      )}

      {/* Line items */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Line items</h2>
        <div className="bg-card border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-right px-4 py-3 font-medium">Quantity</th>
                <th className="text-right px-4 py-3 font-medium">Cost / unit</th>
                <th className="text-right px-4 py-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {po.purchase_order_items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.products.name}</p>
                    {item.products.sku && (
                      <p className="text-xs text-muted-foreground font-mono">{item.products.sku}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono">${item.cost_per_unit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    ${(item.quantity * item.cost_per_unit).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/30">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm text-right font-medium">Total</td>
                <td className="px-4 py-3 text-right font-mono font-bold">
                  {po.total_cost != null ? `$${po.total_cost.toFixed(2)}` : '-'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Actions</h2>
        <PoActionsForm poId={po.id} currentStatus={po.status} adminUserId={user.id} />
      </section>

    </div>
  );
}
