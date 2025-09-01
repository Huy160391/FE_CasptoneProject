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

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 giây
    headers: {
        'Content-Type': 'application/json',
        'accept': 'text/plain',
    },
});

// Development logging
if (isDevelopment) {
}

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage hoặc store
        const token = localStorage.getItem('token');
        if (token) {
            // Kiểm tra token còn hợp lệ không trước khi gửi request
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                if (decoded.exp) {
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        // Token đã hết hạn, clear và redirect
                        console.warn('Token expired, redirecting to login');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('tokenExpirationTime');
                        localStorage.removeItem('auth-storage');
                        
                        // Redirect to login
                        if (window.location.pathname !== '/login' && 
                            window.location.pathname !== '/' &&
                            !window.location.pathname.includes('/404')) {
                            window.location.href = '/login';
                        }
                        
                        // Cancel the request
                        return Promise.reject(new Error('Token expired'));
                    }
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                // Invalid token, clear and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('auth-storage');
                
                if (window.location.pathname !== '/login' && 
                    window.location.pathname !== '/' &&
                    !window.location.pathname.includes('/404')) {
                    window.location.href = '/login';
                }
                
                return Promise.reject(new Error('Invalid token'));
            }
            
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Nếu là FormData, không thiết lập header Content-Type
        // Để axios tự thêm boundary đúng (quan trọng cho multipart/form-data)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            // Không apply timezone transformation cho FormData
            return config;
        }

        // Add timezone headers for Vietnam timezone
        config.headers['X-Timezone'] = 'Asia/Ho_Chi_Minh';
        config.headers['X-Timezone-Offset'] = '+07:00';

        // Apply timezone transformation to request data
        const timezoneInterceptor = createTimezoneRequestInterceptor();
        config = timezoneInterceptor(config);

        // Development logging
        if (isDevelopment) {
            // Đã xoá log request
        }

        return config;
    },
    (error) => {
        if (isDevelopment) {
            console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
    }
);


// Response interceptor with comprehensive error handling
axiosInstance.interceptors.response.use(
    (response) => {
        // Apply timezone transformation to response data
        const timezoneInterceptor = createTimezoneResponseInterceptor();
        response = timezoneInterceptor(response);
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

export default axiosInstance; 