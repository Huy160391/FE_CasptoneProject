export type UserRole = 'user' | 'Admin' | 'Blogger' | 'Tour Company';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    address?: string;
    isActive: boolean; // Đổi từ status sang isActive
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

// Kiểu dữ liệu user trả về từ API
export interface ApiUser {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role?: string;
    isActive: boolean;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
}

export interface CreateUserPayload extends UpdateUserPayload {
    password: string;
}

export interface ProfileUpdatePayload {
    name: string;
    phoneNumber: string;
}

export interface TourGuideApplication {
    email: string;
    curriculumVitae: File;
}