import axios from '@/config/axios';
import {
    UpdateUserPayload,
    CreateUserPayload,
    ProfileUpdatePayload,
    TourGuideApplication,
    TourGuideApplicationForm,
    ShopApplicationForm,
    UserComment,
    UserSupportTicket,
    Comment,
    ApiUser
} from '../types';

// Re-export types for convenience
export type { Comment, UserComment } from '../types';

/**
 * Service handling user management API operations
 */
export const userService = {
    /**
     * Lấy danh sách shop
     * @param pageIndex Trang hiện tại (mặc định 1)
     * @param pageSize Số lượng mỗi trang (mặc định 10)
     * @param searchText Tìm kiếm theo tên shop (tùy chọn)
     * @returns Promise với danh sách shop
     */
    getShopList: async (
        pageIndex: number = 1,
        pageSize: number = 10,
        name?: string,
        includeInactive?: boolean
    ): Promise<any> => {
        const params: any = {
            pageIndex,
            pageSize
        };
        if (name) params.name = name;
        if (typeof includeInactive === 'boolean') params.includeInactive = includeInactive;
        const response = await axios.get('/SpecialtyShop', { params });
        return response.data;
    },
    /**
     * Lấy danh sách đơn hàng của user hiện tại
     * @returns Promise với danh sách đơn hàng
     */
    /**
     * Lấy danh sách đơn hàng của user hiện tại với phân trang, lọc trạng thái và mã PayOS
     * @param pageIndex Trang hiện tại (mặc định 1)
     * @param pageSize Số lượng mỗi trang (mặc định 10)
     * @param status Trạng thái đơn hàng (tùy chọn)
     * @param payOsOrderCode Mã đơn hàng PayOS (tùy chọn)
     * @returns Promise với danh sách đơn hàng
     */
    getMyOrders: async (
        pageIndex: number = 0,
        pageSize: number = 10,
        status?: string,
        payOsOrderCode?: string
    ): Promise<any[]> => {
        const params: any = {
            pageIndex,
            pageSize
        };
        if (status) params.status = status;
        if (payOsOrderCode) params.payOsOrderCode = payOsOrderCode;
        const response = await axios.get<any[]>('/Account/my-orders', { params });
        return response.data;
    },
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
            phone: apiUser.phoneNumber || '',
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
     * Lấy danh sách voucher khả dụng (theo guide API)
     * @param pageIndex Trang hiện tại (mặc định 1)
     * @param pageSize Số lượng mỗi trang (mặc định 10)
     * @returns Promise với danh sách voucher khả dụng
     */
    getAvailableVouchers: async (
        pageIndex: number = 1,
        pageSize: number = 10
    ): Promise<{
        statusCode: number;
        message: string;
        success: boolean;
        data: any[];
        totalRecord: number;
        totalPages: number;
    }> => {
        const params = { pageIndex, pageSize };
        const response = await axios.get('/Product/GetAvailable-Vouchers', { params });
        return response.data;
    },

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại
     * @param pageIndex Trang hiện tại (mặc định 1)
     * @param pageSize Số lượng mỗi trang (mặc định 10)
     * @param payOsOrderCode Mã đơn hàng PayOS (tùy chọn)
     * @param orderStatus Trạng thái đơn hàng (tùy chọn: Pending, Paid, Cancel)
     * @param isChecked Đã nhận hàng hay chưa (tùy chọn: true/false)
     * @returns Promise với danh sách đơn hàng
     */
    getUserOrders: async (
        pageIndex: number = 1,
        pageSize: number = 10,
        payOsOrderCode?: string,
        orderStatus?: string,
        isChecked?: boolean
    ): Promise<any> => {
        const params: any = { pageIndex, pageSize };
        if (payOsOrderCode) params.payOsOrderCode = payOsOrderCode;
        if (orderStatus) params.orderStatus = orderStatus;
        if (isChecked !== undefined) params.isChecked = isChecked;
        const response = await axios.get('/Product/GetOrder-ByUser', { params });
        return response.data;
    },
    /**
     * Tìm kiếm tour theo các tham số
     * @param params Tham số tìm kiếm
     * @returns Promise với kết quả tìm kiếm
     */
    searchTours: async (params: {
        scheduleDay?: string;
        month?: number;
        year?: number;
        destination?: string;
        textSearch?: string;
        pageIndex?: number;
        pageSize?: number;
    }): Promise<any> => {
        try {
            const response = await axios.get('/UserTourSearch/search', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
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
            status: userData.isActive // Sửa ở đây
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
            status: userData.isActive, // Sửa ở đây
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
    submitTourGuideApplication: async (application: TourGuideApplicationForm): Promise<any> => {
        const formData = new FormData();
        formData.append('FullName', application.fullName);
        formData.append('PhoneNumber', application.phoneNumber);
        formData.append('Email', application.email);
        formData.append('Experience', application.experience);
        // Lặp qua từng kỹ năng và append từng trường Skills (english names)
        application.skills.forEach((skillName) => {
            if (typeof skillName === 'string' && skillName.trim()) {
                formData.append('Skills', skillName);
            }
        });
        // Truyền SkillsString là chuỗi
        if (application.skillsString) {
            formData.append('SkillsString', application.skillsString);
        }
        formData.append('CurriculumVitae', application.curriculumVitae);

        const response = await axios.post('/Account/tourguide-application/upload', formData, {
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
    getTourGuideApplications: async (): Promise<TourGuideApplication[]> => {
        const response = await axios.get<TourGuideApplication[]>('Cms/tour-guide-application');
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
    },

    /**
     * Submit shop registration (specialty shop application)
     * @param data Shop registration data (fields + files)
     * @returns Promise with operation result
     */
    submitShopRegistration: async (data: ShopApplicationForm): Promise<any> => {
        const formData = new FormData();
        formData.append('ShopName', data.shopName);
        formData.append('RepresentativeName', data.representativeName);
        if (data.representativeNameOnPaper) formData.append('RepresentativeNameOnPaper', data.representativeNameOnPaper);
        formData.append('PhoneNumber', data.phone);
        formData.append('Email', data.email);
        if (data.website) formData.append('Website', data.website);
        formData.append('ShopType', data.shopType);
        formData.append('Location', data.location);
        if (data.shopDescription) formData.append('ShopDescription', data.shopDescription);
        if (data.openingHour) formData.append('OpeningHours', data.openingHour);
        if (data.closingHour) formData.append('CloseHours', data.closingHour);
        if (data.logo) formData.append('Logo', data.logo);
        formData.append('BusinessLicenseFile', data.businessLicense);
        formData.append('BusinessLicense', data.businessCode);

        const response = await axios.post('/Account/specialty-shop-application', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Lấy danh sách các đơn đăng ký làm hướng dẫn viên đã gửi (của user hiện tại)
     * @returns Promise với danh sách đơn đăng ký
     */
    getMyTourGuideApplications: async (): Promise<TourGuideApplication[]> => {
        const response = await axios.get<TourGuideApplication[]>('/Account/my-tourguide-applications');
        return response.data;
    },

    /**
     * Lấy danh sách các đơn đăng ký shop đã gửi (của user hiện tại)
     * @returns Promise với danh sách đơn đăng ký shop
     */
    getMyShopApplications: async (): Promise<any[]> => {
        const response = await axios.get<any[]>('/Account/my-specialty-shop-application');
        return response.data;
    },

    /**
     * Tạo đánh giá cho sản phẩm
     * @param productId ID sản phẩm
     * @param rating Số sao đánh giá
     * @param review Nội dung đánh giá
     * @returns Promise với kết quả tạo đánh giá
     */
    createProductReview: async (productId: string, rating: number, review: string): Promise<any> => {
        const payload = { productId, rating, review };
        const response = await axios.post('/Product/reviews-ratings', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    /**
     * Lấy thông tin chi tiết của một shop theo ID
     * @param shopId ID của shop
     * @returns Promise với thông tin chi tiết shop
     */
    getShopInfo: async (shopId: string): Promise<any> => {
        try {
            const response = await axios.get(`/SpecialtyShop/${shopId}`);

            // API trả về object có structure: { data: shopInfo, isSuccess, statusCode, message, success, validationErrors }
            if (response.data && response.data.isSuccess && response.data.data) {
                return response.data.data;
            }

            // Nếu không có data hoặc không thành công, throw error
            throw new Error(response.data?.message || 'Failed to fetch shop information');
        } catch (error) {
            console.error(`Error fetching shop info for ID ${shopId}:`, error);

            // Trả về object mặc định để tránh crash
            return {
                id: shopId,
                shopName: 'Unknown Shop',
                description: '',
                location: '',
                representativeName: '',
                email: '',
                phoneNumber: '',
                website: null,
                businessLicense: '',
                shopType: '',
                rating: 0,
                isShopActive: false
            };
        }
    },
};

// Also export as default
export default userService;

// Định nghĩa lại các type còn thiếu tại đây nếu cần
export type User = {
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
};

export type GetUsersResponse = {
    data: User[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
};

type ApiUpdateUserPayload = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    status?: boolean;
};

// Định nghĩa lại GetCommentsResponse nếu chưa có trong types
export type GetCommentsResponse = {
    data: UserComment[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
};

// Định nghĩa ApiGetUsersResponse nếu chưa có trong types
export type ApiGetUsersResponse = {
    data: ApiUser[];
    totalRecord: number;
    page: number;
    pageSize: number;
};
