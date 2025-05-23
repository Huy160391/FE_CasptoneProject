import axiosInstance from '@/config/axios';
import { jwtDecode } from 'jwt-decode';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
    avatar?: string;
}

interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

interface EditAvatarRequest {
    avatar: string;
}

interface LoginResponse {
    user: {
        id: number;
        name: string;
        email: string;
        role: 'user' | 'admin';
        avatar?: string;
        phone?: string;
        address?: string;
    };
    token: string;
}

export interface DecodedToken {
    [key: string]: any;
}

export function decodeToken(token: string): DecodedToken | null {
    try {
        return jwtDecode(token);
    } catch (e) {
        return null;
    }
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const response = await axiosInstance.post('/Authentication/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);

                // Decode token để lấy role và các thông tin khác
                const decoded = decodeToken(response.data.token);
                if (decoded) {
                    const userInfo = {
                        id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                        name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
                        phone: decoded['Phone'] || undefined,
                        avatar: decoded['Avatar'] || 'https://i.imgur.com/4AiXzf8.jpg',
                        address: undefined
                    };
                    localStorage.setItem('user', JSON.stringify(userInfo));
                    return {
                        user: userInfo,
                        token: response.data.token
                    };
                }
            }
            throw new Error('Invalid token response');
        } catch (error) {
            throw error;
        }
    },

    register: async (credentials: RegisterCredentials): Promise<void> => {
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

    changePassword: async (request: ChangePasswordRequest): Promise<void> => {
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

    editAvatar: async (avatar: string): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const request: EditAvatarRequest = { avatar };
            await axiosInstance.put('/Account/edit-Avatar', request, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            throw error;
        }
    },
};