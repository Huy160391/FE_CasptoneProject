import axiosInstance from '@/config/axios';
import { jwtDecode } from 'jwt-decode';
import {
    User,
    RegisterForm,
    ChangePasswordForm,
    AuthCredentials,
    AuthResponse
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
}

export interface DecodedToken {
    [key: string]: any;
    exp?: number;
    iat?: number;
    userId?: string;
    email?: string;
    role?: string;
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

                // Chỉ decode token để lấy role
                const decoded = decodeToken(data.token);
                if (!decoded) {
                    throw new Error('Invalid token format');
                }

                // Lấy role từ token
                let userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];                // Đảm bảo role là 'Admin', 'Blogger' hoặc 'user'
                if (userRole && (userRole.toLowerCase() === 'admin' || userRole === 'Admin')) {
                    userRole = 'Admin';
                } else if (userRole && (userRole.toLowerCase() === 'blogger' || userRole === 'Blogger')) {
                    userRole = 'Blogger';
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
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('tokenExpirationTime', data.tokenExpirationTime);

                return {
                    user: userInfo,
                    token: data.token
                };
            }
            throw new Error('Invalid response from server');
        } catch (error) {
            throw error;
        }
    },

    register: async (credentials: RegisterForm): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/register', credentials);
        } catch (error) {
            throw error;
        }
    },

    verifyOTP: async (email: string, otp: string): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/verify-otp', { email, otp });
        } catch (error) {
            throw error;
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
        } catch (error) {
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post('/Authentication/logout');
            localStorage.removeItem('token');
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