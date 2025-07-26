// Global Types for Tay Ninh Travel Project

// Tour Company Management Types

export interface Booking {
    id: string;
    tourId: string;
    tour?: Tour;
    userId: string;
    user?: User;
    customerInfo: CustomerInfo;
    bookingDate: string;
    tourDate: string;
    numberOfPeople: number;
    totalPrice: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    specialRequests?: string;
    paymentMethod?: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address?: string;
    emergencyContact?: string;
    dietaryRequirements?: string;
}

export interface Product {
    id: string;
    shopId: string;
    name: string;
    description: string | null;
    price: number;
    quantityInStock: number;
    imageUrl: string[];
    category: string;
    isSale?: boolean;
    soldCount: number;
    salePercent?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    cartItemId: string;
    productId: string;
    product?: Product;
    name: string;
    image: string;
    quantity: number;
    price: number;
    selectedOptions?: Record<string, any>;
}

export interface Cart {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    discountAmount?: number;
    couponCode?: string;
}

// Admin-specific blog interface
export interface AdminBlogPost {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    featuredImage?: string;
    imageUrl?: string[];
    status: 0 | 1 | 2; // 0=pending, 1=published, 2=rejected
    views: number;
    likes: number;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
    commentOfAdmin?: string;
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    author?: User;
    entityType: 'tour' | 'blog' | 'product';
    entityId: string;
    parentId?: string;
    replies?: Comment[];
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    rating: number;
    comment?: string;
    userId: string;
    user?: User;
    entityType: 'tour' | 'product';
    entityId: string;
    isVerified: boolean;
    isApproved: boolean;
    helpful: number;
    createdAt: string;
    updatedAt: string;
}

export interface ThingToDo {
    id: string;
    title: string;
    description: string;
    shortDescription?: string;
    location: string;
    category: string;
    images: string[];
    thumbnail?: string;
    price?: number;
    duration?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    rating: number;
    reviewCount: number;
    tags?: string[];
    isActive: boolean;
    featured?: boolean;
    openingHours?: string;
    contactInfo?: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
}

// API Response Types cho Services
export interface GetBlogsResponse {
    data: Blog[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

export interface GetProductsResponse {
    data: Product[];
    totalRecord: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}

export interface GetProductsParams {
    pageIndex?: number;
    pageSize?: number;
    textSearch?: string;
    status?: boolean;
}

// Extend global Blog interface for specific API response
export interface PublicBlog extends Omit<Blog, 'authorId' | 'author'> {
    authorName: string;
    imageUrl?: string[];
    totalLikes?: number;
    totalDislikes?: number;
    totalComments?: number;
}

export interface BlogImage {
    id: string;
    url: string;
}

export interface CV {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    experience: string;
    education: string;
    skills: string[];
    portfolio?: string;
    resume?: string;
    coverLetter?: string;
    status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// API Response Types - Unified to use 'success' property only
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
    pagination?: PaginationInfo;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    category?: string;
    status?: string;
    featured?: boolean;
}

// Form Types
export interface ContactForm {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export interface LoginForm {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    phoneNumber?: string;
    avatar?: string;
    agreeToTerms: boolean;
}

export interface ResetPasswordForm {
    email: string;
}

export interface ChangePasswordForm {
    currentPassword: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Theme and UI Types
export type Theme = 'light' | 'dark';
export type Language = 'vi' | 'en';

export interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
}

export interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

// Error Types
export interface ApiError {
    message: string;
    code?: string;
    field?: string;
    details?: any;
}

export interface ValidationError {
    field: string;
    message: string;
}

// Withdrawal System Types
export interface BankAccount {
    id: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateBankAccountRequest {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isDefault?: boolean;
}

export interface UpdateBankAccountRequest {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    isDefault?: boolean;
}

export enum WithdrawalStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Cancelled = 3
}

export interface WithdrawalRequest {
    id: string;
    userId: string;
    bankAccountId: string;
    bankAccount: {
        id: string;
        bankName: string;
        maskedAccountNumber: string;
        accountHolderName: string;
    };
    amount: number;
    withdrawalFee: number;
    netAmount: number;
    status: WithdrawalStatus;
    statusName: string;
    requestedAt: string;
    processedAt?: string | null;
    processedByName?: string | null;
    userNotes?: string | null;
    adminNotes?: string | null;
    transactionReference?: string | null;
    canCancel: boolean;
    walletBalanceAtRequest: number;
}

export interface CreateWithdrawalRequestRequest {
    amount: number;
    bankAccountId: string;
}

export interface ProcessWithdrawalRequest {
    adminNotes?: string;
}

export interface WithdrawalRequestListParams {
    pageIndex?: number;
    pageSize?: number;
    status?: WithdrawalStatus;
    userId?: string;
    fromDate?: string;
    toDate?: string;
}

export interface BankAccountFormData {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isDefault: boolean;
}

export interface WithdrawalFormData {
    amount: number;
    bankAccountId: string;
}

// Filter Types
export interface TourFilters {
    category?: string;
    priceRange?: [number, number];
    duration?: string;
    difficulty?: string;
    rating?: number;
    location?: string;
    featured?: boolean;
}

export interface ProductFilters {
    category?: string;
    priceRange?: [number, number];
    inStock?: boolean;
    rating?: number;
    featured?: boolean;
}

export interface BlogFilters {
    category?: string;
    author?: string;
    tags?: string[];
    status?: string;
    featured?: boolean;
}

// Hook State Types
export interface UseBlogsState<T = Blog> {
    blogs: T[];
    loading: boolean;
    error: string | null;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

// Event Types
export interface NotificationEvent {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingState {
    status: Status;
    error?: string | null;
}

export type EntityId = string | number;

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

// Auth Types
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

export interface DecodedToken {
    [key: string]: any;
    exp?: number;
    iat?: number;
    userId?: string;
    email?: string;
    role?: string;
}

// Đã di chuyển các type liên quan tour sang ./tour
// Đã tách các interface/type liên quan user, blog, comment, support sang các file riêng
// Xoá các interface/type trùng lặp ở đây (User, UserServiceUser, UserBlog, UserComment, UserSupportTicket, ApiUser, ...)
// Giữ lại các type liên quan đến tour, product, booking, ...

import type { User } from './user';
import type { Blog } from './blog';
import type { Tour } from './tour';

export * from './user';
export * from './blog';
export * from './comment';
export * from './support'; // Đảm bảo export AdminSupportTicket từ support.ts
export * from './tour';
export * from './application'; // Export application types including TourGuideApplication

// Export tour template specific types
export type {
    TourTemplate,
    TourDetails,
    TourSlot,
    TimelineItem,
    TourOperation,
    TourGuide,
    Guide,
    SpecialtyShop,
    CreateTourTemplateRequest,
    UpdateTourTemplateRequest,
    CreateTourDetailsRequest,
    CreateTimelineItemRequest,
    CreateTimelineItemsRequest,
    TourTemplateType,
    ScheduleDay,
    TourSlotStatus,
    TourDetailsStatus,
    TourOperationStatus,
    GetTourTemplatesParams,
    GetTourTemplatesResponse,
    GetTourDetailsListParams,
    GetTourDetailsListResponse
} from './tour';
