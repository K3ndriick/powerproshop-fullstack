'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { StockAdjustmentWithProduct, CreateStockAdjustmentInput, AdminProduct } from '@/lib/types';

// ============================================================
// GET LOW STOCK PRODUCTS
// Returns products at or below their low_stock_threshold,
// ordered by how critical the shortage is (lowest stock first).
// ============================================================

export async function getLowStockProducts(): Promise<AdminProduct[]> {
  const supabase = createAdminClient();

  // Supabase JS doesn't support column-to-column comparisons (.lte only accepts
  // a literal value, not another column). Fetch all non-deleted products and
  // filter in JS - acceptable given the admin-only, low-frequency usage.
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .order('stock_quantity', { ascending: true });

  if (error) {
    console.error(`getLowStockProducts error: ${error.message}`);
    throw error;
  }

  return (data ?? []).filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  );
}

// ============================================================
// GET OUT OF STOCK PRODUCTS
// ============================================================

export async function getOutOfStockProducts(): Promise<AdminProduct[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .eq('stock_quantity', 0)
    .order('name', { ascending: true });

  if (error) {
    console.error(`getOutOfStockProducts error: ${error.message}`);
    throw error;
  }

  return data ?? [];
}

// ============================================================
// GET STOCK ADJUSTMENT LOG
// Returns the full audit log, newest first, joined with product name.
// Pass a product_id to filter to a single product's history.
// ============================================================

export async function getStockAdjustments(productId?: string): Promise<StockAdjustmentWithProduct[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from('stock_adjustments')
    .select('*, products(name, sku)')
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`getStockAdjustments error: ${error.message}`);
    throw error;
  }

  return (data ?? []) as StockAdjustmentWithProduct[];
}

// ============================================================
// CREATE STOCK ADJUSTMENT
// Writes an audit row and updates products.stock_quantity.
// Both writes happen sequentially - not in a DB transaction,
// but acceptable for single-owner admin use.
// Returns null on success, error string on failure.
// ============================================================

export async function createStockAdjustment(input: CreateStockAdjustmentInput, adminUserId: string): Promise<string | null> {
  const supabase = createAdminClient();

  // Fetch current stock so we can compute previous/new quantities
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock_quantity')
    .eq('id', input.product_id)
    .single();

  if (fetchError || !product) return 'Product not found';

  const previousQty = product.stock_quantity;
  const newQty = previousQty + input.quantity_change;

  if (newQty < 0) {
    return `Adjustment would result in negative stock (current: ${previousQty}, change: ${input.quantity_change})`;
  }

  // Write the audit row
  const { error: adjustmentError } = await supabase
    .from('stock_adjustments')
    .insert({
      product_id:        input.product_id,
      adjustment_type:   input.adjustment_type,
      quantity_change:   input.quantity_change,
      previous_quantity: previousQty,
      new_quantity:      newQty,
      reason:            input.reason,
      created_by:        adminUserId,
    });

  if (adjustmentError) return adjustmentError.message;

  // Update the product's stock
  const { error: updateError } = await supabase
    .from('products')
    .update({
      stock_quantity: newQty,
      in_stock:       newQty > 0,
      updated_at:     new Date().toISOString(),
    })
    .eq('id', input.product_id);

  if (updateError) return updateError.message;

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');

  return null;
}
