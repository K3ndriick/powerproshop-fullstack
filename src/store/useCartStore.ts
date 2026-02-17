'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import type { CartItem } from '@/lib/types/cart';
import type { Product } from '@/lib/types/products';

// ============================================================
// TYPE DEFINITION
// ============================================================
// This describes the full shape of the store: state + functions.
// The computed values (itemCount, subtotal, etc.) are typed as
// () => number because they are functions stored in state.

type CartStore = {
  // Core state
  items: CartItem[]

  // Computed values (functions that derive from items[])
  itemCount: () => number
  subtotal:  () => number
  tax:       () => number
  shipping:  () => number
  total:     () => number

  // Actions
  addItem:        (product: Product, quantity?: number) => void
  removeItem:     (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart:      () => void

  // Helpers
  getItem: (productId: string) => CartItem | undefined
  hasItem: (productId: string) => boolean
}

// ============================================================
// STORE
// ============================================================
// Middleware order matters: devtools wraps persist wraps the store.
// - persist: saves/loads items[] from localStorage automatically
// - devtools: lets you inspect state in Redux DevTools browser extension

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({

        // ---- INITIAL STATE ----
        items: [],


        // ---- COMPUTED VALUES ----
        // Each is a function that reads from get().items
        // Call them as: useCartStore(state => state.itemCount())

        itemCount: () => {
          // Return the total number of individual units in the cart.
          return get().items.reduce((total, item) => total + item.quantity, 0)
        },

        subtotal: () => {
          // Return the sum of (effectivePrice * quantity) for all items.
          // "Effective price" means: use salePrice if it exists, otherwise price.
          return get().items.reduce((sum, item) => {
            const effectivePrice = item.salePrice ?? item.price;
            return sum + (effectivePrice * item.quantity);
          }, 0)
        },

        tax: () => {
          // Return 10% of the subtotal.
          const tax = get().subtotal() * 0.10;
          return tax;
        },

        shipping: () => {
          // Return $50 shipping, OR $0 if subtotal >= $1000 (free shipping).
          const currentSubtotal = get().subtotal();
          return (currentSubtotal >= 1000 ? 0 : 50);
        },

        total: () => {
          // Return subtotal + tax + shipping.
          const total = get().subtotal() + get().tax() + get().shipping();
          return total;
        },


        // ---- ACTIONS ----

        addItem: (product, quantity = 1) => {
          // Add a product to the cart
          //
          // Business rules to implement (in order):
          //
          // 1. STOCK CHECK: If !product.in_stock, throw an Error('Product is out of stock')
          //
          // 2. CALCULATE maxQuantity = Math.min(product.stock_quantity, 10)
          //    (We cap at 10 even if stock is higher)
          //
          // 3. CHECK IF ALREADY IN CART: use get().items.find(...)
          //
          // 4a. IF item EXISTS in cart:
          //     - Calculate newQuantity = existingItem.quantity + quantity
          //     - If newQuantity > maxQuantity, throw Error(`Cannot add more. Maximum ${maxQuantity} allowed.`)
          //     - Otherwise call set() to update that item's quantity (map over items)
          //
          // 4b. IF item is NEW:
          //     - If quantity > maxQuantity, throw Error(`Maximum ${maxQuantity} allowed.`)
          //     - Build a CartItem object (see the CartItem type in lib/types/cart.ts)
          //     - For image: product.primary_image || product.images[0] || ''
          //     - For addedAt: new Date().toISOString()
          //     - Call set() to append the new item to items[]
          if (!product.in_stock) {
            throw new Error("Unable to add to cart - Product is out of stock");
          }

          const maxQuantity = Math.min(product.stock_quantity, 10);
          const existingItem = get().items.find((cartItem) => cartItem.productId === product.id);

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > maxQuantity) {
              throw new Error(`Unable to add more, maximum quantity allowed is ${maxQuantity}`);
            }

            set({
              items: get().items.map((cartItem) => cartItem.productId === product.id ? { ...cartItem, quantity: newQuantity } : cartItem)
            });
          }
          else {
            if (quantity > maxQuantity) {
              throw new Error(`Maximum quantity allowed is ${maxQuantity}`);
            }

            const newCartItem: CartItem = {
              productId:   product.id,
              slug:        product.slug,
              name:        product.name,
              image:       product.primary_image || product.images[0] || '',
              category:    product.category,
              price:       product.price,
              salePrice:   product.sale_price,
              quantity:    quantity,
              stock:       product.stock_quantity,
              maxQuantity: maxQuantity,
              addedAt:     new Date().toISOString(),
            }

            set({
              items: [...get().items, newCartItem]
            })
          }
        },

        removeItem: (productId) => set({
          // Remove the item with the matching productId from items[].
          items: get().items.filter((cartItem) => cartItem.productId !== productId)
        }),

        updateQuantity: (productId, quantity) => {
          // Update the quantity of a specific item.
          //
          // Rules:
          // - If quantity === 0, call get().removeItem(productId) and return early
          // - If quantity < 1, clamp it to 1
          // - If quantity > item.maxQuantity, clamp it to item.maxQuantity
          // - Otherwise update the item's quantity with set() + map()
          const cartItemToUpdate = get().items.find((cartItem) => cartItem.productId === productId);
          if (!cartItemToUpdate) {
            return;
          } else if (quantity === 0) {
            get().removeItem(productId);
            return; // force early exit
          } else if (quantity < 1) {
            quantity = 1; // defensive guard for negative numbers
          } else if (quantity > cartItemToUpdate?.maxQuantity ) {
            quantity = cartItemToUpdate.maxQuantity;
          }

          set({
            items: get().items.map((cartItem) => cartItem.productId === productId ? {...cartItem, quantity} : cartItem)
          })
        },

        clearCart: () => set({
          // Reset items to an empty array.
          items: []
        }),


        // ---- HELPERS ----

        getItem: (productId) => {
          // Return the CartItem with the matching productId, or undefined.
          return get().items.find((cartItem) => cartItem.productId === productId);
        },

        hasItem: (productId) => {
          // Return true if any item in the cart has this productId.
          return get().items.some((cartItem) => cartItem.productId === productId);
        },

      }),
      {
        // persist config - this is what saves your cart to localStorage
        name: 'cart-storage',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    {
      // devtools config
      name: 'CartStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)
