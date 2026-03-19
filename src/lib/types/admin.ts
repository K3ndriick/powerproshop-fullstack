export type AnalyticsSummary = {
  revenueThisMonth: number
  revenueAllTime: number
  ordersThisMonth: number
  ordersAllTime: number
  pendingOrders: number
  processingOrders: number
  lowStockCount: number
  totalProducts: number
  totalCustomers: number
}

// Flat product row for admin table (no joins needed)
export type AdminProduct = {
  id: string
  name: string
  slug: string
  sku: string | null
  category: string
  brand: string | null
  price: number
  sale_price: number | null
  stock_quantity: number
  low_stock_threshold: number
  in_stock: boolean
  featured: boolean
  images: string[]
  created_at: string
}

// Order row for admin table (includes customer email via join)
export type AdminOrder = {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  customer_email: string
  customer_name: string
}

// Customer row for admin user list
export type AdminUser = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
  order_count: number
}