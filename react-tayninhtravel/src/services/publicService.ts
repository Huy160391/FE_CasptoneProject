import axiosInstance from '@/config/axios';
import { Blog as GlobalBlog } from '../types';

export interface BlogImage {
    id: string;
    url: string;
}

// Extend global Blog interface for specific API response
export interface Blog extends Omit<GlobalBlog, 'authorId' | 'author'> {
    authorName: string;
    imageUrl?: string[];
    totalLikes?: number;
    totalDislikes?: number;
    totalComments?: number;
}

export interface GetBlogsResponse {
    data: Blog[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

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
    }, async getBlogById(id: string): Promise<Blog | null> {
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
    }, async getRelatedBlogs(blogId: string, limit: number = 3): Promise<Blog[]> {
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
        } catch (error) {
            console.error('Error fetching related blogs:', error);
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
            const response = await axiosInstance.post<any>('Image/Upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // API trả về { urls: string[] }
            if (response.data?.urls && Array.isArray(response.data.urls) && response.data.urls.length > 0) {
                return response.data.urls[0];
            }
            return null;
        } catch (error) {
            console.error('Error uploading image:', error);
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
            const response = await axiosInstance.post<any>('Image/Upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data?.urls && Array.isArray(response.data.urls)) {
                return response.data.urls;
            }
            return [];
        } catch (error) {
            console.error('Error uploading images:', error);
            return [];
        }
    }
};

export default publicService;
