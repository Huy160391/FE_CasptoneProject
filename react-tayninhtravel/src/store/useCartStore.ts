import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem as BaseCartItem } from '../types'
import { useAuthStore } from './useAuthStore'

export interface CartItem extends BaseCartItem {
  type: 'product' | 'tour'
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string | number, type: 'product' | 'tour') => void
  updateQuantity: (id: string | number, type: 'product' | 'tour', quantity: number) => void
  updateItemStock: (id: string | number, type: 'product' | 'tour', quantityInStock: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getItem: (id: string | number, type: 'product' | 'tour') => CartItem | undefined
}

// Custom storage để chỉ persist cart cho user role
const customStorage = {
  getItem: (name: string) => {
    const authStore = useAuthStore.getState();
    const user = authStore.user;

    // Chỉ load cart từ localStorage nếu user có role 'user'
    if (user && user.role === 'user') {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    }
    return null;
  },
  setItem: (name: string, value: any) => {
    const authStore = useAuthStore.getState();
    const user = authStore.user;

    // Chỉ save cart vào localStorage nếu user có role 'user'
    if (user && user.role === 'user') {
      localStorage.setItem(name, JSON.stringify(value));
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  }
};

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

      updateItemStock: (productId, type, quantityInStock) => set((state) => ({
        items: state.items.map((item) =>
          item.productId === productId && item.type === type
            ? { ...item, quantityInStock }
            : item
        )
      })),

      getItem: (productId, type) => {
        return get().items.find((item) => item.productId === productId && item.type === type)
      },

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
      storage: customStorage,
    }
  )
)
