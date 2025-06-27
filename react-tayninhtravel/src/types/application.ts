// Tour Guide Application Type
export interface TourGuideApplication {
    id: string;
    fullName: string;
    phoneNumber: string;
    experience: string;
    status: number;
    submittedAt: string;
    userName: string;
    userEmail: string;
}

// Shop Application Type  
export interface ShopApplication {
    id: string;
    shopName: string;
    location: string;
    shopType: string;
    status: number;
    submittedAt: string;
    processedAt: string | null;
    userName: string;
    userEmail: string;
    representativeName: string;
    phoneNumber: string;
}

// Admin Shop Registration Type (for admin panel with full details)
export interface AdminShopRegistration {
    id: string;
    shopName: string;
    location: string;
    shopType: string;
    representativeName: string;
    phoneNumber: string;
    userEmail: string;
    userName: string;
    status: number;
    submittedAt: string;
    processedAt: string | null;
    reason?: string;
    website?: string;
    shopDescription?: string;
    openingHour?: string;
    closingHour?: string;
    logo?: string;
    businessLicense?: string;
    businessCode?: string;
}

// Application Status Enum
export enum ApplicationStatus {
    PENDING = 0,
    APPROVED = 1,
    REJECTED = 2
}

// Shop Type Enum
export enum ShopType {
    SOUVENIR = 'souvenir',
    LOCAL_SPECIALTIES = 'localSpecialties',
    INSTANT_FOOD = 'instantFood'
}

// Tour Guide Application Form Data (for submission)
export interface TourGuideApplicationForm {
    email: string;
    curriculumVitae: File;
}

// Shop Application Form Data (for submission)
export interface ShopApplicationForm {
    shopName: string;
    representativeName: string;
    representativeNameOnPaper?: string;
    phone: string;
    email: string;
    website?: string;
    shopType: string;
    location: string;
    shopDescription?: string;
    openingHour?: string;
    closingHour?: string;
    logo?: File;
    businessLicense: File;
    businessCode: string;
}