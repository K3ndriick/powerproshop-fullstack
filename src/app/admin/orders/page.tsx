import { getAdminOrders } from "@/lib/actions/admin/orders";
import Link from "next/link";

export default async function AdminOrdersPage() {

  // ============================================================
  // Get the current user and fetch their orders
  // ============================================================

  // get the supabase admin client, fetch all orders
  const adminOrders = await getAdminOrders();


  // ============================================================
  // RENDER
  // ============================================================

  // Empty state - shown when the admin has no orders yet
  if (adminOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No orders have been placed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold">Order History</h2>
      
      {/* map over orders and render a card for each one */}
      {/* Hint: OrderCard takes a single `order` prop */}

      {adminOrders.map((order) => (
        <Link href={`/admin/orders/${order.id}`} key={order.id}>
          <div>
            <p>{order.order_number}</p>
            <p>{order.customer_name}</p>
            <p>{order.customer_email}</p>
            <p>{order.total}</p>
            <p>{order.status}</p>
            <p>{order.created_at}</p>
          </div>
        </Link>

      ))}
    </div>
  );
}