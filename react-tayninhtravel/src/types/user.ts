export type UserRole = 'user' | 'Admin' | 'Blogger';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    address?: string;
    status: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}