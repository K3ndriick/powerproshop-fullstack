import Link from 'next/link';
import { getAllProducts } from '@/lib/actions/admin/products';
import { Button } from '@/components/ui/button';

export default async function AdminProductsPage() {
  const adminProducts = await getAllProducts();

  const lowStockProducts = adminProducts.filter((product) => product.stock_quantity <= product.low_stock_threshold);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {lowStockProducts.length > 0 && (
            <p className="text-sm text-destructive mt-1">
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low on stock
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/admin/products/new">+ Add Product</Link>
        </Button>
      </div>

      <div className="bg-card border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {adminProducts.map(product => (
              <tr key={product.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{product.category}</td>
                <td className="px-4 py-3 text-right">
                  {product.sale_price ? (
                    <span>
                      <span className="line-through text-muted-foreground mr-1">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-destructive">${product.sale_price.toFixed(2)}</span>
                    </span>
                  ) : (
                    `$${product.price.toFixed(2)}`
                  )}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${
                  product.stock_quantity <= product.low_stock_threshold
                    ? 'text-destructive font-bold'
                    : ''
                }`}>
                  {product.stock_quantity}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.in_stock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {product.in_stock ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}