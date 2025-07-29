/**
 * Utility functions for formatting data
 */

import { formatVietnamDate, formatVietnamDateTime, toVietnamTime } from './vietnamTimezone';

/**
 * Format currency in Vietnamese format
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Format date to Vietnamese format in Vietnam timezone
 */
export const formatDate = (date: string | Date): string => {
    return formatVietnamDate(date, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Format datetime to Vietnamese format in Vietnam timezone
 */
export const formatDateTime = (date: string | Date): string => {
    return formatVietnamDateTime(date, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as Vietnamese phone number
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    } else if (cleaned.length === 11) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    return phone; // Return original if doesn't match expected format
};
