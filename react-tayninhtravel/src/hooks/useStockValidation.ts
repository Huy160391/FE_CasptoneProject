import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'
import { publicService } from '@/services/publicService'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

interface UseStockValidationOptions {
    autoUpdate?: boolean
    updateInterval?: number
}

export const useStockValidation = (options: UseStockValidationOptions = {}) => {
    const { autoUpdate = true, updateInterval = 30000 } = options // 30 seconds default
    const [isValidating, setIsValidating] = useState(false)
    const { t } = useTranslation()

    const cartStore = useCartStore()

    // Validate stock for a specific item
    const validateItemStock = async (productId: string, type: 'product' | 'tour') => {
        if (type === 'tour') return true // Tours don't have stock limitations

        try {
            const productData = await publicService.getPublicProductById(productId)
            if (productData) {
                // Update stock in cart store
                cartStore.updateItemStock(productId, type, productData.quantityInStock)

                const cartItem = cartStore.getItem(productId, type)
                if (cartItem && cartItem.quantity > productData.quantityInStock) {
                    // Update quantity to match available stock
                    cartStore.updateQuantity(productId, type, Math.max(0, productData.quantityInStock))

                    if (productData.quantityInStock === 0) {
                        message.warning(t('cart.outOfStockRemoved', { name: cartItem.name }))
                    } else {
                        message.warning(
                            t('cart.quantityReduced', {
                                name: cartItem.name,
                                newQuantity: productData.quantityInStock
                            })
                        )
                    }
                    return false
                }
                return true
            }
        } catch (error) {
            console.error('Error validating stock for product:', productId, error)
            return false
        }
        return true
    }

    // Validate stock for all items in cart
    const validateAllStock = async () => {
        setIsValidating(true)
        try {
            const validationPromises = cartStore.items
                .filter(item => item.type === 'product')
                .map(item => validateItemStock(item.productId, item.type))

            await Promise.all(validationPromises)
        } catch (error) {
            console.error('Error validating cart stock:', error)
        } finally {
            setIsValidating(false)
        }
    }

    // Check if quantity can be increased
    const canIncreaseQuantity = (productId: string, type: 'product' | 'tour'): boolean => {
        if (type === 'tour') return true // Tours don't have stock limitations

        const cartItem = cartStore.getItem(productId, type)
        if (!cartItem) return false

        const stockLimit = cartItem.quantityInStock ?? 999
        return cartItem.quantity < stockLimit
    }

    // Get maximum quantity that can be added
    const getMaxQuantity = (productId: string, type: 'product' | 'tour'): number => {
        if (type === 'tour') return 99 // Reasonable limit for tours

        const cartItem = cartStore.getItem(productId, type)
        if (!cartItem) return 0

        return cartItem.quantityInStock ?? 999
    }

    // Auto-validate stock periodically
    useEffect(() => {
        if (!autoUpdate || cartStore.items.length === 0) return

        const interval = setInterval(() => {
            validateAllStock()
        }, updateInterval)

        return () => clearInterval(interval)
    }, [autoUpdate, updateInterval, cartStore.items.length])

    return {
        validateItemStock,
        validateAllStock,
        canIncreaseQuantity,
        getMaxQuantity,
        isValidating
    }
}
