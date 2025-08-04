import axiosInstance from '@/config/axios';
import { BlogPost, ApiBlogPost, ApiGetBlogsResponse, GetBlogsParams, GetBloggerBlogsResponse, CreateBlogPayload, UpdateBlogPayload } from '@/types/blog';

/**
 * Service handling blogger-specific API operations
 */
export const bloggerService = {
    /**
     * Map API blog post format to application blog post format
     */
    mapApiBlogToApp(apiBlog: ApiBlogPost): BlogPost {
        return {
            id: apiBlog.id,
            title: apiBlog.title,
            excerpt: apiBlog.title,
            content: apiBlog.content,
            category: 'Du lịch',
            tags: [],
            featuredImage: apiBlog.imageUrl?.[0] || undefined,
            status: apiBlog.status,
            likes: apiBlog.totalLikes || 0,
            comments: apiBlog.totalComments || 0,
            createdAt: apiBlog.createdAt,
            updatedAt: apiBlog.updatedAt,
            authorId: undefined,
            authorName: apiBlog.authorName,
        };
    },

    /**
     * Get blogger's blog posts with pagination and filtering
     */
    async getMyBlogs(params: GetBlogsParams = {}): Promise<GetBloggerBlogsResponse> {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                textSearch = '',
                status
            } = params;

            // Chỉ thêm status vào params nếu nó là true hoặc false
            const apiParams: any = {
                pageIndex,
                pageSize,
                textSearch
            };
            if (typeof status === 'boolean') {
                apiParams.status = status;
            }

            const response = await axiosInstance.get<ApiGetBlogsResponse>('/Blogger/Blog-Blogger', {
                params: apiParams
            });

            console.log('Get blogs response:', response.data);

            const responseData = response.data;

            if (!responseData || !responseData.data) {
                console.error('No data in response:', responseData);
                return {
                    blogs: [],
                    totalCount: 0,
                    pageIndex: 1,
                    pageSize: 10,
                    totalPages: 0,
                };
            }

            const blogArray = responseData.data;
            if (!Array.isArray(blogArray)) {
                console.error('Data is not an array:', blogArray);
                return {
                    blogs: [],
                    totalCount: responseData.totalRecord || 0,
                    pageIndex: responseData.pageIndex || 1,
                    pageSize: responseData.pageSize || 10,
                    totalPages: responseData.totalPages || 0,
                };
            }

            return {
                blogs: blogArray.map(this.mapApiBlogToApp),
                totalCount: responseData.totalRecord || 0,
                pageIndex: responseData.pageIndex || 1,
                pageSize: responseData.pageSize || 10,
                totalPages: responseData.totalPages || 0,
            };
        } catch (error) {
            console.error('Error fetching blogger posts:', error);
            throw error;
        }
    },

    /**
     * Get a specific blog post by ID
     */
    async getBlogById(id: string): Promise<BlogPost> {
        try {
            const response = await axiosInstance.get<{
                statusCode: number;
                message: string;
                data: ApiBlogPost;
            }>(`/Blogger/blog/${id}`);

            if (!response.data.data) {
                throw new Error('Blog post not found');
            }

            return this.mapApiBlogToApp(response.data.data);
        } catch (error) {
            console.error('Error fetching blog post:', error);
            throw error;
        }
    },

    /**
     * Create a new blog post
     */
    async createBlog(blogData: CreateBlogPayload): Promise<BlogPost> {
        try {
            const formData = new FormData();
            formData.append('title', blogData.title);
            formData.append('content', blogData.content);

            if (blogData.files && blogData.files.length > 0) {
                blogData.files.forEach((file) => {
                    formData.append(`files`, file);
                });
            }

            console.log('Sending request to create blog...');

            const response = await axiosInstance.post('/Blogger/blog', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Response received:', response.data);

            if (response.status === 200 || response.status === 201) {
                if (response.data) {
                    let blogData = null;

                    if (response.data.data) {
                        blogData = response.data.data;
                    } else if ((response.data as any).id) {
                        blogData = response.data as any;
                    } else if (Array.isArray(response.data) && response.data.length > 0) {
                        blogData = (response.data as any)[0];
                    }

                    if (blogData && blogData.id) {
                        return this.mapApiBlogToApp(blogData);
                    } else {
                        console.error('Unexpected response structure, but create seems successful:', response.data);
                        if (response.data.statusCode === 200 &&
                            response.data.message &&
                            response.data.message.toLowerCase().includes('success')) {
                            return {
                                id: Date.now().toString(),
                                title: '',
                                excerpt: '',
                                content: '',
                                status: 0,
                                likes: 0,
                                comments: 0,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            } as BlogPost;
                        }
                        throw new Error('Blog created successfully but response format is unexpected');
                    }
                } else {
                    throw new Error('Empty response received');
                }
            } else {
                throw new Error(`HTTP Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error creating blog post:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                const errorMessage = axiosError.response?.data?.message || 'Failed to create blog post';
                throw new Error(errorMessage);
            }

            throw error;
        }
    },

    /**
     * Update an existing blog post
     */
    async updateBlog(blogData: UpdateBlogPayload): Promise<BlogPost> {
        try {
            const { id, title, content, files } = blogData;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);

            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append(`files`, file);
                });
            }

            console.log('Sending request to update blog...');

            const response = await axiosInstance.put<{
                statusCode: number;
                message: string;
                data: ApiBlogPost;
            }>(`/Blogger/blog/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Update response received:', response.data);

            if (response.status === 200 || response.status === 201) {
                if (response.data) {
                    let blogData = null;

                    if (response.data.data) {
                        blogData = response.data.data;
                    } else if ((response.data as any).id) {
                        blogData = response.data as any;
                    } else if (Array.isArray(response.data) && response.data.length > 0) {
                        blogData = (response.data as any)[0];
                    }

                    if (blogData && blogData.id) {
                        return this.mapApiBlogToApp(blogData);
                    } else {
                        console.error('Unexpected response structure, but update seems successful:', response.data);
                        if (response.data.statusCode === 200 &&
                            response.data.message &&
                            response.data.message.toLowerCase().includes('success')) {
                            return {
                                id: '',
                                title: '',
                                excerpt: '',
                                content: '',
                                status: 0,
                                likes: 0,
                                comments: 0,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            } as BlogPost;
                        }
                        throw new Error('Blog updated successfully but response format is unexpected');
                    }
                } else {
                    throw new Error('Empty response received');
                }
            } else {
                throw new Error(`HTTP Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating blog post:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                const errorMessage = axiosError.response?.data?.message || 'Failed to update blog post';
                throw new Error(errorMessage);
            }

            throw error;
        }
    },

    /**
     * Delete a blog post
     */
    async deleteBlog(id: string): Promise<void> {
        try {
            await axiosInstance.delete(`/Blogger/blog/${id}`);
        } catch (error) {
            console.error('Error deleting blog post:', error);
            throw error;
        }
    },

    /**
     * Publish a draft blog post
     */
    async publishBlog(id: string): Promise<BlogPost> {
        try {
            const response = await axiosInstance.patch<{
                statusCode: number;
                message: string;
                data: ApiBlogPost;
            }>(`/Blogger/Blog-Blogger/${id}/publish`);

            return this.mapApiBlogToApp(response.data.data);
        } catch (error) {
            console.error('Error publishing blog post:', error);
            throw error;
        }
    },

    /**
     * Save blog post as pending (status 0)
     */
    async saveDraft(blogData: CreateBlogPayload): Promise<BlogPost> {
        try {
            return await this.createBlog(blogData);
        } catch (error) {
            console.error('Error saving draft:', error);
            throw error;
        }
    },


    /**
     * Get dashboard statistics by month and year
     */
    async getDashboardStats(year: number, month: number): Promise<{
        totalPosts: number;
        approvedPosts: number;
        rejectedPosts: number;
        pendingPosts: number;
        totalLikes: number;
        totalComments: number;
    }> {
        try {
            const params = {
                year,
                month
            };

            console.log('Calling /Blogger/Dashboard with params:', params);

            const response = await axiosInstance.get('/Blogger/Dashboard', { params });

            console.log('Full API response:', response);
            console.log('Response.data:', response.data);

            // Check if response.data is the actual data or wrapped in another structure
            let actualData = response.data;

            // If response is wrapped in { statusCode, message, data } structure
            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                actualData = response.data.data;
                console.log('Using response.data.data:', actualData);
            } else {
                console.log('Using response.data directly:', actualData);
            }

            // Return the data directly from response
            return {
                totalPosts: actualData?.totalPosts || 0,
                approvedPosts: actualData?.approvedPosts || 0,
                rejectedPosts: actualData?.rejectedPosts || 0,
                pendingPosts: actualData?.pendingPosts || 0,
                totalLikes: actualData?.totalLikes || 0,
                totalComments: actualData?.totalComments || 0,
            };
        } catch (error) {
            console.error('Error fetching blogger dashboard stats:', error);

            // Log the error details
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                console.error('API Error details:', {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    url: axiosError.config?.url
                });
            }

            // Re-throw error so component can handle fallback
            throw error;
        }
    },    /**
     * Handle API errors consistently
     */
    handleError(error: unknown, context: string): never {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data: any } };

            if (process.env.NODE_ENV === 'development') {
                console.error(`${context}:`, {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data
                });
            }

            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                throw new Error('Unauthorized access');
            }

            if (axiosError.response?.status === 404) {
                throw new Error('Blog post not found');
            }

            if (axiosError.response?.status === 422) {
                throw new Error('Validation error');
            }
        }

        throw error instanceof Error ? error : new Error(context);
    }
};

export default bloggerService;
