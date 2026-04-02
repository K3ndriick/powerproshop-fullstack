'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { PurchaseOrderWithSupplier, PurchaseOrderWithDetails, CreatePurchaseOrderInput, PurchaseOrderStatus } from '@/lib/types';
import { requireAdmin } from '@/lib/auth/admin-check';

// ============================================================
// GET ALL PURCHASE ORDERS
// Returns POs joined with supplier name for the list view.
// Optionally filter by status.
// ============================================================

export async function getAllPurchaseOrders(status?: PurchaseOrderStatus): Promise<PurchaseOrderWithSupplier[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from('purchase_orders')
    .select('*, suppliers(name)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`getAllPurchaseOrders error: ${error.message}`);
    throw error;
  }

  return (data ?? []) as PurchaseOrderWithSupplier[];
}

// ============================================================
// GET PURCHASE ORDER BY ID
// Returns the PO with its supplier and all line items (joined
// with product name + sku) for the detail page.
// ============================================================

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrderWithDetails> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, suppliers(name), purchase_order_items(*, products(name, sku))')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`getPurchaseOrderById error: ${error.message}`);
    throw error;
  }

  return data as PurchaseOrderWithDetails;
}

// ============================================================
// CREATE PURCHASE ORDER
// Inserts the PO header and all line items in two steps.
// Returns null on success, error string on failure.
// ============================================================

export async function createPurchaseOrder(input: CreatePurchaseOrderInput, adminUserId: string): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  // Insert the PO header
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      supplier_id:       input.supplier_id,
      order_number:      input.order_number,
      expected_delivery: input.expected_delivery,
      notes:             input.notes,
      created_by:        adminUserId,
      // Compute total_cost from line items
      total_cost: input.items.reduce(
        (sum, item) => sum + item.quantity * item.cost_per_unit,
        0
      ),
    })
    .select('id')
    .single();

  if (poError) return poError.message;

  // Insert all line items
  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(
      input.items.map((item) => ({
        purchase_order_id: po.id,
        product_id:        item.product_id,
        quantity:          item.quantity,
        cost_per_unit:     item.cost_per_unit,
      }))
    );

  if (itemsError) return itemsError.message;

  revalidatePath('/admin/purchase-orders');
  return null;
}

// ============================================================
// UPDATE PURCHASE ORDER STATUS
// Simple status transition for pending -> ordered.
// Receipt is handled separately by receivePurchaseOrder.
// Returns null on success, error string on failure.
// ============================================================

export async function updatePurchaseOrderStatus(id: string, status: Extract<PurchaseOrderStatus, 'ordered' | 'cancelled'>): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('purchase_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return error.message;

  revalidatePath('/admin/purchase-orders');
  revalidatePath(`/admin/purchase-orders/${id}`);
  return null;
}

// ============================================================
// RECEIVE PURCHASE ORDER
// Delegates to the receive_purchase_order RPC which atomically:
//   - validates the PO is in a receivable state
//   - writes a stock_adjustment row per line item
//   - increments products.stock_quantity per line item
//   - marks the PO as received
// Returns null on success, error string on failure.
// ============================================================

export async function receivePurchaseOrder(id: string, adminUserId: string): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.rpc('receive_purchase_order', {
    p_purchase_order_id: id,
    p_admin_user_id:     adminUserId,
  });

  if (error) return error.message;

  revalidatePath('/admin/purchase-orders');
  revalidatePath(`/admin/purchase-orders/${id}`);
  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
  
  return null;
}
