import axios from '@/config/axios';
import {
    UpdateUserPayload,
    CreateUserPayload,
    ProfileUpdatePayload,
    TourGuideApplication,
    UserBlog,
    UserComment,
    UserSupportTicket,
    Comment
} from '../types';

// Re-export types for convenience
export type { Comment, UserComment } from '../types';

// API response interfaces
interface ApiUser {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role?: string;
    isActive: boolean;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ApiGetUsersResponse {
    data: ApiUser[];
    totalRecord: number;
    page: number;
    pageSize: number;
}

// Application interfaces
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: boolean;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetUsersResponse {
    data: User[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

// API request interfaces
interface ApiUpdateUserPayload {
    name?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    status?: boolean;
}

// CV management interfaces
export interface CV {
    id: string;
    email: string;
    curriculumVitae: string;
    status: number;
    rejectionReason: string | null;
    createdAt: string;
    user: {
        name: string;
    }
}

export interface GetBlogsResponse {
    data: UserBlog[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

export interface GetCommentsResponse {
    data: UserComment[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

/**
 * Service handling user management API operations
 */
export const userService = {
    /**
     * Map API user format to application user format
     * @param apiUser User data from API
     * @returns User data in application format
     */
    mapApiUserToUser: (apiUser: ApiUser): User => {
        return {
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phoneNumber,
            role: apiUser.role || '',
            status: apiUser.isActive,
            avatar: apiUser.avatar,
            isVerified: apiUser.isVerified,
            createdAt: apiUser.createdAt,
            updatedAt: apiUser.updatedAt
        };
    },
    /**
     * Get a list of users with pagination, search, and filtering
     * @param page Current page number
     * @param pageSize Number of records per page
     * @param searchText Text to search for in user records
     * @param status Filter by active/inactive status
     * @returns Promise with user data and pagination info
     */
    getUsers: async (
        page: number = 1,
        pageSize: number = 10,
        searchText?: string,
        status?: boolean
    ): Promise<GetUsersResponse> => {
        const params: any = {
            pageIndex: page,
            pageSize,
        };

        if (searchText) {
            params.textSearch = searchText;
        }

        if (status !== undefined) {
            params.status = status;
        }

        const response = await axios.get<ApiGetUsersResponse>('/Cms/user', { params });
        const apiResponse = response.data;

        // Map API response to application format
        return {
            data: apiResponse.data.map(userService.mapApiUserToUser),
            totalRecords: apiResponse.totalRecord,
            currentPage: apiResponse.page,
            pageSize: apiResponse.pageSize
        };
    },
    /**
     * Get a specific user by ID
     * @param id User ID
     * @returns Promise with user data
     */
    getUserById: async (id: string): Promise<User> => {
        const response = await axios.get<ApiUser>(`/Cms/user/${id}`);
        return userService.mapApiUserToUser(response.data);
    },
    /**
     * Update an existing user
     * @param id User ID
     * @param userData New user data
     * @returns Promise with updated user data
     */
    updateUser: async (id: string, userData: UpdateUserPayload): Promise<User> => {
        // Map application format to API format
        const apiPayload: ApiUpdateUserPayload = {
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phone,
            role: userData.role,
            status: userData.status
        };

        const response = await axios.put<ApiUser>(`/Cms/user/${id}`, apiPayload);
        return userService.mapApiUserToUser(response.data);
    },
    /**
     * Delete a user
     * @param id User ID
     * @returns Promise with operation result
     */
    deleteUser: async (id: string): Promise<void> => {
        await axios.delete(`/Cms/user/${id}`);
    },
    /**
     * Toggle user active/inactive status
     * @param id User ID
     * @param status New status (true = active, false = inactive)
     * @returns Promise with updated user data
     */
    toggleUserStatus: async (id: string, status: boolean): Promise<User> => {
        const response = await axios.patch<ApiUser>(`/Cms/user/${id}/status`, { status });
        return userService.mapApiUserToUser(response.data);
    },
    /**
     * Create a new user
     * @param userData User data including password
     * @returns Promise with created user data
     */
    createUser: async (userData: CreateUserPayload): Promise<User> => {
        // Map application format to API format
        const apiPayload = {
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phone,
            role: userData.role,
            status: userData.status,
            password: userData.password
        };

        const response = await axios.post<ApiUser>('/Cms/user', apiPayload);
        return userService.mapApiUserToUser(response.data);
    },
    /**
     * Update user profile
     * @param updatedData Profile data to update
     * @returns Promise with operation result
     */
    updateProfile: async (updatedData: ProfileUpdatePayload): Promise<any> => {
        const response = await axios.put('/Account/edit-profile', updatedData);
        return response.data;
    },
    /**
     * Update user avatar
     * @param avatarFile Avatar image file
     * @returns Promise with operation result
     */
    updateAvatar: async (avatarFile: File): Promise<any> => {
        const formData = new FormData();
        formData.append('Avatar', avatarFile, avatarFile.name);

        const response = await axios.put('/Account/edit-Avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Get user's support tickets
     * @returns Promise with support tickets
     */
    getUserSupportTickets: async (): Promise<UserSupportTicket[]> => {
        try {
            const response = await axios.get<UserSupportTicket[]>('SupportTickets/User');

            // Ensure response data is an array, otherwise return empty array
            const tickets = Array.isArray(response.data) ? response.data : [];

            // Validate and transform ticket data
            return tickets.map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                content: ticket.content,
                status: ticket.status,
                createdAt: ticket.createdAt,
                userId: ticket.userId || '',
                userName: ticket.userName || '',
                userEmail: ticket.userEmail || '',
                images: Array.isArray(ticket.images) ? ticket.images : [],
                response: ticket.response
            }));
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                // Add preventDefault flag to suppress default error handling
                (error as any).preventDefault = true;

                // Log error in development only
                if (process.env.NODE_ENV === 'development') {
                    const axiosError = error as { response?: { status: number; data: any } };
                    console.error(
                        'Support tickets fetch error:',
                        axiosError.response?.status,
                        axiosError.response?.data
                    );
                }
            }
            return [];
        }
    },
    /**
     * Submit a new support ticket
     * @param title Ticket title
     * @param content Ticket content
     * @param file Optional attachment file
     * @returns Promise with operation result
     */
    submitSupportTicket: async (title: string, content: string, file?: File): Promise<UserSupportTicket> => {
        try {
            // Validate inputs
            if (!title.trim()) {
                throw new Error('Title is required');
            }
            if (!content.trim()) {
                throw new Error('Content is required');
            }
            if (file && !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                throw new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.');
            }

            const formData = new FormData();
            formData.append('Title', title.trim());
            formData.append('Content', content.trim());
            if (file) {
                formData.append('Files', file);
            }

            const response = await axios.post<UserSupportTicket>('SupportTickets', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Validate response
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid server response');
            }

            return {
                id: response.data.id,
                title: response.data.title,
                content: response.data.content,
                status: response.data.status,
                createdAt: response.data.createdAt,
                userId: response.data.userId || '',
                userName: response.data.userName || '',
                userEmail: response.data.userEmail || '',
                images: Array.isArray(response.data.images) ? response.data.images : [],
                response: response.data.response
            };
        } catch (error) {
            // Handle specific error cases
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status: number; data: any } };

                if (axiosError.response?.status === 401) {
                    throw new Error('Please log in to submit a support ticket');
                }
                if (axiosError.response?.status === 413) {
                    throw new Error('File size is too large');
                }

                // Log detailed error in development
                if (process.env.NODE_ENV === 'development') {
                    console.error('Support ticket submission error:', {
                        status: axiosError.response?.status,
                        data: axiosError.response?.data
                    });
                }
            }

            // Re-throw error for component handling
            throw error instanceof Error ? error : new Error('Failed to submit support ticket');
        }
    },
    /**
     * Submit tour guide application
     * @param application Tour guide application data
     * @returns Promise with operation result
     */
    submitTourGuideApplication: async (application: TourGuideApplication): Promise<any> => {
        const formData = new FormData();
        formData.append('Email', application.email);
        formData.append('CurriculumVitae', application.curriculumVitae);

        const response = await axios.post('/Account/tourguide-application', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    /**
     * Get all support tickets (admin)
     * @param status Optional status filter
     * @returns Promise with support tickets
     */
    getAdminSupportTickets: async (status?: string): Promise<UserSupportTicket[]> => {
        try {
            let url = 'SupportTickets/Admin';
            if (status) {
                url += `?status=${encodeURIComponent(status)}`;
            }

            const response = await axios.get<UserSupportTicket[]>(url);

            // Ensure response data is an array
            const tickets = Array.isArray(response.data) ? response.data : [];

            // Validate and transform ticket data
            return tickets.map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                content: ticket.content,
                status: ticket.status,
                createdAt: ticket.createdAt,
                userId: ticket.userId || '',
                userName: ticket.userName || '',
                userEmail: ticket.userEmail || '',
                images: Array.isArray(ticket.images) ? ticket.images : [],
                response: ticket.response
            }));
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status: number; data: any } };

                // Log error in development
                if (process.env.NODE_ENV === 'development') {
                    console.error(
                        'Admin support tickets fetch error:',
                        axiosError.response?.status,
                        axiosError.response?.data
                    );
                }

                // Handle 401/403 errors
                if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                    throw new Error('Unauthorized access to admin support tickets');
                }
            }
            return [];
        }
    },
    /**
     * Update support ticket status (admin)
     * @param ticketId Ticket ID
     * @param newStatus New status
     * @returns Promise with operation result
     */
    updateTicketStatus: async (ticketId: string, newStatus: string): Promise<any> => {
        const response = await axios.put(`SupportTickets/Admin/${ticketId}/status`, {
            status: newStatus
        });
        return response.data;
    },
    /**
     * Respond to a support ticket (admin)
     * @param ticketId Ticket ID
     * @param response Response content
     * @returns Promise with operation result
     */
    respondToTicket: async (ticketId: string, response: string): Promise<any> => {
        const responseData = await axios.put(`SupportTickets/Admin/${ticketId}/respond`, {
            response
        });
        return responseData.data;
    },
    /**
     * Get all tour guide applications (admin)
     * @returns Promise with CV applications
     */
    getTourGuideApplications: async (): Promise<CV[]> => {
        const response = await axios.get<CV[]>('Cms/tour-guide-application');
        return response.data;
    },
    /**
     * Approve tour guide application (admin)
     * @param cvId Application ID
     * @returns Promise with operation result
     */
    approveTourGuideApplication: async (cvId: string): Promise<any> => {
        const response = await axios.put(`Cms/${cvId}/approve-application`);
        return response.data;
    },

    /**
     * Reject tour guide application (admin)
     * @param cvId Application ID
     * @param reason Rejection reason
     * @returns Promise with operation result
     */    rejectTourGuideApplication: async (cvId: string, reason: string): Promise<any> => {
        const response = await axios.put(`Cms/${cvId}/reject-application`, {
            reason
        });
        return response.data;
    },    /**
     * Get comments for a blog post
     * @param blogId Blog post ID
     * @param page Page number
     * @param pageSize Items per page
     * @returns Promise with comments data
     */
    getBlogComments: async (
        blogId: string,
        page: number = 1,
        pageSize: number = 5
    ): Promise<GetCommentsResponse> => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem('token');

            const response = await axios.get(`/Blogger/${blogId}/comments`, {
                params: {
                    pageIndex: page,
                    pageSize
                },
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : undefined
            });

            // Check if response is directly an array (not wrapped in data property)
            const commentsData = Array.isArray(response.data) ? response.data :
                (response.data?.data && Array.isArray(response.data.data)) ? response.data.data : [];

            // For debugging
            console.log('Comments API response:', response.data);
            console.log('Processed comments data:', commentsData);

            return {
                data: commentsData,
                totalRecords: response.data?.totalRecord || commentsData.length || 0,
                currentPage: response.data?.page || page,
                pageSize: response.data?.pageSize || pageSize
            };
        } catch (error) {
            console.error('Error fetching blog comments:', error);
            return {
                data: [],
                totalRecords: 0,
                currentPage: page,
                pageSize
            };
            return {
                data: [],
                totalRecords: 0,
                currentPage: page,
                pageSize
            };
        }
    },    /**
     * Create a new comment on a blog post
     * @param blogId Blog post ID
     * @param content Comment content
     * @param parentCommentId Optional parent comment ID for replies
     * @returns Promise with created comment
     */
    createComment: async (blogId: string, content: string, parentCommentId?: string): Promise<Comment | null> => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem('token');

            const payload: any = { content };
            if (parentCommentId) {
                payload.parentCommentId = parentCommentId;
            }

            const response = await axios.post(`/Blogger/${blogId}/comments`, payload, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : undefined
            });

            return response.data;
        } catch (error) {
            console.error('Error creating comment:', error);
            return null;
        }
    },    /**
     * Like a comment
     * @param commentId Comment ID
     * @returns Promise with operation result
     */    likeComment: async (commentId: string): Promise<any> => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem('token');

            const response = await axios.post(`/Comment/${commentId}/like`, {}, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : undefined
            });
            return response.data;
        } catch (error) {
            console.error('Error liking comment:', error);
            return null;
        }
    },

    /**
     * Add or remove favorite reaction to a blog post
     * @param blogId Blog post ID
     * @param reaction 0 for dislike, 1 for like
     * @returns Promise with operation result
     */
    toggleBlogReaction: async (blogId: string, reaction: 0 | 1): Promise<any> => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('User must be authenticated to react to blog posts');
            }

            const response = await axios.post(`/Blogger/${blogId}/reaction`, {
                blogId: blogId,
                reaction: reaction
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error toggling blog reaction:', error);
            throw error;
        }
    }
};

// Also export as default
export default userService;
