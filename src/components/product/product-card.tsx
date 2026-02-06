'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number
  image: string
  category: string
  rating: number
  reviewCount: number
  inStock: boolean
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="aspect-square relative bg-secondary overflow-hidden">
        {/* Placeholder - replace with real image */}
        <div className="w-full h-full bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-6xl opacity-30">🏋️</span>
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {!product.inStock && (
            <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
              OUT OF STOCK
            </span>
          )}
          {product.salePrice && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">
              SALE
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.category}
        </p>
        
        {/* Title */}
        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-accent text-accent'
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            {product.salePrice ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-destructive">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-card-foreground">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button - BLACK, not accent! */}
          {product.inStock ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                // TODO: Add to cart
                alert('Add to cart')
              }}
              className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          ) : (
            <button
              disabled
              className="bg-muted text-muted-foreground p-2 rounded-md cursor-not-allowed"
              aria-label="Out of stock"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}