/**
 * Vietnam Timezone Utility
 * Handles all timezone operations for Vietnam (UTC+7)
 */

// Vietnam timezone offset (UTC+7)
export const VIETNAM_TIMEZONE_OFFSET = 7 * 60; // 7 hours in minutes
export const VIETNAM_TIMEZONE_NAME = 'Asia/Ho_Chi_Minh';

/**
 * Get current Vietnam time
 */
export const getVietnamNow = (): Date => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vietnamTime = new Date(utc + (VIETNAM_TIMEZONE_OFFSET * 60000));
    return vietnamTime;
};

/**
 * Convert any date to Vietnam timezone
 */
export const toVietnamTime = (date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // If the date is already in Vietnam timezone, return as is
    if (dateObj.getTimezoneOffset() === -VIETNAM_TIMEZONE_OFFSET) {
        return dateObj;
    }
    
    // Convert to Vietnam time
    const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
    const vietnamTime = new Date(utc + (VIETNAM_TIMEZONE_OFFSET * 60000));
    return vietnamTime;
};

/**
 * Convert Vietnam time to UTC
 */
export const vietnamTimeToUtc = (vietnamDate: Date): Date => {
    const utc = vietnamDate.getTime() - (VIETNAM_TIMEZONE_OFFSET * 60000);
    return new Date(utc);
};

/**
 * Format date in Vietnam timezone
 */
export const formatVietnamDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: VIETNAM_TIMEZONE_NAME,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options
    };
    
    return vietnamTime.toLocaleDateString('vi-VN', defaultOptions);
};

/**
 * Format datetime in Vietnam timezone
 */
export const formatVietnamDateTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: VIETNAM_TIMEZONE_NAME,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        ...options
    };
    
    return vietnamTime.toLocaleString('vi-VN', defaultOptions);
};

/**
 * Format time in Vietnam timezone
 */
export const formatVietnamTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: VIETNAM_TIMEZONE_NAME,
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };
    
    return vietnamTime.toLocaleTimeString('vi-VN', defaultOptions);
};

/**
 * Parse date string in Vietnam timezone
 */
export const parseVietnamDate = (dateString: string): Date => {
    // Try to parse the date string
    const parsed = new Date(dateString);
    
    if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid date string: ${dateString}`);
    }
    
    return toVietnamTime(parsed);
};

/**
 * Get start of day in Vietnam timezone
 */
export const getVietnamStartOfDay = (date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    
    return new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate(), 0, 0, 0, 0);
};

/**
 * Get end of day in Vietnam timezone
 */
export const getVietnamEndOfDay = (date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    
    return new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate(), 23, 59, 59, 999);
};

/**
 * Check if date is in the past (Vietnam time)
 */
export const isInPastVietnam = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    const now = getVietnamNow();
    
    return vietnamTime < now;
};

/**
 * Get difference in days between two dates (Vietnam time)
 */
export const getDaysDifferenceVietnam = (fromDate: Date | string, toDate: Date | string): number => {
    const fromVietnam = toVietnamTime(typeof fromDate === 'string' ? new Date(fromDate) : fromDate);
    const toVietnam = toVietnamTime(typeof toDate === 'string' ? new Date(toDate) : toDate);
    
    const diffTime = toVietnam.getTime() - fromVietnam.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Convert date to ISO string in Vietnam timezone
 */
export const toVietnamISOString = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    
    // Format as ISO string with Vietnam timezone offset
    const year = vietnamTime.getFullYear();
    const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
    const day = String(vietnamTime.getDate()).padStart(2, '0');
    const hours = String(vietnamTime.getHours()).padStart(2, '0');
    const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
    const seconds = String(vietnamTime.getSeconds()).padStart(2, '0');
    const milliseconds = String(vietnamTime.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+07:00`;
};

/**
 * Create a date in Vietnam timezone
 */
export const createVietnamDate = (year: number, month: number, day: number, hour: number = 0, minute: number = 0, second: number = 0): Date => {
    // Create date in Vietnam timezone
    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1); // Month is 0-indexed
    date.setDate(day);
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(second);
    date.setMilliseconds(0);
    
    return toVietnamTime(date);
};

/**
 * Get Vietnam timezone offset string
 */
export const getVietnamTimezoneOffset = (): string => {
    return '+07:00';
};

/**
 * Check if two dates are the same day in Vietnam timezone
 */
export const isSameDayVietnam = (date1: Date | string, date2: Date | string): boolean => {
    const vietnam1 = toVietnamTime(typeof date1 === 'string' ? new Date(date1) : date1);
    const vietnam2 = toVietnamTime(typeof date2 === 'string' ? new Date(date2) : date2);
    
    return vietnam1.getFullYear() === vietnam2.getFullYear() &&
           vietnam1.getMonth() === vietnam2.getMonth() &&
           vietnam1.getDate() === vietnam2.getDate();
};

/**
 * Add days to a date in Vietnam timezone
 */
export const addDaysVietnam = (date: Date | string, days: number): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const vietnamTime = toVietnamTime(dateObj);
    
    const result = new Date(vietnamTime);
    result.setDate(result.getDate() + days);
    
    return result;
};

/**
 * Subtract days from a date in Vietnam timezone
 */
export const subtractDaysVietnam = (date: Date | string, days: number): Date => {
    return addDaysVietnam(date, -days);
};
