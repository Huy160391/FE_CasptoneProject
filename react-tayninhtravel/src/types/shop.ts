// Shop related types and interfaces

export interface Shop {
    id: string;
    name: string;
    description: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    image?: string;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    status: ShopStatus;
    specialties?: string[];
    categories?: string[];
    openTime?: string;
    closeTime?: string;
    isVerified?: boolean;
    isOpen?: boolean;
    ownerId?: string;
    ownerName?: string;
    createdDate?: string;
    updatedDate?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    businessLicense?: string;
    taxCode?: string;
    bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };
}

export enum ShopStatus {
    PENDING = 'pending',        // Chờ duyệt
    ACTIVE = 'active',          // Hoạt động
    INACTIVE = 'inactive',      // Không hoạt động
    SUSPENDED = 'suspended',    // Tạm ngưng
    REJECTED = 'rejected',      // Bị từ chối
    CLOSED = 'closed'           // Đã đóng cửa
}

export interface ShopProduct {
    id: string;
    shopId: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: string;
    isAvailable: boolean;
    stock?: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    tags?: string[];
    createdDate: string;
    updatedDate: string;
}

export interface ShopOwner {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    idCard: string;
    idCardImages: string[];
    businessLicense?: string;
    isVerified: boolean;
    createdDate: string;
}

export interface ShopReview {
    id: string;
    shopId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    images?: string[];
    createdDate: string;
    reply?: {
        content: string;
        createdDate: string;
    };
}

// API Response types
export interface ShopsResponse {
    shops: Shop[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface ShopFilters {
    search?: string;
    status?: ShopStatus;
    category?: string;
    isVerified?: boolean;
    isOpen?: boolean;
    location?: {
        latitude: number;
        longitude: number;
        radius: number; // km
    };
    rating?: {
        min: number;
        max: number;
    };
    sortBy?: 'name' | 'rating' | 'createdDate' | 'distance';
    sortOrder?: 'asc' | 'desc';
}

// Form types
export interface CreateShopForm {
    name: string;
    description: string;
    address: string;
    phone: string;
    email?: string;
    website?: string;
    openTime: string;
    closeTime: string;
    categories: string[];
    specialties: string[];
    images: File[];
    businessLicense: File;
    location: {
        latitude: number;
        longitude: number;
    };
}

export interface UpdateShopForm extends Partial<CreateShopForm> {
    id: string;
}

// Utility functions
export const getShopStatusLabel = (status: ShopStatus): string => {
    switch (status) {
        case ShopStatus.PENDING:
            return 'Chờ duyệt';
        case ShopStatus.ACTIVE:
            return 'Hoạt động';
        case ShopStatus.SUSPENDED:
            return 'Tạm ngưng';
        case ShopStatus.REJECTED:
            return 'Bị từ chối';
        case ShopStatus.CLOSED:
            return 'Đã đóng cửa';
        default:
            return status;
    }
};

export const getShopStatusColor = (status: ShopStatus): string => {
    switch (status) {
        case ShopStatus.PENDING:
            return 'orange';
        case ShopStatus.ACTIVE:
            return 'green';
        case ShopStatus.SUSPENDED:
            return 'red';
        case ShopStatus.REJECTED:
            return 'red';
        case ShopStatus.CLOSED:
            return 'default';
        default:
            return 'default';
    }
};
