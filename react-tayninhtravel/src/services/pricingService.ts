/**
 * Tour Pricing Service
 * Handles price calculation with early bird discount logic
 */

export interface PricingInfo {
    originalPrice: number;
    finalPrice: number;
    discountPercent: number;
    discountAmount: number;
    isEarlyBird: boolean;
    pricingType: 'Early Bird' | 'Last Minute';
    daysSinceCreated: number;
    daysUntilTour?: number;
}

export interface TourPricingData {
    price: number;
    createdAt: string;
    tourStartDate?: string;
}

/**
 * Constants for pricing logic (matching backend)
 */
const EARLY_BIRD_WINDOW_DAYS = 15; // 15 ngày đầu sau khi mở bán
const MINIMUM_DAYS_BEFORE_TOUR = 30; // Tour phải khởi hành sau ít nhất 30 ngày
const EARLY_BIRD_DISCOUNT_PERCENT = 25; // Giảm 25%

/**
 * Calculate tour pricing with early bird discount
 */
export const calculateTourPricing = (
    tourData: TourPricingData,
    numberOfGuests: number = 1,
    bookingDate: Date = new Date()
): PricingInfo => {
    const { price, createdAt, tourStartDate } = tourData;
    
    if (price <= 0) {
        throw new Error('Giá gốc phải lớn hơn 0');
    }

    const tourCreatedDate = new Date(createdAt);
    const daysSinceCreated = Math.floor(
        (bookingDate.getTime() - tourCreatedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let daysUntilTour: number | undefined;
    let isEarlyBirdEligible = false;

    // Check early bird eligibility
    if (tourStartDate) {
        const startDate = new Date(tourStartDate);
        daysUntilTour = Math.floor(
            (startDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Early bird conditions:
        // 1. Booking within 15 days of tour creation
        // 2. Tour starts at least 30 days from booking date
        isEarlyBirdEligible = 
            daysSinceCreated <= EARLY_BIRD_WINDOW_DAYS && 
            daysUntilTour >= MINIMUM_DAYS_BEFORE_TOUR;
    } else {
        // If no tour start date, only check creation window
        isEarlyBirdEligible = daysSinceCreated <= EARLY_BIRD_WINDOW_DAYS;
    }

    const originalPrice = price * numberOfGuests;
    let finalPrice = originalPrice;
    let discountPercent = 0;

    if (isEarlyBirdEligible) {
        discountPercent = EARLY_BIRD_DISCOUNT_PERCENT;
        const discountAmount = (originalPrice * discountPercent) / 100;
        finalPrice = originalPrice - discountAmount;
    }

    const discountAmount = originalPrice - finalPrice;

    return {
        originalPrice,
        finalPrice,
        discountPercent,
        discountAmount,
        isEarlyBird: isEarlyBirdEligible,
        pricingType: isEarlyBirdEligible ? 'Early Bird' : 'Last Minute',
        daysSinceCreated,
        daysUntilTour
    };
};

/**
 * Check if tour is eligible for early bird discount
 */
export const isEarlyBirdEligible = (
    tourCreatedAt: string,
    tourStartDate?: string,
    bookingDate: Date = new Date()
): boolean => {
    const tourCreatedDate = new Date(tourCreatedAt);
    const daysSinceCreated = Math.floor(
        (bookingDate.getTime() - tourCreatedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreated > EARLY_BIRD_WINDOW_DAYS) {
        return false;
    }

    if (tourStartDate) {
        const startDate = new Date(tourStartDate);
        const daysUntilTour = Math.floor(
            (startDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilTour >= MINIMUM_DAYS_BEFORE_TOUR;
    }

    return true; // If no start date, only check creation window
};

/**
 * Format price with Vietnamese currency
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

/**
 * Format price without currency symbol
 */
export const formatPriceNumber = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Get pricing display text
 */
export const getPricingDisplayText = (pricingInfo: PricingInfo): string => {
    if (pricingInfo.isEarlyBird) {
        return `Early Bird - Giảm ${pricingInfo.discountPercent}%`;
    }
    return 'Giá thường';
};

/**
 * Get remaining early bird days
 */
export const getRemainingEarlyBirdDays = (tourCreatedAt: string): number => {
    const tourCreatedDate = new Date(tourCreatedAt);
    const currentDate = new Date();
    const daysSinceCreated = Math.floor(
        (currentDate.getTime() - tourCreatedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return Math.max(0, EARLY_BIRD_WINDOW_DAYS - daysSinceCreated);
};

/**
 * Check if early bird period is ending soon (within 3 days)
 */
export const isEarlyBirdEndingSoon = (tourCreatedAt: string): boolean => {
    const remainingDays = getRemainingEarlyBirdDays(tourCreatedAt);
    return remainingDays > 0 && remainingDays <= 3;
};

export default {
    calculateTourPricing,
    isEarlyBirdEligible,
    formatPrice,
    formatPriceNumber,
    getPricingDisplayText,
    getRemainingEarlyBirdDays,
    isEarlyBirdEndingSoon
};
