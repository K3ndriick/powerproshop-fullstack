import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/actions/products';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductInfo } from '@/components/products/product-info';
import { RelatedProducts } from '@/components/products/related-products';
import { generateProductDetailBreadcrumbs } from '@/lib/utils/breadcrumbs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type ProductPageProps = {
  params: Promise<{ slug: string }>  // Next.js 15 uses Promise
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Extract slug from URL params
  const { slug } = await params;
  
  // Fetch product data
  const product = await getProductBySlug(slug);
  
  // Handle not found
  if (!product) {
    notFound();  // Triggers not-found.tsx
  }

  const breadcrumbs = generateProductDetailBreadcrumbs(product);
  
  // Render product
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              
              return (
                <BreadcrumbItem key={crumb.href}>
                  {!isLast ? (
                    <>
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Product Grid - Image + Info Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT: Image Gallery */}
          <ProductImageGallery 
            images={product.images}
            productName={product.name}
          />
          
          {/* RIGHT: Product Info */}
          <ProductInfo product={product} />
          
        </div>
        
        {/* Related Products Section */}
        <RelatedProducts currentProduct={product} />
      </div>
    </div>
  )
}