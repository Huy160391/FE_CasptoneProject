import axiosInstance from '@/config/axios';

import {
    Product,
    GetBlogsResponse,
    GetProductsResponse,
    GetProductsParams,
    PublicBlog
} from '../types';

export const publicService = {
    async getPublicBlogs(
        page: number = 0,
        pageSize: number = 10,
        searchText?: string,
        limit?: number
    ): Promise<GetBlogsResponse> {
        try {
            const params: any = {
                pageIndex: page,
                pageSize
            };

            if (searchText) {
                params.search = searchText;
            }

            if (limit) {
                params.limit = limit;
            }

            const response = await axiosInstance.get<any>('Blogger/Blog-User', { params });

            // Map API response to our Blog interface format
            const blogs = (response.data.data || []).map((item: any) => {
                return {
                    ...item,
                    // Add any fields needed for compatibility with UI
                };
            });

            return {
                data: blogs,
                totalRecords: response.data.totalRecord || 0,
                currentPage: response.data.page || page,
                pageSize: response.data.pageSize || pageSize
            };
        } catch (error) {
            console.error('Error fetching public blogs:', error);
            return {
                data: [],
                totalRecords: 0,
                currentPage: page,
                pageSize
            };
        }
    }, async getBlogById(id: string): Promise<PublicBlog | null> {
        try {
            const response = await axiosInstance.get<any>(`Blogger/blog/${id}`);

            // Check if the response contains the expected data format
            let blogData: any = null;

            if (response.data && response.data.data) {
                blogData = response.data.data;
            } else {
                blogData = response.data;
            }

            if (blogData) {
                return blogData;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching blog with ID ${id}:`, error);
            return null;
        }
    }, async getRelatedBlogs(blogId: string, limit: number = 3): Promise<PublicBlog[]> {
        try {
            const response = await axiosInstance.get<any>(`Blogger/Blog-User/${blogId}/related`, {
                params: { limit }
            });

            let relatedBlogs: any[] = [];

            if (response.data && Array.isArray(response.data)) {
                relatedBlogs = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                relatedBlogs = response.data.data;
            }

            return relatedBlogs;
        } catch (error: any) {
        // Error already shown by axios interceptor
        console.error('Service error:', error);
        return [];
    }
    },
    /**
     * Upload image file to server, return url string
     * Sử dụng đúng tên trường 'files' theo yêu cầu backend
     */
    async uploadImage(file: File): Promise<string | null> {
        try {
            const formData = new FormData();
            formData.append('files', file); // Đúng tên trường
            const response = await axiosInstance.post<any>('Image/Upload', formData);
            
            // API trả về { urls: string[] }
            if (response.data?.urls && Array.isArray(response.data.urls) && response.data.urls.length > 0) {
                return response.data.urls[0];
            }
            return null;
        } catch (error: any) {
        // Error already shown by axios interceptor
        console.error('Service error:', error);
        return null;
    }
    },
    /**
     * Upload nhiều file ảnh, trả về mảng url string
     */
    async uploadImages(files: File[]): Promise<string[]> {
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            const response = await axiosInstance.post<any>('Image/Upload', formData);
            if (response.data?.urls && Array.isArray(response.data.urls)) {
                return response.data.urls;
            }
            return [];
        } catch (error: any) {
        // Error already shown by axios interceptor
        console.error('Service error:', error);
        return [];
    }
    },
    async getPublicProducts(
        params: GetProductsParams = {}
    ): Promise<GetProductsResponse> {
        try {
            const {
                pageIndex,
                pageSize,
                textSearch,
                status
            } = params;

            const queryParams: any = {};

            // Chỉ thêm các param khi có giá trị
            if (pageIndex !== undefined) queryParams.pageIndex = pageIndex;
            if (pageSize !== undefined) queryParams.pageSize = pageSize;
            if (textSearch) queryParams.textSearch = textSearch;
            if (status !== undefined) queryParams.status = status;

            const response = await axiosInstance.get<any>('Product/Product', { params: queryParams });

            return {
                data: response.data.data || [],
                totalRecord: response.data.totalRecord || 0,
                pageIndex: response.data.pageIndex || pageIndex || 1,
                pageSize: response.data.pageSize || pageSize || 10,
                totalPages: response.data.totalPages || 0
            };
        } catch (error) {
            console.error('Error fetching public products:', error);
            return {
                data: [],
                totalRecord: 0,
                pageIndex: params.pageIndex || 1,
                pageSize: params.pageSize || 10,
                totalPages: 0
            };
        }
    },

    async getPublicProductById(id: string): Promise<Product | null> {
        try {
            const response = await axiosInstance.get<any>(`Product/Product/${id}`);

            if (response.data && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error(`Error fetching product with ID ${id}:`, error);
            return null;
        }
    },

    /**
     * Lấy danh sách review của product
     */
    async getProductReviews(productId: string): Promise<any[]> {
        try {
            const response = await axiosInstance.get<any>(`Product/${productId}/reviews-ratings`);
            // API trả về mảng review
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error(`Error fetching reviews for product ${productId}:`, error);
            return [];
        }
    },

    /**
     * Gửi review cho product
     */
    async submitProductReview(productId: string, reviewData: { rating: number; review: string; }): Promise<any> {
        try {
            const body = {
                productId,
                rating: reviewData.rating,
                review: reviewData.review
            };
            const response = await axiosInstance.post<any>(`Product/reviews-ratings`, body);
            return response.data;
        } catch (error) {
            console.error(`Error submitting review for product ${productId}:`, error);
            throw error;
        }
    },
};

export default publicService;

