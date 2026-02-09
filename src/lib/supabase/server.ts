/**
 * Supabase Client - Server-Side
 * 
 * Purpose: Creates a Supabase client for use in Server Components and Server Actions
 * 
 * Environment: Node.js (Next.js server runtime)
 * Cookie Access: next/headers (Next.js cookie API)
 * 
 * Use Cases:
 * - Initial page data fetching (server components)
 * - Server Actions (form submissions, mutations)
 * - API routes
 * - Any server-side operation
 * 
 * Authentication:
 * - Uses NEXT_PUBLIC_SUPABASE_ANON_KEY (still respects RLS)
 * - Reads session from Next.js cookies (HTTP request headers)
 * - Requires cookie handlers to bridge Supabase ↔ Next.js
 * 
 * Cookie Handlers Explained:
 * - get(): Retrieves cookie value from Next.js cookieStore
 *   - Uses optional chaining (?.) because cookie might not exist
 *   - Returns just the value string, not the whole cookie object
 * 
 * - set(): Stores cookie in Next.js cookieStore
 *   - Wrapped in try/catch because server cookies can fail
 *   - Failure scenarios: read-only mode, invalid options
 * 
 * - remove(): Deletes cookie from Next.js cookieStore
 *   - Also wrapped in try/catch for safety
 *   - Uses cookieStore.delete() method
 * 
 * Why async?
 * - Next.js 15+ requires cookies() to be awaited
 * - Allows for better performance and caching
 * 
 * Example Usage:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 * 
 * export default async function ProductsPage() {
 *   const supabase = await createClient()
 *   const { data: products } = await supabase
 *     .from('products')
 *     .select('*')
 *   
 *   return <ProductGrid products={products} />
 * }
 * ```
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Get a cookie value by name
        // Returns undefined if cookie doesn't exist (hence the ?. optional chaining)
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        
        // Set a cookie with a name, value, and options
        // Try/catch protects against failures (e.g., read-only mode)
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // Cookie setting can fail in certain Next.js contexts
            // Logging helps with debugging, but doesn't break the app
            console.log(error);
          }
        },
        
        // Remove a cookie by name
        // Try/catch for same safety reasons as set()
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name)
          } catch (error) {
            console.log(error);
          }
        },
      }
    }
  )
}