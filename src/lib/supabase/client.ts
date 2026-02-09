/**
 * Supabase Client - Browser/Client-Side
 * 
 * Purpose: Creates a Supabase client for use in Client Components ('use client')
 * 
 * Environment: Browser (Chrome, Safari, Firefox, etc.)
 * Cookie Access: document.cookie (browser's native cookie storage)
 * 
 * Use Cases:
 * - Client-side data fetching (after initial page load)
 * - Real-time subscriptions
 * - User interactions (add to cart, update profile)
 * - Any component marked with 'use client'
 * 
 * Authentication:
 * - Uses NEXT_PUBLIC_SUPABASE_ANON_KEY (safe to expose in browser)
 * - Automatically reads session from browser cookies
 * - Respects Row Level Security (RLS) policies
 * 
 * Example Usage:
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * 
 * export function AddToCartButton() {
 *   const supabase = createClient()
 *   
 *   const handleClick = async () => {
 *     await supabase.from('cart').insert({ product_id: '123' })
 *   }
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}