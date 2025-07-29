/**
 * API Helper utilities for handling timezone and data transformation
 */

import { toVietnamTime, toVietnamISOString, getVietnamNow } from './vietnamTimezone';

/**
 * Transform request data to handle Vietnam timezone
 */
export const transformRequestData = (data: any): any => {
    if (!data) return data;

    if (data instanceof Date) {
        return toVietnamISOString(data);
    }

    if (Array.isArray(data)) {
        return data.map(transformRequestData);
    }

    if (typeof data === 'object') {
        const transformed: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (value instanceof Date) {
                transformed[key] = toVietnamISOString(value);
            } else if (typeof value === 'string' && isDateString(value)) {
                // Convert date strings to Vietnam timezone
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    transformed[key] = toVietnamISOString(date);
                } else {
                    transformed[key] = value;
                }
            } else if (typeof value === 'object' && value !== null) {
                transformed[key] = transformRequestData(value);
            } else {
                transformed[key] = value;
            }
        }
        return transformed;
    }

    return data;
};

/**
 * Transform response data to handle Vietnam timezone
 */
export const transformResponseData = (data: any): any => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(transformResponseData);
    }

    if (typeof data === 'object') {
        const transformed: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' && isDateString(value)) {
                // Convert date strings to Vietnam timezone Date objects
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    transformed[key] = toVietnamTime(date);
                } else {
                    transformed[key] = value;
                }
            } else if (typeof value === 'object' && value !== null) {
                transformed[key] = transformResponseData(value);
            } else {
                transformed[key] = value;
            }
        }
        return transformed;
    }

    return data;
};

/**
 * Check if a string is a date string
 */
const isDateString = (value: string): boolean => {
    // Check for ISO date format or common date patterns
    const datePatterns = [
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+07:00$/, // Vietnam timezone format
        /^\d{4}-\d{2}-\d{2}$/, // Date only
        /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
        /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    ];

    return datePatterns.some(pattern => pattern.test(value)) && !isNaN(Date.parse(value));
};

/**
 * Format date for API requests (Vietnam timezone)
 */
export const formatDateForAPI = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return toVietnamISOString(dateObj);
};

/**
 * Parse date from API response (Vietnam timezone)
 */
export const parseDateFromAPI = (dateString: string): Date => {
    const date = new Date(dateString);
    return toVietnamTime(date);
};

/**
 * Get current Vietnam time for API requests
 */
export const getCurrentVietnamTimeForAPI = (): string => {
    return toVietnamISOString(getVietnamNow());
};

/**
 * Transform booking data for API request
 */
export const transformBookingDataForAPI = (bookingData: any) => {
    const transformed = { ...bookingData };

    // Transform date fields specifically for booking
    if (transformed.bookingDate) {
        transformed.bookingDate = formatDateForAPI(transformed.bookingDate);
    }

    if (transformed.tourDate) {
        transformed.tourDate = formatDateForAPI(transformed.tourDate);
    }

    if (transformed.createdAt) {
        transformed.createdAt = formatDateForAPI(transformed.createdAt);
    }

    if (transformed.updatedAt) {
        transformed.updatedAt = formatDateForAPI(transformed.updatedAt);
    }

    return transformed;
};

/**
 * Transform tour data for API request
 */
export const transformTourDataForAPI = (tourData: any) => {
    const transformed = { ...tourData };

    // Transform date fields specifically for tours
    if (transformed.startDate) {
        transformed.startDate = formatDateForAPI(transformed.startDate);
    }

    if (transformed.endDate) {
        transformed.endDate = formatDateForAPI(transformed.endDate);
    }

    if (transformed.tourStartDate) {
        transformed.tourStartDate = formatDateForAPI(transformed.tourStartDate);
    }

    if (transformed.createdAt) {
        transformed.createdAt = formatDateForAPI(transformed.createdAt);
    }

    if (transformed.updatedAt) {
        transformed.updatedAt = formatDateForAPI(transformed.updatedAt);
    }

    // Transform timeline items if present
    if (transformed.timelineItems && Array.isArray(transformed.timelineItems)) {
        transformed.timelineItems = transformed.timelineItems.map((item: any) => ({
            ...item,
            createdAt: item.createdAt ? formatDateForAPI(item.createdAt) : undefined,
            updatedAt: item.updatedAt ? formatDateForAPI(item.updatedAt) : undefined,
        }));
    }

    return transformed;
};

/**
 * Transform schedule data for API request
 */
export const transformScheduleDataForAPI = (scheduleData: any) => {
    const transformed = { ...scheduleData };

    // Transform date fields specifically for schedules
    if (transformed.tourDate) {
        transformed.tourDate = formatDateForAPI(transformed.tourDate);
    }

    if (transformed.startDate) {
        transformed.startDate = formatDateForAPI(transformed.startDate);
    }

    if (transformed.endDate) {
        transformed.endDate = formatDateForAPI(transformed.endDate);
    }

    return transformed;
};

/**
 * Create axios request interceptor for timezone handling
 */
export const createTimezoneRequestInterceptor = () => {
    return (config: any) => {
        // Transform request data to handle Vietnam timezone
        // Skip transformation for FormData (file uploads)
        if (config.data && !(config.data instanceof FormData)) {
            config.data = transformRequestData(config.data);
        }

        // Add timezone header
        config.headers = {
            ...config.headers,
            'X-Timezone': 'Asia/Ho_Chi_Minh',
            'X-Timezone-Offset': '+07:00'
        };

        return config;
    };
};

/**
 * Create axios response interceptor for timezone handling
 */
export const createTimezoneResponseInterceptor = () => {
    return (response: any) => {
        // Transform response data to handle Vietnam timezone
        if (response.data) {
            response.data = transformResponseData(response.data);
        }

        return response;
    };
};
