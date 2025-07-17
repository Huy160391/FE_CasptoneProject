/**
 * Generic API response interface
 */
export interface ApiResponse<T = any> {
    success: boolean;
    statusCode?: number;
    message?: string;
    data?: T;
    errors?: string[];
}
