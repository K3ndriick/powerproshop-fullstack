import Link from 'next/link'

type FeaturedLink = {
  href: string
  label: string
  variant?: 'default' | 'featured' | 'destructive'
}

type MegaMenuFeaturedProps = {
  links: FeaturedLink[]
}

/**
 * Featured links sidebar for mega menus
 * Used for highlighting special categories like "NEW ARRIVALS", "SALE", etc.
 */
export function MegaMenuFeatured({ links }: MegaMenuFeaturedProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="space-y-4">
        {links.map((link) => {
          // Determine styling based on variant
          const baseClasses = "block font-bold transition-all px-4 py-2 rounded-md whitespace-nowrap"
          const variantClasses = 
            link.variant === 'destructive' 
              ? "text-destructive hover:bg-muted hover:opacity-80"
              : "text-foreground hover:bg-muted hover:text-accent"
          
          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`${baseClasses} ${variantClasses}`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}