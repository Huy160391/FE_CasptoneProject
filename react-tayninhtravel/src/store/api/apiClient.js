import axios from 'axios';
import storageService from '../../services/storageService';
import { jwtDecode } from 'jwt-decode';

// Tạo API client
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

// Hàm xử lý token hết hạn
const handleTokenExpiration = () => {
  storageService.clearAll();
  // Dispatch custom event để các component có thể lắng nghe
  window.dispatchEvent(new Event('tokenExpired'));
};

// Interceptor cho request
apiClient.interceptors.request.use(
  (config) => {
    const token = storageService.getAccessToken();
    if (token) {
      if (isTokenExpired(token)) {
        handleTokenExpiration();
        return Promise.reject('Token đã hết hạn');
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      handleTokenExpiration();
    }
    return Promise.reject(error);
  }
);

export default apiClient;