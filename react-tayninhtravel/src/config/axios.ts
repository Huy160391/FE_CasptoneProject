import axios from 'axios';
import { API_BASE_URL } from './constants';

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
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Nếu là FormData, không thiết lập header Content-Type
        // Để axios tự thêm boundary đúng (quan trọng cho multipart/form-data)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

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


// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Development logging
        if (isDevelopment) {
            // Đã xoá log response
        }
        return response;
    },
    (error) => {
        // Development logging
        if (isDevelopment) {
            console.error('❌ API Error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                data: error.response?.data
            });
        }

        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            // Xử lý lỗi timeout
            console.error('Yêu cầu đã hết thời gian chờ. Vui lòng thử lại sau.');
        } else if (error.code === 'ERR_NETWORK') {
            // Xử lý lỗi network (không kết nối được server)
            console.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server có đang chạy không.');
        } else if (error.response) {
            // Xử lý các lỗi từ server
            switch (error.response.status) {
                case 401:
                    // Unauthorized - Xóa token và chuyển về trang 404
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/404';
                    break;
                case 403:
                    // Forbidden
                    console.error('Bạn không có quyền truy cập');
                    break;
                case 404:
                    // Not Found
                    console.error('Không tìm thấy tài nguyên');
                    break;
                case 500:
                    // Server Error
                    console.error('Lỗi server');
                    break;
                default:
                    console.error('Có lỗi xảy ra');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 