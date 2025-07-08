import { useState, useCallback } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useCartStore, type CartItem } from '@/store/useCartStore'

interface UseCartOptions {
    showNotifications?: boolean
}

export const useCart = (options: UseCartOptions = {}) => {
    const { showNotifications = true } = options
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { t } = useTranslation()

    const cartStore = useCartStore()

    // Enhanced add item with notifications
    const addItem = useCallback(async (item: CartItem) => {
        try {
            setLoading(true)
            setError(null)

            cartStore.addItem(item)

            if (showNotifications) {
                const productName = item.product?.name || item.name || t('common.addItemToCart')
                message.success(t('common.addProductToCart', { name: productName }))
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t('common.addToCartError')
            setError(errorMsg)

            if (showNotifications) {
                message.error(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }, [cartStore, showNotifications, t])

    // Enhanced remove item
    const removeItem = useCallback(async (id: string | number, type: 'product' | 'tour') => {
        try {
            setLoading(true)
            setError(null)

            cartStore.removeItem(id, type)

            if (showNotifications) {
                message.success(t('common.removeFromCartSuccess'))
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t('common.removeFromCartError')
            setError(errorMsg)

            if (showNotifications) {
                message.error(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }, [cartStore, showNotifications, t])

    // Enhanced update quantity
    const updateQuantity = useCallback(async (id: string | number, type: 'product' | 'tour', quantity: number) => {
        try {
            setLoading(true)
            setError(null)

            cartStore.updateQuantity(id, type, quantity)

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t('common.updateCartQuantityError')
            setError(errorMsg)

            if (showNotifications) {
                message.error(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }, [cartStore, showNotifications, t])

    // Calculate totals with taxes/discounts
    const getTotalWithTax = useCallback((taxRate: number = 0.1) => {
        const subtotal = cartStore.getTotalPrice()
        const tax = subtotal * taxRate
        return subtotal + tax
    }, [cartStore])

    // Check if item is in cart
    const isInCart = useCallback((id: string | number, type: 'product' | 'tour') => {
        return cartStore.items.some(item => item.id === id && item.type === type)
    }, [cartStore.items])

    // Get item quantity in cart
    const getItemQuantity = useCallback((id: string | number, type: 'product' | 'tour') => {
        const item = cartStore.items.find(item => item.id === id && item.type === type)
        return item?.quantity || 0
    }, [cartStore.items])

    return {
        // State
        items: cartStore.items,
        loading,
        error,
        totalItems: cartStore.getTotalItems(),
        totalPrice: cartStore.getTotalPrice(),

        // Actions
        addItem,
        removeItem,
        updateQuantity,
        clearCart: cartStore.clearCart,

        // Utilities
        getTotalWithTax,
        isInCart,
        getItemQuantity,
        formatPrice: (price: number) => `${price.toLocaleString('vi-VN')}₫`,

        // Quick actions for easier usage
        isEmpty: cartStore.items.length === 0,
        hasItems: cartStore.items.length > 0,
    }
}

// Specialized hook for product pages
export const useProductCart = (productId: string) => {
    const cart = useCart()

    return {
        ...cart,
        isInCart: cart.isInCart(productId, 'product'),
        quantity: cart.getItemQuantity(productId, 'product'),
        addToCart: (item: Omit<CartItem, 'id' | 'type'>) => cart.addItem({
            ...item,
            id: productId,
            type: 'product'
        }),
        removeFromCart: () => cart.removeItem(productId, 'product'),
        updateQuantity: (quantity: number) => cart.updateQuantity(productId, 'product', quantity)
    }
}

// Specialized hook for tour pages  
export const useTourCart = (tourId: string) => {
    const cart = useCart()

    return {
        ...cart,
        isInCart: cart.isInCart(tourId, 'tour'),
        quantity: cart.getItemQuantity(tourId, 'tour'),
        addToCart: (item: Omit<CartItem, 'id' | 'type'>) => cart.addItem({
            ...item,
            id: tourId,
            type: 'tour'
        }),
        removeFromCart: () => cart.removeItem(tourId, 'tour'),
        updateQuantity: (quantity: number) => cart.updateQuantity(tourId, 'tour', quantity)
    }
}
