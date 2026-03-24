'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { AdminProduct, OrderItem, Product } from "@/lib/types";
import { revalidatePath } from "next/cache";

// Input type mirrors the products table fields that can be set via the form
type ProductData = {
  name: string
  slug: string
  description: string | null
  price: number
  sale_price: number | null
  category: string
  brand: string | null
  sku: string | null
  stock_quantity: number
  low_stock_threshold: number
  in_stock: boolean
  featured: boolean
  images: string[]
}

export async function getAllProducts(): Promise<AdminProduct[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null);

  if (error) {
    throw(error);
  } else {
    return data;
  }

}

export async function getAdminProductById(id: string): Promise<Product> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
      console.error(`Unable to retrieve admin product: ${error.message}`)
      throw error;
    }

  return data;
}

export async function createProduct(inputData: ProductData): Promise<Product> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      // Basic info
      name: inputData.name,
      slug: inputData.slug,
      description: inputData.description,
      
      // Pricing
      price: inputData.price,
      sale_price: inputData.sale_price,
      
      // Categorization
      category: inputData.category,
      brand: inputData.brand,
      
      // Inventory
      sku: inputData.sku,
      in_stock: inputData.stock_quantity > 0,
      stock_quantity: inputData.stock_quantity,
      low_stock_threshold: inputData.low_stock_threshold,
      
      // Media
      images: inputData.images,
      primary_image: inputData.images[0],
      
      // Marketing flags
      featured: inputData.featured
    })
    .select()
    .single();

    if (error) {
      console.error(`Unable to create admin product: ${error.message}`)
      throw error;
    } else {
      revalidatePath('/admin/products');
      revalidatePath('/products');
      
      return data;
    }
}

export async function updateProduct(id: string, input: Partial<ProductData>): Promise<string | null> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

    if (error) {
      return(error.message);
    } else {
      revalidatePath('/admin/products');
      revalidatePath(`/admin/products/${id}/edit`);
      revalidatePath('/products');

      return null;
    }
}


export async function deleteProduct(id: string): Promise<string | null> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      in_stock: false,
      stock_quantity: 0,
      featured: false,
      updated_at: new Date().toISOString(),
      deleted_at: new Date().toISOString()
    })
    .eq("id", id);

    if (error) {
      return(error.message);
    } else {
      revalidatePath('/admin/products');
      revalidatePath(`/products`);

      return null;
    }
}

export async function updateStock(id: string, newStockQuantity: number, newLowStockThreshold: number): Promise<string | null> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      in_stock: newStockQuantity > 0,
      stock_quantity: newStockQuantity,
      low_stock_threshold: newLowStockThreshold,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

    if (error) {
      return(error.message);
    } else {
      revalidatePath('/admin/products');

      return null;
    }
}