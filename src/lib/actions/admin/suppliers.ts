'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { Supplier, CreateSupplierInput } from '@/lib/types';

// ============================================================
// GET ALL SUPPLIERS
// Returns all suppliers, active ones first.
// ============================================================

export async function getAllSuppliers(): Promise<Supplier[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('active', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error(`getAllSuppliers error: ${error.message}`);
    throw error;
  }

  return data ?? [];
}

// ============================================================
// GET SUPPLIER BY ID
// ============================================================

export async function getSupplierById(id: string): Promise<Supplier> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`getSupplierById error: ${error.message}`);
    throw error;
  }

  return data;
}

// ============================================================
// CREATE SUPPLIER
// Returns null on success, error string on failure.
// ============================================================

export async function createSupplier(input: CreateSupplierInput): Promise<string | null> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('suppliers').insert({
    name:         input.name,
    contact_name: input.contact_name,
    email:        input.email,
    phone:        input.phone,
    address:      input.address,
    notes:        input.notes,
  });

  if (error) return error.message;

  revalidatePath('/admin/suppliers');
  return null;
}

// ============================================================
// UPDATE SUPPLIER
// Returns null on success, error string on failure.
// ============================================================

export async function updateSupplier(id: string,input: Partial<CreateSupplierInput>): Promise<string | null> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('suppliers')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return error.message;

  revalidatePath('/admin/suppliers');
  return null;
}

// ============================================================
// TOGGLE SUPPLIER ACTIVE STATE
// Deactivating a supplier does not affect existing POs.
// Returns null on success, error string on failure.
// ============================================================

export async function toggleSupplierActive(id: string, active: boolean): Promise<string | null> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('suppliers')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return error.message;

  revalidatePath('/admin/suppliers');
  return null;
}
