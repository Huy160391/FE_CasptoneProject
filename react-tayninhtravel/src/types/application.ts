// Tour Guide Application Type
export interface TourGuideApplication {
    id: string;
    fullName: string;
    phoneNumber: string;
    experience: string;
    status: string; // "Pending" | "Approved" | "Rejected"
    submittedAt: string;
    userName: string;
    userEmail: string;
    skills: string[]; // List of enum names, e.g. ["Vietnamese", "English", ...]
    skillsString: string; // Comma-separated string, e.g. "Vietnamese,English,History"
    curriculumVitaeUrl?: string; // Optional: URL to CV file
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

// Tour Guide Application Status Enum (for string values)
export enum TourGuideApplicationStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected"
}

// Shop Type Enum
export enum ShopType {
    SOUVENIR = 'souvenir',
    LOCAL_SPECIALTIES = 'localSpecialties',
    INSTANT_FOOD = 'instantFood'
}

// Tour Guide Application Form Data (for submission)
export interface TourGuideApplicationForm {
    fullName: string;
    phoneNumber: string;
    email: string;
    experience: string;
    skills: string[]; // List of skill enum names, e.g. ["Vietnamese", "English", ...]
    skillsString: string; // Comma-separated string of enum names
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

// Helper functions for TourGuideApplication status
export const getTourGuideApplicationStatusText = (status: string): string => {
    switch (status) {
        case TourGuideApplicationStatus.PENDING:
            return 'Chờ duyệt';
        case TourGuideApplicationStatus.APPROVED:
            return 'Đã duyệt';
        case TourGuideApplicationStatus.REJECTED:
            return 'Đã từ chối';
        default:
            return status || 'Không xác định';
    }
};

export const getTourGuideApplicationStatusColor = (status: string): string => {
    switch (status) {
        case TourGuideApplicationStatus.PENDING:
            return 'gold';
        case TourGuideApplicationStatus.APPROVED:
            return 'green';
        case TourGuideApplicationStatus.REJECTED:
            return 'red';
        default:
            return 'default';
    }
};