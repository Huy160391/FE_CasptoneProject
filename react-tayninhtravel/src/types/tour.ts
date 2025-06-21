// Các params cho API lấy danh sách template tour
export interface GetTourTemplatesParams {
    pageIndex?: number;
    pageSize?: number;
    textSearch?: string;
    templateType?: string | number;
    startLocation?: string;
    includeInactive?: boolean;
}

// Response cho API lấy danh sách template tour
export interface GetTourTemplatesResponse {
    data: any[]; // Có thể thay any bằng kiểu dữ liệu template cụ thể nếu có
    totalRecord: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}

// Tour domain types
export interface Tour {
    id: string;
    title: string;
    description: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    duration: string;
    location: string;
    category: string;
    images: string[];
    thumbnail?: string;
    maxGroupSize: number;
    minGroupSize?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    highlights: string[];
    included: string[];
    excluded?: string[];
    itinerary?: TourItinerary[];
    rating: number;
    reviewCount: number;
    isActive: boolean;
    featured?: boolean;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface TourItinerary {
    day: number;
    title: string;
    activities: string[];
    meals?: string[];
    accommodation?: string;
}

export type TemplateType = 1 | 2; // 1: FreeScenic, 2: PaidAttraction

export interface TourTemplate {
    id: string;
    title: string;
    templateType: TemplateType;
    startLocation: string;
    endLocation: string;
    isActive: boolean;
    createdAt: string;
    month: number;
    year: number;
    images: string[];
}

export interface ItineraryItem {
    id: string;
    checkpoint: string; // time like "08:00"
    activity: string;
}

export interface TourManagement {
    id: string;
    name: string;
    templateId: string;
    templateName: string;
    maxGroupSize: number;
    currentBookings: number;
    price: number;
    tourDate: string;
    description: string;
    guideInfo: string;
    itinerary: ItineraryItem[];
    createdAt: string;
}
