// API URLs
const DEVELOPMENT_API_URL = 'http://localhost:5267/api';

// Automatically use appropriate URL based on environment
// For now, force local development API
export const API_BASE_URL = DEVELOPMENT_API_URL;
// TODO: Uncomment when ready for production
// const isDevelopment = import.meta.env.DEV;
// const PRODUCTION_API_URL = 'https://api.tayninhour.com';
// export const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// Social Media URLs
export const FACEBOOK_URL = 'https://facebook.com/your-page'
export const INSTAGRAM_URL = 'https://instagram.com/your-page'
export const TWITTER_URL = 'https://twitter.com/your-page'

// Contact Information
export const CONTACT_EMAIL = 'contact@example.com'
export const CONTACT_PHONE = '+84 123 456 789'
export const CONTACT_ADDRESS = '123 Street Name, City, Country'

// Other Constants
export const APP_NAME = 'Tay Ninh Travel'
export const DEFAULT_LANGUAGE = 'vi'
export const SUPPORTED_LANGUAGES = ['vi', 'en']

// Product Categories
export enum ProductCategory {
    Food = 0,
    Souvenir = 1,
    Jewelry = 2,
    Clothing = 3
}

// Category mapping for display
export const CATEGORY_LABELS = {
    [ProductCategory.Food]: 'Food',
    [ProductCategory.Souvenir]: 'Souvenir',
    [ProductCategory.Jewelry]: 'Jewelry',
    [ProductCategory.Clothing]: 'Clothing'
}

// Category mapping from string to number
export const CATEGORY_STRING_TO_NUMBER: { [key: string]: number } = {
    'Food': ProductCategory.Food,
    'Souvenir': ProductCategory.Souvenir,
    'Jewelry': ProductCategory.Jewelry,
    'Clothing': ProductCategory.Clothing
}

// Category mapping from number to string
export const CATEGORY_NUMBER_TO_STRING: { [key: number]: string } = {
    [ProductCategory.Food]: 'Food',
    [ProductCategory.Souvenir]: 'Souvenir',
    [ProductCategory.Jewelry]: 'Jewelry',
    [ProductCategory.Clothing]: 'Clothing'
}
