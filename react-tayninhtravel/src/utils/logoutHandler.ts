import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { message } from 'antd'

/**
 * Centralized logout handler that properly syncs cart before logout
 * @param showSuccessMessage - Whether to show success message
 */
export const handleLogoutWithCartSync = async (showSuccessMessage: boolean = true) => {
    try {
        // Get current token and cart
        const token = localStorage.getItem('token');

        if (token) {
            try {
                // Import cartService dynamically to avoid circular imports
                const { syncCartOnLogout } = await import('@/services/cartService');
                await syncCartOnLogout(token);
            } catch (e) {
                // Don't block logout process if cart sync fails
                console.warn('Error syncing cart on logout:', e);
            }
        }

        // Clear cart in Zustand store
        useCartStore.getState().clearCart();

        // Clear localStorage của cart store (do Zustand persist)
        localStorage.removeItem('cart-storage');

        // Logout và clear auth data
        useAuthStore.getState().logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');

        if (showSuccessMessage) {
            message.success('Đăng xuất thành công');
        }

    } catch (error) {
        console.error('Error during logout:', error);
        // Still perform basic logout even if there's an error
        useCartStore.getState().clearCart();
        localStorage.removeItem('cart-storage');
        useAuthStore.getState().logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');

        if (showSuccessMessage) {
            message.success('Đăng xuất thành công');
        }
    }
};
