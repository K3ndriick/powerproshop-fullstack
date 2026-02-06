import Link from 'next/link'

const categories = [
  { name: 'All', href: '/products', icon: '🏋️' },
  { name: 'Cardio', href: '/products?category=cardio', icon: '🏃' },
  { name: 'Strength', href: '/products?category=strength', icon: '💪' },
  { name: 'Accessories', href: '/products?category=accessories', icon: '🎒' },
  { name: 'Recovery', href: '/products?category=recovery', icon: '🧘' },
]

export function CategoryNav() {
  return (
    <section className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group flex flex-col items-center p-4 bg-secondary rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors border border-border"
            >
              <span className="text-3xl mb-2">{category.icon}</span>
              <span className="text-sm font-medium">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}