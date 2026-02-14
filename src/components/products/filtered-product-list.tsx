'use client';

import { useMemo } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { useFilterStore } from '@/store/useFilterStore';
import type { Product } from '@/lib/types/products';

interface FilteredProductListProps {
  products: Product[]
}

/**
 * FilteredProductList Component
 * 
 * Takes all products from server and filters/sorts them based on Zustand state.
 * 
 * Flow:
 * 1. Get filter state from Zustand
 * 2. Filter products based on criteria
 * 3. Sort filtered products
 * 4. Render results
 */
export function FilteredProductList({ products }: FilteredProductListProps) {
  // ==================== GET FILTER STATE ====================
  // Get all filter values from the store
  const { sortBy, priceRange, selectedCategories, selectedBrands, inStockOnly, onSaleOnly, viewMode } = useFilterStore()

  // ==================== FILTER & SORT LOGIC ====================
  
  /**
   * Filtering and sorting with useMemo
   * 
   * useMemo is a React hook that:
   * - Runs a calculation (filtering/sorting)
   * - Caches the result
   * - Only recalculates when dependencies change
   * 
   * Why use it?
   * - Filtering 100 products on every render = slow
   * - Filtering only when filters change = fast
   * 
   * Pattern:
   * const result = useMemo(() => {
   *   // Do expensive calculation here
   *   return calculatedValue
   * }, [dependency1, dependency2])
   * 
   * Steps to implement:
   * 1. Start with a copy of products: let filtered = [...products]
   * 2. Apply each filter (if active)
   * 3. Sort the filtered results
   * 4. Return the final array
   */
  const filteredAndSortedProducts = useMemo(() => {
    // Step 1: Start with all products
    let filtered = [...products]

    // ==================== APPLY FILTERS ====================
    
    /**
     * Filter by selected categories
     * 
     * Only apply if selectedCategories has items
     * 
     * Logic:
     * - If user selected categories: ['cardio', 'strength']
     * - Keep only products where category is in that array
     */
    if (selectedCategories.length > 0) {
      // Your code here
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      )
    }

    /**
     * Filter by selected brands
     * 
     * Same logic as categories but for brands
     * 
     * Extra consideration:
     * - Some products might not have a brand (brand could be null)
     * - Use: product.brand && selectedBrands.includes(product.brand)
     */
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && selectedBrands.includes(product.brand)
      )
    }

    /**
     * Filter by price range
     * 
     * Only apply if price range is different from default (0-5000)
     * 
     * Logic:
     * - Keep products where price >= min AND price <= max
     */
    if (priceRange.min > 0 || priceRange.max < 5000) {
      filtered = filtered.filter(product =>
        product.price >= priceRange.min && product.price <= priceRange.max
      )
    }

    /**
     * Filter by in stock
     * 
     * Only apply if inStockOnly is true
     * 
     * Logic:
     * - Keep only products where in_stock is true
     */
    if (inStockOnly) {
      filtered = filtered.filter(product => 
        product.in_stock
      )
    }

    /**
     * Filter by on sale
     * 
     * Only apply if onSaleOnly is true
     * 
     * Logic:
     * - Keep only products where sale_price is NOT null
     */
    if (onSaleOnly) {
      filtered = filtered.filter(product => 
        product.sale_price !== null
      )
    }

    // ==================== SORT ====================
    
    /**
     * Sort the filtered products
     * 
     * Array.sort() takes a comparison function:
     * - Return negative number: a comes before b
     * - Return positive number: b comes before a
     * - Return 0: keep original order
     * 
     * Pattern:
     * filtered.sort((a, b) => {
     *   // Compare a and b
     *   return a.something - b.something
     * })
     * 
     * You need to handle 5 cases based on sortBy:
     * - 'price-asc': Sort by price low to high
     * - 'price-desc': Sort by price high to low
     * - 'name-asc': Sort alphabetically A-Z
     * - 'name-desc': Sort alphabetically Z-A
     * - 'newest': Sort by created_at (newest first)
     */
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          // Get actual price (sale_price or price)
          const priceAAsc = a.sale_price ?? a.price;
          const priceBAsc = b.sale_price ?? b.price;
          return (priceAAsc - priceBAsc);
          
        case 'price-desc':
          const priceADesc = a.sale_price ?? a.price;
          const priceBDesc = b.sale_price ?? b.price;
          return (priceBDesc - priceADesc);
          
        case 'name-asc':
          return (a.name.localeCompare(b.name));
          
        case 'name-desc':
          return (b.name.localeCompare(a.name));
          
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          
        default:
          return 0
      }
    })

    return sorted
  }, [
    products,
    sortBy,
    priceRange,
    selectedCategories,
    selectedBrands,
    inStockOnly,
    onSaleOnly,
  ])

  // ==================== RENDER ====================
  
  /**
   * Handle empty state
   * 
   * If filteredAndSortedProducts is empty, show a helpful message
   * 
   * Return early with a message like:
   * - "No products match your filters"
   * - Button to reset filters
   */
  if (filteredAndSortedProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No products match your filters
        </p>
        <button
          onClick={() => useFilterStore.getState().resetFilters()}
          className="mt-4 text-accent hover:underline"
        >
          Reset filters
        </button>
      </div>
    )
  }

  /**
   * Render the product grid
   * 
   * Map over filteredAndSortedProducts and render ProductCard for each
   * 
   * Pattern:
   * <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
   *   {array.map(item => <Component key={item.id} data={item} />)}
   * </div>
   */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredAndSortedProducts.map(item => <ProductCard key={item.id} product={item} />)}
    </div>
  )
}

/**
 * ============================================================================
 * UNDERSTANDING THIS COMPONENT
 * ============================================================================
 * 
 * 1. WHY useMemo?
 *    Without useMemo:
 *    - Every render = re-filter + re-sort 100 products
 *    - Even if filters didn't change!
 *    - slower
 *    
 *    With useMemo:
 *    - Only recalculate when dependencies change
 *    - Cache the result otherwise
 *    - faster
 * 
 * 2. FILTER vs SORT:
 *    - Filter: Removes items (array gets smaller)
 *    - Sort: Reorders items (array stays same size)
 *    - Always filter THEN sort (more efficient)
 * 
 * 3. THE ?? OPERATOR (Nullish Coalescing):
 *    const price = product.sale_price ?? product.price
 *    
 *    Means: "Use sale_price if it exists, otherwise use price"
 *    
 *    Same as:
 *    const price = product.sale_price !== null 
 *      ? product.sale_price 
 *      : product.price
 * 
 * 4. DEPENDENCIES ARRAY:
 *    useMemo(..., [dep1, dep2])
 *                  ↑
 *    When ANY of these change, recalculate
 *    
 *    Include: All variables used inside useMemo
 *    Skip: Constants, functions that never change
 * 
 * ============================================================================
 */