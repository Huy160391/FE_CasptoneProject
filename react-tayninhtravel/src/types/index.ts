// Global Types for Tay Ninh Travel Project
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'Admin' | 'Blogger';
    avatar?: string;
    address?: string;
    isVerified?: boolean;
    createdAt: string;
    updatedAt: string;
}

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
    id: string | number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    images: string[];
    thumbnail?: string;
    inStock: boolean;
    stockQuantity?: number;
    weight?: number;
    dimensions?: string;
    rating: number;
    reviewCount: number;
    tags?: string[];
    isActive: boolean;
    featured?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    id: string | number;
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

export interface Blog {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    authorId: string;
    author?: User;
    category: string;
    tags: string[];
    images: string[];
    thumbnail?: string;
    status: 'draft' | 'published' | 'archived';
    viewCount: number;
    isFeature: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
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

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    category: 'booking' | 'payment' | 'technical' | 'general';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    userId: string;
    user?: User;
    assignedTo?: string;
    assignedUser?: User;
    responses?: TicketResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface TicketResponse {
    id: string;
    content: string;
    userId: string;
    user?: User;
    isStaff: boolean;
    attachments?: string[];
    createdAt: string;
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

// API Response Types
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
