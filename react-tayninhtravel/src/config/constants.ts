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