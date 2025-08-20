// Booking API response types
export interface TourInforResponse {
    success: boolean;
    message: string;
    data: {
        items: TourInfor[];
        totalCount: number;
        pageIndex: number;
        pageSize: number;
        totalPages: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
    };
    note?: string | null;
}

export interface TourInfor {
    id: string;
    tourOperationId: string;
    userId: string;
    numberOfGuests: number;
    originalPrice: number;
    discountPercent: number;
    totalPrice: number;
    status: string;
    statusName: string;
    bookingCode: string;
    payOsOrderCode: string;
    qrCodeData: string | null;
    bookingDate: string;
    confirmedDate: string | null;
    cancelledDate: string | null;
    cancellationReason: string | null;
    customerNotes: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    specialRequests: string;
    bookingType: string;
    groupName: string | null;
    groupDescription: string | null;
    groupQRCodeData: string | null;
    createdAt: string;
    updatedAt: string;
    guests: TourInforGuest[];
    tourOperation: TourOperation;
    user: TourInforUser;
}

export interface TourInforGuest {
    id: string;
    tourBookingId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    isGroupRepresentative: boolean;
    qrCodeData: string | null;
    isCheckedIn: boolean;
    checkInTime: string | null;
    checkInNotes: string | null;
    createdAt: string;
}

export interface TourInforUser {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}
// PendingTour type for admin pending tour list (bỏ qua tourOperation)
export interface PendingTour {
    id: string;
    tourTemplateId: string;
    tourTemplateName: string;
    tourCompanyName: string;
    startLocation: string;
    endLocation: string;
    scheduleDays: string;
    title: string;
    description: string;
    status: TourDetailsStatus | string; // API có thể trả về string hoặc enum
    commentApproved: string | null;
    skillsRequired: string;
    imageUrls: string[];
    imageUrl: string | null;
    timeline: {
        id: string;
        tourDetailsId: string;
        checkInTime: string;
        activity: string;
        specialtyShopId: string | null;
        sortOrder: number;
        specialtyShop: any | null;
        createdAt: string;
        updatedAt: string;
    }[];
    tourOperation?: {
        id: string;
        tourDetailsId: string;
        guideId: string;
        guideName: string | null;
        guideEmail: string | null;
        guidePhoneNumber: string | null;
        price: number;
        maxGuests: number;
        currentBookings: number;
        availableSpots: number;
        status: string;
        statusName: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
    timelineItemsCount: number;
    assignedSlotsCount: number;
    invitedSpecialtyShops: any[];
    invitedShopsCount: number;
    createdAt: string;
    updatedAt: string;
}
// Enums theo API specification
export enum TourTemplateType {
    FreeScenic = 1, // Tour danh lam thắng cảnh (miễn phí vào cửa)
    PaidAttraction = 2, // Tour khu vui chơi (có phí vào cửa)
}

export enum ScheduleDay {
    Sunday = 0, // Chủ nhật ✅ Được phép
    Saturday = 6, // Thứ bảy ✅ Được phép
    // Monday-Friday (1-5) KHÔNG được phép
}

export enum TourSlotStatus {
    Available = 1, // Slot có sẵn để booking
    FullyBooked = 2, // Slot đã được booking đầy
    Cancelled = 3, // Slot bị hủy
    Completed = 4, // Slot đã hoàn thành
    InProgress = 5, // Slot đang trong quá trình thực hiện
}

export enum TourDetailsStatus {
    Pending = 0, // Chờ duyệt
    Approved = 1, // Đã được duyệt
    Rejected = 2, // Bị từ chối
    Suspended = 3, // Tạm ngưng
    AwaitingGuideAssignment = 4, // Chờ phân công hướng dẫn viên
    Cancelled = 5, // Đã hủy
    AwaitingAdminApproval = 6, // Chờ admin duyệt
    WaitToPublic = 7, // Chờ mở bán vé
    Public = 8, // Đã được public, khách hàng có thể booking
}

// export enum InvitationStatus {
//     Pending = 1,     // Đang chờ phản hồi
//     Accepted = 2,    // Đã chấp nhận
//     Rejected = 3,    // Đã từ chối
//     Expired = 4      // Đã hết hạn
// }

export enum TourOperationStatus {
    Scheduled = 1, // Operation đã được lên lịch và sẵn sàng
    InProgress = 2, // Operation đang được thực hiện
    Completed = 3, // Operation đã hoàn thành thành công
    Cancelled = 4, // Operation bị hủy
    Postponed = 5, // Operation bị hoãn
    PendingConfirmation = 6, // Operation đang chờ xác nhận từ guide
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

// Request params cho API lấy danh sách tour details
export interface GetTourDetailsListParams {
    pageIndex?: number;
    pageSize?: number;
    includeInactive?: boolean;
    templateId?: string;
    titleFilter?: string;
}

// Response cho API lấy danh sách template tour
export interface GetTourTemplatesResponse {
    statusCode: number;
    message: string;
    success?: boolean;
    data: TourTemplate[]; // Backend returns array directly, not wrapped in items
    totalRecord: number; // Backend uses totalRecord, not totalCount
    totalPages: number;
    pageIndex?: number;
    pageSize?: number;
}

// Response cho API lấy danh sách tour details (paginated)
export interface GetTourDetailsListResponse {
    statusCode: number;
    message: string;
    success: boolean;
    data: TourDetails[]; // Backend returns array directly
    totalCount: number;
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
    difficulty: "easy" | "medium" | "hard";
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
    pageIndex?: number; // For paginated responses
    pageSize?: number; // For paginated responses
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

export interface CreateHolidayTourTemplateRequest {
    title: string;
    startLocation: string;
    endLocation: string;
    templateType: TourTemplateType;
    tourDate: string; // Format: YYYY-MM-DD
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
    status: string | TourSlotStatus;
    tourDetailsId?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string | null;
    maxGuests: number;
    currentBookings: number;
    availableSpots: number;
}

// TourDetails interfaces - Updated to match backend TourDetailDto
export interface TourDetails {
    id: string;
    tourTemplateId: string;
    tourTemplateName: string;
    startLocation?: string; // From TourTemplate
    endLocation?: string; // From TourTemplate
    scheduleDays?: string; // From TourTemplate (ScheduleDay enum as string)
    title: string;
    description?: string;
    status: TourDetailsStatus;
    commentApproved?: string;
    skillsRequired?: string;
    imageUrls: string[]; // New field for multiple images
    imageUrl?: string; // Backward compatibility - returns first image
    timeline: TimelineItem[];
    tourOperation?: TourOperation;
    timelineItemsCount: number;
    assignedSlotsCount: number;
    invitedSpecialtyShops: TourDetailsSpecialtyShop[];
    invitedShopsCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    availableSlots?: TourSlot[];
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
    imageUrls?: string[]; // New field for multiple images
    imageUrl?: string; // Backward compatibility
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

// TourGuide interface for operational tour guides
export interface TourGuide {
    id: string;
    userId: string;
    applicationId: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    experience: string;
    skills: string;
    isAvailable: boolean;
    rating: number;
    totalToursGuided: number;
    approvedAt: string;
    approvedById?: string;
    createdAt: string;
    createdById?: string;
    updatedAt?: string;
    updatedById?: string;
}

export interface CreateTourOperationRequest {
    tourDetailsId: string;
    price: number;
    maxSeats: number;
    guideId?: string | null;
    description?: string | null;
    notes?: string | null;
}

// Response interface for tour operation update
export interface UpdateTourOperationResponse {
    success: boolean;
    message?: string;
    operation?: TourOperation;
    validationErrors?: string[];
}

// Timeline interfaces
export interface TimelineItem {
    id: string;
    tourDetailsId: string;
    checkInTime: string; // Format: "HH:mm"
    activity: string;
    location?: string;
    specialtyShopId?: string | null;
    sortOrder: number; // Use sortOrder to match backend API
    orderIndex?: number; // Keep for backward compatibility
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
    sortOrder: number; // Use sortOrder to match backend API
    orderIndex?: number; // Keep for backward compatibility
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
        startDate?: string;
        endDate?: string;
        location?: string;
        price?: number;
        maxParticipants?: number;
        duration?: string;
        description?: string;
        category?: string;
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
    invitationMessage?: string | null; // Message from TourCompany
}

export interface InvitationStatistics {
    totalInvitations: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
    expiredCount: number;
    acceptanceRate: number;
    latestInvitation?: string;
    latestResponse?: string;
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

// API Response interface for getAllTours
export interface GetAllToursResponse {
    statusCode: number;
    message: string;
    data: PendingTour[];
    totalCount: number;
    statistics: {
        statusBreakdown: Record<string, number>;
        recentActivity: {
            todayCreated: number;
            thisWeekCreated: number;
            thisMonthCreated: number;
        };
        filterApplied: {
            includeInactive: boolean;
            status: string | null;
            keyword: string | null;
        };
    };
    availableStatuses: string[];
    queryInfo: {
        executedAt: string;
        totalRecordsBeforeFilter: number;
        totalRecordsAfterFilter: number;
        filtersApplied: string[];
    };
}

// Helper functions for enum mappings

// Helper function to get tour details status text
export const getTourDetailsStatusText = (
    status: TourDetailsStatus | number | string
): string => {
    // Handle string status from API
    if (typeof status === "string") {
        switch (status) {
            case "Pending":
                return "Chờ duyệt";
            case "Approved":
                return "Đã được duyệt";
            case "Rejected":
                return "Bị từ chối";
            case "Suspended":
                return "Tạm ngưng";
            case "AwaitingGuideAssignment":
                return "Chờ phân công hướng dẫn viên";
            case "Cancelled":
                return "Đã hủy";
            case "AwaitingAdminApproval":
                return "Chờ admin duyệt";
            case "WaitToPublic":
                return "Chờ mở bán vé";
            case "Public":
                return "Đã được public, khách hàng có thể booking";
            default:
                return status || "Không xác định";
        }
    }

    // Handle enum/number status
    const statusValue = typeof status === "number" ? status : status;
    switch (statusValue) {
        case TourDetailsStatus.Pending:
            return "Chờ duyệt";
        case TourDetailsStatus.Approved:
            return "Đã được duyệt";
        case TourDetailsStatus.Rejected:
            return "Bị từ chối";
        case TourDetailsStatus.Suspended:
            return "Tạm ngưng";
        case TourDetailsStatus.AwaitingGuideAssignment:
            return "Chờ phân công hướng dẫn viên";
        case TourDetailsStatus.Cancelled:
            return "Đã hủy";
        case TourDetailsStatus.AwaitingAdminApproval:
            return "Chờ admin duyệt";
        case TourDetailsStatus.WaitToPublic:
            return "Chờ mở bán vé";
        case TourDetailsStatus.Public:
            return "Đã được public, khách hàng có thể booking";
        default:
            return "Không xác định";
    }
};

// Helper function to get tour details status color for UI
export const getTourDetailsStatusColor = (
    status: TourDetailsStatus | number | string
): string => {
    // Handle string status from API
    if (typeof status === "string") {
        switch (status) {
            case "Pending":
            case "AwaitingAdminApproval":
            case "WaitToPublic":
                return "orange";
            case "Approved":
            case "Public":
                return "green";
            case "Rejected":
            case "Cancelled":
                return "red";
            case "Suspended":
                return "volcano";
            case "AwaitingGuideAssignment":
                return "blue";
            default:
                return "default";
        }
    }

    // Handle enum/number status
    const statusValue = typeof status === "number" ? status : status;
    switch (statusValue) {
        case TourDetailsStatus.Pending:
        case TourDetailsStatus.AwaitingAdminApproval:
        case TourDetailsStatus.WaitToPublic:
            return "orange";
        case TourDetailsStatus.Approved:
        case TourDetailsStatus.Public:
            return "green";
        case TourDetailsStatus.Rejected:
        case TourDetailsStatus.Cancelled:
            return "red";
        case TourDetailsStatus.Suspended:
            return "volcano";
        case TourDetailsStatus.AwaitingGuideAssignment:
            return "blue";
        default:
            return "default";
    }
};

// // Helper function to get invitation status text
// export const getInvitationStatusText = (status: InvitationStatus): string => {
//     switch (status) {
//         case InvitationStatus.Pending:
//             return 'Đang chờ phản hồi';
//         case InvitationStatus.Accepted:
//             return 'Đã chấp nhận';
//         case InvitationStatus.Rejected:
//             return 'Đã từ chối';
//         case InvitationStatus.Expired:
//             return 'Đã hết hạn';
//         default:
//             return 'Không xác định';
//     }
// };

// // Helper function to get invitation status color for UI
// export const getInvitationStatusColor = (status: InvitationStatus): string => {
//     switch (status) {
//         case InvitationStatus.Pending:
//             return 'orange';
//         case InvitationStatus.Accepted:
//             return 'green';
//         case InvitationStatus.Rejected:
//             return 'red';
//         case InvitationStatus.Expired:
//             return 'default';
//         default:
//             return 'default';
//     }
// };