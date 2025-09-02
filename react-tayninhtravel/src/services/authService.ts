import axiosInstance from '@/config/axios';
import { jwtDecode } from 'jwt-decode';
import tokenExpirationService from './tokenExpirationService';
import { getErrorMessage } from '@/utils/errorHandler';
import {
    User,
    RegisterForm,
    ChangePasswordForm,
    AuthCredentials,
    AuthResponse,
    DecodedToken
} from '../types';

interface LoginApiResponse {
    statusCode: number;
    message: string;
    token: string;
    refreshToken: string;
    tokenExpirationTime: string;
    userId: string;
    email: string;
    name: string;
    phoneNumber: string;
    avatar: string;
    role: string;
}

export function decodeToken(token: string): DecodedToken | null {
    try {
        return jwtDecode(token);
    } catch (e) {
        return null;
    }
}

export const authService = {
    login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
        try {
            const response = await axiosInstance.post<LoginApiResponse>('/Authentication/login', credentials);
            const { data } = response;

            if (data.token) {
                localStorage.setItem('token', data.token);

                // Lấy role từ API response thay vì từ token
                let userRole = data.role;

                // Chuẩn hóa role
                if (userRole && (userRole.toLowerCase() === 'admin' || userRole === 'Admin')) {
                    userRole = 'Admin';
                } else if (userRole && (userRole.toLowerCase() === 'blogger' || userRole === 'Blogger')) {
                    userRole = 'Blogger';
                } else if (userRole && (userRole.toLowerCase() === 'tour company' || userRole === 'Tour Company')) {
                    userRole = 'Tour Company';
                } else if (userRole && (userRole.toLowerCase() === 'tour guide' || userRole === 'Tour Guide')) {
                    userRole = 'Tour Guide';
                } else if (userRole && (userRole.toLowerCase() === 'specialty shop' || userRole === 'Specialty Shop')) {
                    userRole = 'Specialty Shop';
                } else {
                    userRole = 'user';
                }

                console.log('API Response role:', data.role);
                console.log('Normalized role:', userRole);

                // Tạo user info từ response API
                const userInfo: User = {
                    id: data.userId,
                    email: data.email,
                    name: data.name,
                    role: userRole as User['role'],
                    phone: data.phoneNumber,
                    avatar: data.avatar || 'https://i.imgur.com/4AiXzf8.jpg',
                    isActive: true, // default true, hoặc lấy từ API nếu có
                    isVerified: true, // default true, hoặc lấy từ API nếu có
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('tokenExpirationTime', data.tokenExpirationTime);

                // Bắt đầu timer để auto logout khi token hết hạn
                tokenExpirationService.startExpirationTimer(data.tokenExpirationTime);

                return {
                    user: userInfo,
                    token: data.token
                };
            }
            throw new Error('Invalid response from server');
        } catch (error: any) {
            // Error is already handled by axios interceptor
            throw {
                message: error.standardizedError?.message || getErrorMessage(error),
                statusCode: error.standardizedError?.statusCode || error.response?.status || 500
            };
        }
    },

    /**
     * Đăng nhập bằng Google Identity SDK, nhận về idToken từ client
     * @param idToken id_token từ Google
     * @returns AuthResponse
     */
    loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
        try {
            const response = await axiosInstance.post<LoginApiResponse>('/Authentication/login-google', { idToken });
            const { data } = response;

            if (data.token) {
                localStorage.setItem('token', data.token);

                // Lấy role từ API response thay vì từ token
                let userRole = data.role;

                // Chuẩn hóa role
                if (userRole && (userRole.toLowerCase() === 'admin' || userRole === 'Admin')) {
                    userRole = 'Admin';
                } else if (userRole && (userRole.toLowerCase() === 'blogger' || userRole === 'Blogger')) {
                    userRole = 'Blogger';
                } else if (userRole && (userRole.toLowerCase() === 'tour company' || userRole === 'Tour Company')) {
                    userRole = 'Tour Company';
                } else if (userRole && (userRole.toLowerCase() === 'tour guide' || userRole === 'Tour Guide')) {
                    userRole = 'Tour Guide';
                } else if (userRole && (userRole.toLowerCase() === 'specialty shop' || userRole === 'Specialty Shop')) {
                    userRole = 'Specialty Shop';
                } else {
                    userRole = 'user';
                }

                // Tạo user info từ response API
                const userInfo: User = {
                    id: data.userId,
                    email: data.email,
                    name: data.name,
                    role: userRole as User['role'],
                    phone: data.phoneNumber,
                    avatar: data.avatar || 'https://i.imgur.com/4AiXzf8.jpg',
                    isActive: true,
                    isVerified: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('tokenExpirationTime', data.tokenExpirationTime);

                // Bắt đầu timer để auto logout khi token hết hạn
                tokenExpirationService.startExpirationTimer(data.tokenExpirationTime);

                return {
                    user: userInfo,
                    token: data.token
                };
            }
            throw new Error('Invalid response from server');
        } catch (error: any) {
            // Error is already handled by axios interceptor
            throw {
                message: error.standardizedError?.message || getErrorMessage(error),
                statusCode: error.standardizedError?.statusCode || error.response?.status || 500
            };
        }
    },

    register: async (credentials: RegisterForm): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/register', credentials);
        } catch (error: any) {
            throw {
                message: error.standardizedError?.message || getErrorMessage(error),
                statusCode: error.standardizedError?.statusCode || error.response?.status || 500
            };
        }
    },

    verifyOTP: async (email: string, otp: string): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/verify-otp', { email, otp });
        } catch (error: any) {
            throw {
                message: error.standardizedError?.message || getErrorMessage(error),
                statusCode: error.standardizedError?.statusCode || error.response?.status || 500
            };
        }
    },

    changePassword: async (request: ChangePasswordForm): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            await axiosInstance.put('/Account/change-password', request, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error: any) {
            throw {
                message: error.standardizedError?.message || getErrorMessage(error),
                statusCode: error.standardizedError?.statusCode || error.response?.status || 500
            };
        }
    },

    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/logout');

            // Clear expiration timer
            tokenExpirationService.clearExpirationTimer();

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpirationTime');
        } catch (error) {
            throw error;
        }
    },

    sendOtpResetPassword: async (email: string): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/send-otp-reset-password', { email });
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/reset-password', { email, otp, newPassword });
        } catch (error) {
            throw error;
        }
    },

    editAvatar: async (avatarFile: File): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Avatar file to upload:', avatarFile);
            console.log('Avatar file type:', avatarFile.type);
            console.log('Avatar file size:', avatarFile.size);
            console.log('Avatar file name:', avatarFile.name);

            // Tạo FormData để gửi file theo đúng định dạng multipart/form-data
            const formData = new FormData();
            formData.append('Avatar', avatarFile, avatarFile.name);

            console.log('FormData created with file');

            // Log các entries trong FormData (để debug)
            for (let entry of formData.entries()) {
                console.log('FormData entry:', entry[0], entry[1]);
            }

            // Gửi FormData với file thật, không chuyển đổi thành base64
            await axiosInstance.put('/Account/edit-Avatar', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Content-Type sẽ được tự động set với boundary phù hợp
                }
            });
        } catch (error) {
            console.error('Edit avatar error details:', error);
            throw error;
        }
    },
};

export default authService;