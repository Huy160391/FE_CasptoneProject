/**
 * App Initialization Service
 * Khởi tạo các service cần thiết khi app load và validate token
 */

import tokenExpirationService from './tokenExpirationService';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../store/useAuthStore';

interface JWTPayload {
    exp?: number;
    iat?: number;
    [key: string]: any;
}

export const appInitService = {
    /**
     * Validate token còn hợp lệ không
     * @returns true nếu token hợp lệ, false nếu hết hạn hoặc không tồn tại
     */
    validateStoredToken: (): boolean => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.log('No token found in localStorage');
                return false;
            }

            // Decode token để kiểm tra expiration
            const decoded = jwtDecode<JWTPayload>(token);
            
            if (!decoded.exp) {
                console.warn('Token does not contain expiration claim');
                return false;
            }

            // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
            const currentTime = Date.now() / 1000;
            const isExpired = decoded.exp < currentTime;
            
            if (isExpired) {
                console.warn('Token has expired:', {
                    expiredAt: new Date(decoded.exp * 1000).toISOString(),
                    currentTime: new Date().toISOString()
                });
                return false;
            }

            // Token is valid
            console.log('Token is valid, expires at:', new Date(decoded.exp * 1000).toISOString());
            return true;
            
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    },

    /**
     * Clear all auth data and redirect to login
     */
    clearAuthAndRedirect: (): void => {
        console.log('Clearing auth data and redirecting to login...');
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpirationTime');
        localStorage.removeItem('auth-storage'); // Clear zustand persist storage
        
        // Clear auth store
        const authStore = useAuthStore.getState();
        authStore.logout();
        
        // Clear token expiration timer
        tokenExpirationService.clearExpirationTimer();
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && 
            window.location.pathname !== '/' &&
            !window.location.pathname.includes('/404')) {
            window.location.href = '/login';
        }
    },

    /**
     * Khởi tạo app - validate token và setup services
     */
    initialize: (): void => {
        console.log('Initializing app services...');

        // Check if token exists and is valid
        const isTokenValid = appInitService.validateStoredToken();
        
        if (!isTokenValid) {
            // Token không hợp lệ hoặc đã hết hạn
            console.warn('Invalid or expired token detected on app initialization');
            appInitService.clearAuthAndRedirect();
            return;
        }

        // Token hợp lệ, khởi tạo token expiration service
        const tokenExpirationTime = localStorage.getItem('tokenExpirationTime');
        if (tokenExpirationTime) {
            tokenExpirationService.startExpirationTimer(tokenExpirationTime);
        } else {
            // Nếu không có tokenExpirationTime, tính từ token
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode<JWTPayload>(token);
                    if (decoded.exp) {
                        const expirationTime = new Date(decoded.exp * 1000).toISOString();
                        localStorage.setItem('tokenExpirationTime', expirationTime);
                        tokenExpirationService.startExpirationTimer(expirationTime);
                    }
                } catch (error) {
                    console.error('Error setting up token expiration from JWT:', error);
                }
            }
        }

        // Setup periodic token validation (every 1 minute)
        appInitService.startPeriodicValidation();

        console.log('App services initialized successfully');
    },

    /**
     * Start periodic token validation
     */
    startPeriodicValidation: (): void => {
        // Check token validity every minute
        setInterval(() => {
            const isValid = appInitService.validateStoredToken();
            if (!isValid) {
                console.warn('Token validation failed during periodic check');
                appInitService.clearAuthAndRedirect();
            }
        }, 60000); // 60 seconds
    },

    /**
     * Cleanup khi app unmount
     */
    cleanup: (): void => {
        console.log('Cleaning up app services...');
        tokenExpirationService.clearExpirationTimer();
    }
};

export default appInitService;
