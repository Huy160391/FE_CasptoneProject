/**
 * Utility functions for handling tour images
 */

/**
 * Get default image based on tour template name
 * @param templateName - The tour template name
 * @returns Default image path
 */
export const getDefaultTourImage = (templateName: string): string => {
    if (!templateName) {
        return '/images/tours/default-tour.jpg';
    }

    const lowerTemplateName = templateName.toLowerCase();
    
    if (lowerTemplateName.includes('núi bà đen')) {
        return '/images/tours/nui-ba-den.jpg';
    }
    
    if (lowerTemplateName.includes('cao đài')) {
        return '/images/tours/toa-thanh-cao-dai.jpg';
    }
    
    if (lowerTemplateName.includes('suối đá')) {
        return '/images/tours/suoi-da.jpg';
    }
    
    if (lowerTemplateName.includes('sinh thái')) {
        return '/images/tours/sinh-thai.jpg';
    }
    
    if (lowerTemplateName.includes('lịch sử')) {
        return '/images/tours/lich-su.jpg';
    }
    
    return '/images/tours/default-tour.jpg';
};

/**
 * Get tour image with fallback to default
 * @param imageUrl - The tour image URL
 * @param templateName - The tour template name for fallback
 * @returns Image URL or default image path
 */
export const getTourImageWithFallback = (imageUrl?: string | null, templateName?: string): string => {
    return imageUrl || getDefaultTourImage(templateName || '');
};

/**
 * Check if image URL is valid
 * @param imageUrl - The image URL to check
 * @returns True if URL is valid, false otherwise
 */
export const isValidImageUrl = (imageUrl?: string | null): boolean => {
    if (!imageUrl) return false;
    
    try {
        new URL(imageUrl);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get image alt text for tour
 * @param tourTitle - The tour title
 * @param templateName - The tour template name
 * @returns Alt text for the image
 */
export const getTourImageAltText = (tourTitle?: string, templateName?: string): string => {
    if (tourTitle) {
        return `Hình ảnh tour: ${tourTitle}`;
    }
    
    if (templateName) {
        return `Hình ảnh tour: ${templateName}`;
    }
    
    return 'Hình ảnh tour du lịch Tây Ninh';
};
