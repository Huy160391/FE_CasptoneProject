import axios from 'axios';
import { API_BASE_URL } from './constants';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 30 giây
    headers: {
        'Content-Type': 'application/json',
        'accept': 'text/plain',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage hoặc store
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            // Xử lý lỗi timeout
            console.error('Yêu cầu đã hết thời gian chờ. Vui lòng thử lại sau.');
            // Hiển thị thông báo cho người dùng
            // Có thể sử dụng notification của Ant Design hoặc toast từ thư viện khác
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