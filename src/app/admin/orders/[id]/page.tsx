// Server component - fetches and displays a single order's full details.
// proxy.ts already guarantees the user is authenticated before this renders.
// RLS on the orders table ensures users can only fetch their own orders.

import { getAdminOrderById } from '@/lib/actions/admin/orders';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderStatusForm } from '@/components/admin/order-status-form';


type Props = {
  params: Promise<{ id: string }>
}

// Maps each order status to a Tailwind colour for the badge
const statusStyles: Record<string, string> = {
  pending:    'badge-status-pending',
  processing: 'badge-status-processing',
  shipped:    'badge-status-shipped',
  delivered:  'badge-status-delivered',
  cancelled:  'badge-status-cancelled',
}

export default async function AdminOrderDetailPage({ params }: Props) {

  // Fetch the order
  //
  // 1. Await params to get the id:
  //      const { id } = await params
  //
  // 2. Call getOrderById(id) - returns OrderWithItems | null
  //    Store the result typed as OrderWithItems | null
  //
  // 3. If order is null, call notFound()
  //    (handles both missing orders and orders belonging to another user - RLS returns null)
  const { id } = await params;

  const adminOrder = await getAdminOrderById(id);

  if (!adminOrder) {
    notFound();
  }

  // ============================================================
  // RENDER
  // ============================================================

  const date = new Date(adminOrder.created_at).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">

        {/* Back link */}
        <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
          &larr; Back to orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-mono">{adminOrder.order_number}</h1>
            <p className="text-sm text-muted-foreground mt-1">Placed on {date}</p>
          </div>
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${statusStyles[adminOrder.status]}`}>
            {adminOrder.status.charAt(0).toUpperCase() + adminOrder.status.slice(1)}
          </span>
        </div>

        {/* Items */}
        <div className="bg-card border p-6 mb-6">
          <h2 className="font-bold mb-4">Items</h2>
          <div className="space-y-3">
            {adminOrder.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name}
                  <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-card border p-6 mb-6">
          <h2 className="font-bold mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${adminOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${adminOrder.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{adminOrder.shipping === 0 ? 'FREE' : `$${adminOrder.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span>${adminOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-card border p-6">
          <h2 className="font-bold mb-4">Shipped To</h2>
          <address className="text-sm not-italic text-muted-foreground space-y-1">
            <p>{adminOrder.shipping_name}</p>
            <p>{adminOrder.shipping_address_line1}</p>
            {adminOrder.shipping_address_line2 && <p>{adminOrder.shipping_address_line2}</p>}
            <p>
              {adminOrder.shipping_city}
              {adminOrder.shipping_state ? `, ${adminOrder.shipping_state}` : ''} {adminOrder.shipping_postal_code}
            </p>
            <p>{adminOrder.shipping_country}</p>
          </address>
        </div>

        <OrderStatusForm orderId={id} currentStatus={adminOrder.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'}/>
      </div>
    </div>
  )
}
