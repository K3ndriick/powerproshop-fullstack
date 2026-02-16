'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useFilterStore, usePriceRange } from '@/store/useFilterStore';
import { formatPrice } from '@/lib/utils/product-helpers';

/**
 * Price Configuration
 * 
 * These define the slider's range.
 * Adjust if your products have different price ranges.
 */
const PRICE_CONFIG = {
  MIN: 0,
  MAX: 5000,
  STEP: 50,           // Slider moves in $50 increments
  DEFAULT_MIN: 0,
  DEFAULT_MAX: 5000,
}

export function PriceSlider() {
  // ==================== STATE ====================
  
  /**
   * Get store price range
   * 
   * We need the price range from Zustand to:
   * 1. Initialize local state
   * 2. Sync when store changes externally (like reset filters)
   */
  const storePriceRange = useFilterStore(state => state.priceRange);
  const setPriceRange = useFilterStore(state => state.setPriceRange);

  /**
   * Create local state for the slider
   * 
   * This is the key to smooth performance!
   * 
   * Local state tracks slider position in real-time.
   * Format: [min, max] as an array of two numbers
   */
  const [localRange, setLocalRange] = useState([storePriceRange.min, storePriceRange.max]);

  // ==================== SYNC STORE → LOCAL ====================
  
  /**
   * Sync store changes to local state
   * 
   * When store changes (like reset filters), update local state.
   * 
   * Use useEffect to watch storePriceRange and update localRange.
   */
  useEffect(() => {
    setLocalRange([storePriceRange.min, storePriceRange.max])
  }, [storePriceRange]);

  // ==================== HANDLERS ====================
  
  /**
   * Handle slider drag (while dragging)
   * 
   * Called continuously as user drags the slider.
   * Updates LOCAL state only (not store yet).
   * 
   * @param value - Array like [100, 500]
   * 
   * Pattern:
   * const handleValueChange = (value: number[]) => {
   *   setLocalRange(value)
   * }
   */
  const handleValueChange = (value: number[]) => {
    setLocalRange(value)
  }

  /**
   * Handle slider release (drag end)
   * 
   * Called once when user releases the slider handle.
   * Updates STORE state (triggers product filtering).
   * 
   * @param value - Array like [100, 500]
   * 
   * This is where Zustand gets updated
   */
  const handleValueCommit = (value: number[]) => {
    setPriceRange(value[0], value[1]);
  }

  /**
   * Handle reset button
   * 
   * Reset both local and store state to defaults.
   */
  const handleReset = () => {
    const defaultRange = [PRICE_CONFIG.DEFAULT_MIN, PRICE_CONFIG.DEFAULT_MAX];
    setLocalRange(defaultRange);
    setPriceRange(defaultRange[0], defaultRange[1]);
  }

  // ==================== COMPUTED VALUES ====================
  
  /**
   * Check if filter is active
   * 
   * Determine if current range is different from default.
   * Used to show/hide the reset button.
   * 
   * Logic:
   * - If min is NOT 0, filter is active
   * - OR if max is NOT 5000, filter is active
   */
  const isFiltered = localRange[0] !== PRICE_CONFIG.DEFAULT_MIN || localRange[1] !== PRICE_CONFIG.DEFAULT_MAX;

  // ==================== RENDER ====================
  
  return (
    <div className="space-y-4">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between">
        {/* <label className="text-sm font-medium text-foreground">
          Price Range
        </label> */}
        
        {/* Only show reset if filter is active */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Display current price range */}
      <div className='flex items-center justify between test-sm'>
        <span className='font-medium text-foregound'>
          {formatPrice(localRange[0])}
        </span>
        <span className='text-muted-foreground'>{` - `}</span>
        <span className='font-medium text-foreground'>
          {formatPrice(localRange[1])}
        </span>
      </div>

      {/* Slider component */}
      <Slider
        min={PRICE_CONFIG.MIN}
        max={PRICE_CONFIG.MAX}
        step={PRICE_CONFIG.STEP}
        value={localRange}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className="w-full"
        aria-label="Price range"
      />

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Drag handles to adjust price range
      </p>
    </div>
  )
}

/**
 * ============================================================================
 * UNDERSTANDING THIS COMPONENT
 * ============================================================================
 * 
 * 1. WHY LOCAL STATE?
 *    Without local state:
 *    - Every pixel of drag → update store → re-filter 100 products → LAG
 *    
 *    With local state:
 *    - While dragging → update local only → smooth UI
 *    - On release → update store once → products filter once
 * 
 * 2. THE TWO EVENT HANDLERS:
 *    - onValueChange: Fires continuously (every pixel)
 *    - onValueCommit: Fires once (on mouse release)
 *    
 *    Think of it like:
 *    - onChange: Preview
 *    - onCommit: Save
 * 
 * 3. useEffect FOR SYNCING:
 *    useEffect(() => {
 *      setLocalRange([storePriceRange.min, storePriceRange.max])
 *    }, [storePriceRange])
 *    
 *    This runs when storePriceRange changes.
 *    Keeps local state in sync with store.
 *    Example: Reset filters → store changes → local updates
 * 
 * 4. ARRAY SYNTAX:
 *    Slider uses array format: [min, max]
 *    
 *    localRange[0] = min value
 *    localRange[1] = max value
 *    
 *    Store uses object format: { min, max }
 *    
 *    We convert between them as needed!
 * 
 * 5. PERFORMANCE TIP:
 *    This pattern (local + store) is common for:
 *    - Sliders
 *    - Text inputs (debounced)
 *    - Drag-and-drop
 *    
 *    Any time you have rapid updates that trigger expensive operations
 * 
 * ============================================================================
 */