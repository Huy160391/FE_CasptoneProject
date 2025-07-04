/**
 * Product Category Utilities
 * 
 * This module handles the mapping between product category strings and numbers.
 * The API expects numeric categories when creating/updating products:
 * 
 * API Category Mapping:
 * - 0 = Food
 * - 1 = Souvenir  
 * - 2 = Jewelry
 * - 3 = Clothing
 * 
 * Usage Examples:
 * 
 * // When creating a product, convert string to number:
 * const categoryNumber = getCategoryNumber('Food'); // returns 0
 * 
 * // When displaying products, convert number to string:
 * const categoryString = getCategoryString(0); // returns 'Food'
 * 
 * // For form options:
 * const options = getCategoryOptions(); // returns [{label: 'Food', value: '0'}, ...]
 */

import { ProductCategory, CATEGORY_STRING_TO_NUMBER, CATEGORY_NUMBER_TO_STRING } from '@/config/constants'

/**
 * Convert category string to number for API
 */
export const getCategoryNumber = (categoryString: string): number => {
    return CATEGORY_STRING_TO_NUMBER[categoryString] ?? -1
}

/**
 * Convert category number to string for display
 */
export const getCategoryString = (categoryNumber: number): string => {
    return CATEGORY_NUMBER_TO_STRING[categoryNumber] ?? 'Unknown'
}

/**
 * Get all available categories as options for forms
 */
export const getCategoryOptions = () => {
    return Object.entries(CATEGORY_STRING_TO_NUMBER).map(([label, value]) => ({
        label,
        value: value.toString()
    }))
}

/**
 * Validate if category is valid
 */
export const isValidCategory = (category: string | number): boolean => {
    if (typeof category === 'string') {
        return category in CATEGORY_STRING_TO_NUMBER
    }
    return category in CATEGORY_NUMBER_TO_STRING
}

/**
 * Get category enum values
 */
export const getCategoryEnumValues = () => {
    return Object.values(ProductCategory).filter(value => typeof value === 'number') as number[]
}
