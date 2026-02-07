import { MegaMenuContainer } from './mega-menu-container'
import { MegaMenuGrid } from './mega-menu-grid'
import { servicesMenuData } from '@/data/navigation'

/**
 * Services mega menu - Refactored to use composition
 * Features: Centered 3-column layout for service categories
 */
export function MegaMenuServices() {
  return (
    <MegaMenuContainer>
      <MegaMenuGrid 
        columns={servicesMenuData.columns} 
        centered={true}
        maxWidth="lg"
      />
    </MegaMenuContainer>
  )
}