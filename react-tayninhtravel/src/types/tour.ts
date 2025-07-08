// Enums theo API specification
export enum TourTemplateType {
    FreeScenic = 1,      // Tour danh lam thắng cảnh (miễn phí vào cửa)
    PaidAttraction = 2   // Tour khu vui chơi (có phí vào cửa)
}

export enum ScheduleDay {
    Sunday = 0,    // Chủ nhật ✅ Được phép
    Saturday = 6   // Thứ bảy ✅ Được phép
    // Monday-Friday (1-5) KHÔNG được phép
}

export enum TourSlotStatus {
    Available = 1,       // Slot có sẵn để booking
    FullyBooked = 2,     // Slot đã được booking đầy
    Cancelled = 3,       // Slot bị hủy
    Completed = 4,       // Slot đã hoàn thành
    InProgress = 5       // Slot đang trong quá trình thực hiện
}

export enum TourDetailsStatus {
    Pending = 0,                    // Chờ duyệt
    Approved = 1,                   // Đã được duyệt
    Rejected = 2,                   // Bị từ chối
    Suspended = 3,                  // Tạm ngưng
    AwaitingGuideAssignment = 4,    // Chờ phân công hướng dẫn viên
    Cancelled = 5,                  // Đã hủy
    AwaitingAdminApproval = 6,      // Chờ admin duyệt
    WaitToPublic = 7,               // Chờ công khai
    Public = 8                      // Đã công khai (có thể booking)
}

export enum TourOperationStatus {
    Scheduled = 1,           // Operation đã được lên lịch và sẵn sàng
    InProgress = 2,          // Operation đang được thực hiện
    Completed = 3,           // Operation đã hoàn thành thành công
    Cancelled = 4,           // Operation bị hủy
    Postponed = 5,           // Operation bị hoãn
    PendingConfirmation = 6  // Operation đang chờ xác nhận từ guide
}

// TourGuide related types
export interface TourGuide {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    isAvailable: boolean;
    experienceYears: number;
    specialization?: string;
    averageRating?: number;
    completedTours: number;
    joinedDate: string;
    currentStatus: string;
}

// Các params cho API lấy danh sách template tour
export interface GetTourTemplatesParams {
    pageIndex?: number;
    pageSize?: number;
    textSearch?: string;
    templateType?: TourTemplateType | string;
    startLocation?: string;
    includeInactive?: boolean;
}

// Response cho API lấy danh sách template tour
export interface GetTourTemplatesResponse {
    statusCode: number;
    message: string;
    success: boolean;
    data: {
        items: TourTemplate[];
        totalCount: number;
        pageIndex: number;
        pageSize: number;
    };
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

// API Response interfaces
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    success: boolean;
    data?: T;
    totalCount?: number; // For paginated responses
    pageIndex?: number;  // For paginated responses
    pageSize?: number;   // For paginated responses
    totalPages?: number; // For paginated responses
    validationErrors?: string[];
    fieldErrors?: Record<string, string[]>;
}

// TourTemplate interfaces
export interface TourTemplate {
    id: string;
    title: string;
    templateType: TourTemplateType;
    scheduleDays: ScheduleDay;
    startLocation: string;
    endLocation: string;
    month: number;
    year: number;
    isActive: boolean;
    images: string[];
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    capacitySummary?: {
        totalSlots: number;
        availableSlots: number;
        totalCapacity: number;
    } | null;
}

// Request DTOs
export interface CreateTourTemplateRequest {
    title: string;
    startLocation: string;
    endLocation: string;
    templateType: TourTemplateType;
    scheduleDays: ScheduleDay;
    month: number;
    year: number;
    images: string[];
}

export interface UpdateTourTemplateRequest {
    title?: string;
    templateType?: TourTemplateType;
    scheduleDays?: ScheduleDay;
    startLocation?: string;
    endLocation?: string;
    images?: string[];
}

// TourSlot interfaces
export interface TourSlot {
    id: string;
    tourTemplateId: string;
    tourDate: string;
    scheduleDay: ScheduleDay;
    status: TourSlotStatus;
    tourDetailsId?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string | null;
}

// TourDetails interfaces - Updated to match backend TourDetailDto
export interface TourDetails {
    id: string;
    tourTemplateId: string;
    tourTemplateName: string;
    title: string;
    description?: string;
    status: TourDetailsStatus;
    commentApproved?: string;
    skillsRequired?: string;
    timeline: TimelineItem[];
    tourOperation?: TourOperation;
    timelineItemsCount: number;
    assignedSlotsCount: number;
    invitedSpecialtyShops: TourDetailsSpecialtyShop[];
    invitedShopsCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

// TourDetailsSpecialtyShop interface for invited shops
export interface TourDetailsSpecialtyShop {
    id: string;
    tourDetailsId: string;
    specialtyShopId: string;
    specialtyShop: SpecialtyShop;
    invitedAt: string;
    status: string; // "Pending", "Accepted", "Rejected"
}

export interface CreateTourDetailsRequest {
    tourTemplateId: string;
    title: string;
    description: string;
    skillsRequired: string;
    specialtyShopIds?: string[];
}

// TourOperation interfaces
export interface TourOperation {
    id: string;
    tourDetailsId: string;
    guideId?: string | null;
    guideName?: string | null;
    guidePhone?: string | null;
    price: number;
    maxSeats: number;
    currentBookings: number;
    bookedSeats: number;
    availableSeats: number;
    status: TourOperationStatus;
    description?: string | null;
    notes?: string | null;
    isActive: boolean;
    guide?: Guide | null; // Keep for backward compatibility
    createdAt: string;
    updatedAt?: string | null;
}

export interface Guide {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
}

export interface CreateTourOperationRequest {
    tourDetailsId: string;
    price: number;
    maxSeats: number;
    guideId?: string | null;
}

// Timeline interfaces
export interface TimelineItem {
    id: string;
    tourDetailsId: string;
    checkInTime: string; // Format: "HH:mm"
    activity: string;
    location?: string;
    specialtyShopId?: string | null;
    orderIndex: number; // Changed from sortOrder to match API
    estimatedDuration?: number; // in minutes
    specialtyShop?: SpecialtyShop | null;
    createdAt: string;
    updatedAt?: string | null;
}

export interface CreateTimelineItemRequest {
    tourDetailsId: string;
    checkInTime: string;
    activity: string;
    location?: string;
    specialtyShopId?: string | null;
    orderIndex: number; // Changed from sortOrder to match API
    estimatedDuration?: number; // in minutes
}

export interface CreateTimelineItemsRequest {
    tourDetailsId: string;
    timelineItems: {
        checkInTime: string;
        activity: string;
        specialtyShopId?: string | null;
        sortOrder?: number;
    }[];
}

// SpecialtyShop interface (basic)
export interface SpecialtyShop {
    id: string;
    shopName: string;
    location: string;
    isShopActive: boolean;
}

// Legacy interfaces (keep for backward compatibility)
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

// Tour Guide Invitation interfaces
export interface TourGuideInvitation {
    id: string;
    tourDetails: {
        id: string;
        title: string;
    };
    guide: {
        id: string;
        name: string;
        email: string;
    };
    createdBy: {
        id: string;
        name: string;
    };
    invitationType: string; // "Automatic" | "Manual"
    status: string; // "Pending" | "Accepted" | "Rejected" | "Expired"
    invitedAt: string;
    expiresAt: string;
    respondedAt?: string | null;
    rejectionReason?: string | null;
}

export interface InvitationStatistics {
    totalInvitations: number;
    pendingInvitations: number;
    acceptedInvitations: number;
    rejectedInvitations: number;
    expiredInvitations: number;
    acceptanceRate: number;
    rejectionRate: number;
}

export interface TourGuideInvitationsResponse {
    tourDetails: {
        id: string;
        title: string;
    };
    invitations: TourGuideInvitation[];
    statistics: InvitationStatistics;
    statusCode: number;
    message: string;
    success: boolean;
}

// Capacity interfaces
export interface TourCapacityInfo {
    maxSeats: number;
    bookedSeats: number;
    availableSeats: number;
    isFullyBooked: boolean;
}

// Remove duplicate ApiResponse interface - using the one above

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}
