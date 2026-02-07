import { MegaMenuContainer } from './mega-menu-container'
import { MegaMenuFeatured } from './mega-menu-featured'
import { MegaMenuGrid } from './mega-menu-grid'
import { shopMenuData } from '@/data/navigation'

/**
 * Shop mega menu - Refactored to use composition
 * Features: Left sidebar with featured links + 3-column product grid
 */
export function MegaMenuShop() {
  return (
    <MegaMenuContainer>
      <div className="grid grid-cols-12 gap-8">
        {/* Featured sidebar - 2 columns */}
        {shopMenuData.featured && (
          <div className="col-span-3 flex flex-col items-center border-r pr-8">
            <MegaMenuFeatured links={shopMenuData.featured} />
          </div>
        )}
        
        {/* Product categories grid - 10 columns */}
        <div className="col-span-9">
          <MegaMenuGrid columns={shopMenuData.columns} />
        </div>
      </div>
    </MegaMenuContainer>
  )
}