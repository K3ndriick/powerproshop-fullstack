'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceSlider } from './price-slider';
import { useFilterStore, useActiveFilterCount, useSelectedCategories } from '@/store/useFilterStore';
import type { ProductCategory } from '@/lib/types/products';

/**
 * Category Configuration
 * 
 * Maps internal category values to user-friendly labels.
 * Think about: How does this structure help with rendering?
 */
const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'cardio', label: 'Cardio Equipment' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'weights', label: 'Free Weights' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'recovery', label: 'Recovery & Wellness' },
]

/**
 * Brand List
 * 
 * In a real app, you'd fetch this from the database.
 * For now, we're using a static list.
 * 
 * Think about: How would you make this dynamic later?
 */
const BRANDS = [
  'Life Fitness',
  'Technogym',
  'Precor',
  'Matrix',
  'Cybex',
  'Rogue Fitness',
  'Concept2',
  'Peloton',
  'NordicTrack',
  'Bowflex',
]

export function ProductFilters() {
  // ==================== GET STORE STATE ====================
  
  /**
   * Get filter values and actions from store
   * 
   * Think about what you need:
   * - Current selected categories (to show checked state)
   * - Current selected brands (to show checked state)
   * - In stock toggle state
   * - On sale toggle state
   * - Active filter count (already imported as hook)
   * - Actions to update each of these
   * 
   * Consider: You've done this pattern in ProductSort. What's different here?
   * Hint: You need multiple values AND their corresponding actions
   */
  
  // Get state values
  const selectedCategories = useSelectedCategories();
  const selectedBrands = useFilterStore(state => state.selectedBrands);
  const inStockOnly = useFilterStore(state => state.inStockOnly);
  const onSaleOnly = useFilterStore(state => state.onSaleOnly);
  const activeFilterCount = useActiveFilterCount();

  // Get actions
  const toggleCategory = useFilterStore(state => state.toggleCategory);
  const toggleBrand = useFilterStore(state => state.toggleBrand);
  const setInStockOnly = useFilterStore(state => state.setInStockOnly);
  const setOnSaleOnly = useFilterStore(state => state.setOnSaleOnly);
  const resetFilters = useFilterStore(state => state.resetFilters);

  // ==================== RENDER ====================
  
  return (
    <div className="w-full space-y-6">
      {/* ==================== HEADER ==================== */}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Filters:</h2>
          
          {/* Show active filter count badge */}
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className='rounded-full'>
              {activeFilterCount}
            </Badge>
          )}
        </div>
        
        {/* Show "Clear all" button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* ==================== ACCORDION FILTERS ==================== */}
      <Accordion 
        type="multiple" 
        defaultValue={['categories', 'price', 'availability']}
        className="w-full"
      >        
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-medium">
            {/* Categories section header */}
            <div className="flex items-center gap-2">
                Categories
                { selectedCategories.length > 0 && (
                  <Badge variant="secondary" className='rounded-full text-xs'>
                    {selectedCategories.length}
                  </Badge>
                )}
            </div>
          </AccordionTrigger>
          
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {/* Render category checkboxes - looping over CATEGORIES array
                
                For each category, render:
                - Wrapper div with flex and space-x-2
                - Checkbox component with:
                  - id (unique identifier)
                  - checked (is this category in selectedCategories?)
                  - onCheckedChange handler
                - Label element with:
                  - htmlFor (matches checkbox id)
                  - className for styling
                  - Display the category label
                
                Consider: How do you check if a category is selected?
                Hint: Think about array methods you've used before
              */}
              {CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={selectedCategories.includes(category.value)}
                    onCheckedChange={() => toggleCategory(category.value)}
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="text-sm font-normal leading-none cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ==================== BRANDS SECTION ==================== */}
        
        <AccordionItem value="brands">
          {/* Brands section */}
          <AccordionTrigger className="text-sm font-medium">
            {/* Categories section header */}
            <div className="flex items-center gap-2">
                Brands
                { selectedBrands.length > 0 && (
                  <Badge variant="secondary" className='rounded-full text-xs'>
                    {selectedBrands.length}
                  </Badge>
                )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {BRANDS.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-normal leading-none cursor-pointer"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ==================== PRICE SECTION ==================== */}
        
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            {/*  Embed the PriceSlider component */}
            <div className="pt-2">
              <PriceSlider/>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ==================== AVAILABILITY SECTION ==================== */}
        
        <AccordionItem value="availability">
          <AccordionTrigger className="text-sm font-medium">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {/* In Stock Only checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock-only"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                />
                <label
                  htmlFor="in-stock-only"
                  className="text-sm font-normal leading-none cursor-pointer"
                >
                  In Stock Only
                </label>
              </div>

              {/* On Sale Only checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-sale-only"
                  checked={onSaleOnly}
                  onCheckedChange={(checked) => setOnSaleOnly(checked as boolean)}
                />
                <label
                  htmlFor="on-sale-only"
                  className="text-sm font-normal leading-none cursor-pointer flex items-center gap-1"
                >
                  On Sale Only
                  <Badge variant="destructive" className="text-xs">
                    SALE
                  </Badge>
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

/**
 * ============================================================================
 * UNDERSTANDING THIS COMPONENT
 * ============================================================================
 * 
 * 1. ACCORDION PATTERN:
 *    - Organizes filters into collapsible sections
 *    - Users can expand/collapse sections they care about
 *    - type="multiple" allows multiple sections open at once
 *    
 *    Think about: Why is this better than showing everything at once?
 * 
 * 2. CHECKBOX STATE MANAGEMENT:
 *    Categories (multi-select):
 *    - checked={selectedCategories.includes(category.value)}
 *    - onCheckedChange={() => toggleCategory(category.value)}
 *    
 *    Boolean toggles:
 *    - checked={inStockOnly}
 *    - onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
 *    
 *    Think about: Why do multi-select and boolean work differently?
 * 
 * 3. CONDITIONAL RENDERING:
 *    {condition && <Component />}
 *    
 *    Examples:
 *    - Show badge only when count > 0
 *    - Show reset button only when filters active
 *    
 *    Think about: How does JavaScript evaluate && operator?
 * 
 * 4. COMPONENT COMPOSITION:
 *    <PriceSlider />
 *    
 *    We built PriceSlider separately, now we just drop it in!
 *    It already knows how to:
 *    - Get state from Zustand
 *    - Update state
 *    - Display itself
 *    
 *    Think about: What are the benefits of this approach?
 * 
 * 5. ARRAY MAPPING:
 *    {CATEGORIES.map((category) => (
 *      <Checkbox key={category.value} ... />
 *    ))}
 *    
 *    Think about: Why do we need the key prop?
 * 
 * ============================================================================
 */
