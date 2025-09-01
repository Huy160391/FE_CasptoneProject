import axios from 'axios';
import { API_BASE_URL } from './constants';
import { createTimezoneRequestInterceptor, createTimezoneResponseInterceptor } from '../utils/apiHelpers';
import { jwtDecode } from 'jwt-decode';
import { handleApiError, logError } from '../utils/errorHandler';

interface JWTPayload {
    exp?: number;
    [key: string]: any;
}

// Development logging
const isDevelopment = import.meta.env.DEV;

// Create axios instance with default configuration
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds
    headers: {
        'Content-Type': 'application/json',
        'accept': 'text/plain',
    },
});

// Request interceptor with enhanced error handling
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
            // Validate token before sending request
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                if (decoded.exp) {
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        // Token expired - clear and handle
                        logError(new Error('Token expired'), 'Request Interceptor');
                        
                        // Clear all auth data
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('tokenExpirationTime');
                        localStorage.removeItem('auth-storage');
                        
                        // Redirect to login if not already there
                        if (window.location.pathname !== '/login' && 
                            window.location.pathname !== '/' &&
                            !window.location.pathname.includes('/404')) {
                            window.location.href = '/login';
                        }
                        
                        // Cancel the request
                        return Promise.reject({
                            response: {
                                status: 401,
                                data: {
                                    success: false,
                                    message: 'Phiên đăng nhập đã hết hạn',
                                    statusCode: 401
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                logError(error, 'Token Decode');
                
                // Invalid token - clear and handle
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('auth-storage');
                
                if (window.location.pathname !== '/login' && 
                    window.location.pathname !== '/' &&
                    !window.location.pathname.includes('/404')) {
                    window.location.href = '/login';
                }
                
                return Promise.reject({
                    response: {
                        status: 401,
                        data: {
                            success: false,
                            message: 'Token không hợp lệ',
                            statusCode: 401
                        }
                    }
                });
            }
            
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Handle FormData - don't set Content-Type header
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            return config;
        }

        // Add timezone headers for Vietnam timezone
        config.headers['X-Timezone'] = 'Asia/Ho_Chi_Minh';
        config.headers['X-Timezone-Offset'] = '+07:00';

        // Apply timezone transformation to request data
        const timezoneInterceptor = createTimezoneRequestInterceptor();
        config = timezoneInterceptor(config);

        return config;
    },
    (error) => {
        logError(error, 'Request Configuration');
        return Promise.reject(error);
    }
);

// Response interceptor with comprehensive error handling
axiosInstance.interceptors.response.use(
    (response) => {
        // Apply timezone transformation to response data
        const timezoneInterceptor = createTimezoneResponseInterceptor();
        response = timezoneInterceptor(response);

        // Log successful responses in development
        if (isDevelopment && response.config.url) {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data
            });
        }

        return response;
    },
    (error) => {
        // Use centralized error handler
        const errorResponse = handleApiError(error, true);
        
        // Log error details in development
        logError(error, `API ${error.config?.method?.toUpperCase()} ${error.config?.url}`);

        // Return standardized error format
        return Promise.reject({
            ...error,
            standardizedError: errorResponse
        });
    }
);

// Helper function to make requests with automatic retry for 5xx errors
export const makeRequestWithRetry = async <T>(
    config: any,
    maxRetries = 3,
    retryDelay = 1000
): Promise<T> => {
    let lastError: any = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await axiosInstance.request(config);
            return response.data;
        } catch (error: any) {
            lastError = error;
            
            // Only retry for 5xx errors or network errors
            const status = error.response?.status;
            const isRetryable = !status || status >= 500 || error.code === 'ERR_NETWORK';
            
            if (!isRetryable || attempt === maxRetries - 1) {
                throw error;
            }
            
            // Exponential backoff
            const delay = retryDelay * Math.pow(2, attempt);
            if (isDevelopment) {
                console.log(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp) {
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        }
    } catch {
        return false;
    }
    
    return false;
};

// Utility function to get current user role
export const getCurrentUserRole = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
        const user = JSON.parse(userStr);
        return user.role || null;
    } catch {
        return null;
    }
};

// Export configured instance
export default axiosInstance;

// Export additional utilities
export {
    makeRequestWithRetry,
    isAuthenticated,
    getCurrentUserRole
};
