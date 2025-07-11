import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem as BaseCartItem } from '../types'

export interface CartItem extends BaseCartItem {
  type: 'product' | 'tour'
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string | number, type: 'product' | 'tour') => void
  updateQuantity: (id: string | number, type: 'product' | 'tour', quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.type === item.type
        )

        if (existingItemIndex !== -1) {
          // Item already exists, update quantity
          const updatedItems = [...state.items]
          updatedItems[existingItemIndex].quantity += item.quantity
          return { items: updatedItems }
        } else {
          // Add new item
          return { items: [...state.items, item] }
        }
      }),

      removeItem: (productId, type) => set((state) => ({
        items: state.items.filter((item) => !(item.productId === productId && item.type === type))
      })),

      updateQuantity: (productId, type, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter((item) => !(item.productId === productId && item.type === type))
          }
        }

        return {
          items: state.items.map((item) =>
            item.productId === productId && item.type === type
              ? { ...item, quantity }
              : item
          )
        }
      }),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
