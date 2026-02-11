import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          {/* 404 Header */}
          <h1 className="text-6xl font-bold mb-4">404</h1>
          
          {/* Message */}
          <h2 className="text-3xl font-bold mb-4">
            Product Not Found
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the product you're looking for. 
            It may have been removed or is no longer available.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Browse All Products
            </Link>
            
            <Link 
              href="/"
              className="border-2 border-primary text-foreground px-8 py-3 rounded-md font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}