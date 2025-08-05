import axios from '@/config/axios';
// Import type definitions
import { TicketStatus, AdminBlogPost, AdminSupportTicket } from '../types';
import type { UpdateUserPayload, CreateUserPayload } from '@/types/user';
import type { TourGuideApplication } from '@/types';

// Re-export types for convenience
export type { AdminBlogPost, SupportTicket, AdminSupportTicket } from '../types';

class AdminService {
    // Lấy danh sách tour chờ duyệt
    async getAllTours({
        page = 0,
        pageSize = 10,
        searchTerm = '',
        status = '',
        includeInactive = false
    } = {}): Promise<any> {
        const params: any = { page, pageSize };
        if (searchTerm) params.searchTerm = searchTerm;
        if (status) params.status = status;
        params.includeInactive = includeInactive;

        const response = await axios.get('/Admin/tourdetails/all', { params });
        return response.data;
    }


    // Duyệt tour
    async approveTour(tourId: string, comment: string = ''): Promise<any> {
        if (!tourId) throw new Error('Tour ID is required');
        const response = await axios.post(`/Cms/tourdetails/${tourId}/approve-reject`, {
            isApproved: true,
            comment
        });
        return response.data;
    }

    // Từ chối tour
    async rejectTour(tourId: string, comment: string = ''): Promise<any> {
        if (!tourId) throw new Error('Tour ID is required');
        const response = await axios.post(`/Cms/tourdetails/${tourId}/approve-reject`, {
            isApproved: false,
            comment
        });
        return response.data;
    }
    // Blog Management Methods
    async getAllBlogs(params: {
        pageIndex?: number;
        pageSize?: number;
        textSearch?: string;
        status?: 0 | 1 | 2;
        sortField?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}): Promise<{
        blogs: AdminBlogPost[];
        totalCount: number;
        pageIndex: number;
        pageSize: number;
        totalPages: number;
    }> {
        try {
            const {
                pageIndex = 0,
                pageSize = 10,
                textSearch = '',
                status,
                sortField = 'createdAt',
                sortOrder = 'desc'
            } = params;

            const queryParams: any = {
                pageIndex,
                pageSize,
                textSearch,
                sortField,
                sortOrder
            };

            if (status !== undefined) {
                queryParams.status = status;
            } const response = await axios.get<{
                statusCode: number;
                message: string;
                data: any[];
                totalRecord: number;
                totalPages: number;
                pageIndex: number;
                pageSize: number;
            }>('/Admin/Blog-Admin', {
                params: queryParams
            }); return {
                blogs: response.data.data ? response.data.data.map(this.mapApiBlogToAdmin) : [],
                totalCount: response.data.totalRecord || 0,
                pageIndex: response.data.pageIndex || 1,
                pageSize: response.data.pageSize || 10,
                totalPages: response.data.totalPages || 0
            };
        } catch (error) {
            console.error('Error fetching admin blogs:', error);
            // Không sử dụng handleError để ném ngoại lệ
            return {
                blogs: [],
                totalCount: 0,
                pageIndex: 1,
                pageSize: 10,
                totalPages: 0
            };
        }
    }
    async getCmsBlogs(params: {
        pageIndex?: number;
        pageSize?: number;
        textSearch?: string;
    } = {}): Promise<{
        blogs: AdminBlogPost[];
        totalCount: number;
        pageIndex: number;
        pageSize: number;
        totalPages: number;
    }> {
        try {
            const {
                pageIndex = 0,
                pageSize = 10,
                textSearch = ''
            } = params;

            const queryParams: any = {
                pageIndex,
                pageSize,
                textSearch
            };

            const response = await axios.get<{
                statusCode: number;
                message: string;
                data: any[];
                totalRecord: number;
                totalPages: number;
                pageIndex: number;
                pageSize: number;
            }>('/Cms/Blog', {
                params: queryParams
            });

            return {
                blogs: response.data.data ? response.data.data.map(this.mapApiBlogToAdmin) : [],
                totalCount: response.data.totalRecord || 0,
                pageIndex: response.data.pageIndex || 1,
                pageSize: response.data.pageSize || 10,
                totalPages: response.data.totalPages || 0
            };
        } catch (error) {
            console.error('Error fetching CMS blogs:', error);
            // Không sử dụng handleError để ném ngoại lệ
            return {
                blogs: [],
                totalCount: 0,
                pageIndex: 1,
                pageSize: 10,
                totalPages: 0
            };
        }
    }

    async updateBlogStatus(blogId: string, payload: {
        status: 0 | 1 | 2;
        commentOfAdmin?: string;
    }): Promise<void> {
        try {
            if (!blogId) {
                throw new Error('Blog ID is required');
            }

            await axios.put(`/Cms/Update-blog/${blogId}`, payload);
        } catch (error) {
            this.handleError(error, 'Error updating blog status');
        }
    }

    async deleteBlog(blogId: string): Promise<void> {
        try {
            if (!blogId) {
                throw new Error('Blog ID is required');
            }

            await axios.delete(`/Admin/Blog-Admin/${blogId}`);
        } catch (error) {
            this.handleError(error, 'Error deleting blog');
        }
    }
    private mapApiBlogToAdmin(apiBlog: any): AdminBlogPost {
        return {
            id: apiBlog.id || '',
            title: apiBlog.title || 'No Title',
            content: apiBlog.content || '',
            excerpt: apiBlog.excerpt || apiBlog.title || 'No excerpt',
            category: apiBlog.category || 'Du lịch',
            tags: apiBlog.tags || [],
            featuredImage: Array.isArray(apiBlog.imageUrl) ? apiBlog.imageUrl[0] : apiBlog.imageUrl || apiBlog.featuredImage,
            imageUrl: Array.isArray(apiBlog.imageUrl) ? apiBlog.imageUrl : apiBlog.imageUrl ? [apiBlog.imageUrl] : undefined,
            status: apiBlog.status !== undefined ? apiBlog.status : 0,
            views: apiBlog.views || 0,
            likes: apiBlog.likes || 0,
            authorId: apiBlog.authorId || apiBlog.userId || '',
            authorName: apiBlog.authorName || 'Unknown Author',
            createdAt: apiBlog.createdAt || new Date().toISOString(),
            updatedAt: apiBlog.updatedAt || new Date().toISOString(),
            commentOfAdmin: apiBlog.commentOfAdmin || ''
        };
    }    // Support Tickets Management
    async getSupportTickets(status?: TicketStatus): Promise<AdminSupportTicket[]> {
        try {
            let endpoint = 'Cms/SupportTicket';
            if (status) {
                endpoint += `?status=${encodeURIComponent(status)}`;
            }

            const response = await axios.get<AdminSupportTicket[]>(endpoint);

            // Validate and transform response
            const tickets = Array.isArray(response.data) ? response.data : [];
            return tickets.map(ticket => this.validateTicket(ticket));

        } catch (error) {
            this.handleError(error, 'Error fetching admin support tickets');
            return [];
        }
    } async updateTicketStatus(ticketId: string, newStatus: TicketStatus): Promise<void> {
        try {
            if (!ticketId) {
                throw new Error('Ticket ID is required');
            }

            // Convert status string to number for API
            let statusNumber: number;
            switch (newStatus) {
                case 'Open':
                    statusNumber = 0;
                    break;
                case 'Resolved':
                    statusNumber = 1;
                    break;
                case 'Rejected':
                    statusNumber = 2;
                    break;
                default:
                    throw new Error('Invalid status');
            }

            await axios.put(`SupportTickets/Admin/${ticketId}/status`, { status: statusNumber });
        } catch (error) {
            this.handleError(error, 'Error updating ticket status');
        }
    }

    async respondToTicket(ticketId: string, response: string): Promise<void> {
        try {
            if (!ticketId) {
                throw new Error('Ticket ID is required');
            }
            if (!response.trim()) {
                throw new Error('Response cannot be empty');
            }

            await axios.put(`SupportTickets/Admin/${ticketId}/respond`, { response: response.trim() });
        } catch (error) {
            this.handleError(error, 'Error sending ticket response');
        }
    } private validateTicket(ticket: any): AdminSupportTicket {
        if (!ticket || typeof ticket !== 'object') {
            throw new Error('Invalid ticket data received from server');
        }

        // Required fields validation
        if (!ticket.id || !ticket.title || !ticket.content || ticket.status === undefined) {
            throw new Error('Missing required ticket fields');
        }

        // Status validation
        const status = Number(ticket.status);
        let ticketStatus: TicketStatus;

        switch (status) {
            case 0:
                ticketStatus = 'Open';
                break;
            case 1:
                ticketStatus = 'Resolved';
                break;
            case 2:
                ticketStatus = 'Rejected';
                break;
            default:
                throw new Error('Invalid ticket status');
        }

        return {
            id: ticket.id,
            title: ticket.title,
            content: ticket.content,
            status: ticketStatus,
            createdAt: ticket.createdAt || new Date().toISOString(),
            userId: ticket.userId || '',
            userName: ticket.userName || '',
            userEmail: ticket.userEmail || '',
            images: Array.isArray(ticket.images) ? ticket.images : [],
            response: ticket.response
        };
    } private handleError(error: unknown, context: string): Error {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data: any } };

            if (process.env.NODE_ENV === 'development') {
                console.error(`${context}:`, {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data
                });
            }

            // Handle specific error codes
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                return new Error('Unauthorized access');
            }
        }

        return error instanceof Error ? error : new Error(context);
    }

    // User Management Methods
    async getUsers(page: number = 0, pageSize: number = 10, searchText?: string, status?: boolean) {
        const params: any = {
            pageIndex: page,
            pageSize,
        };
        if (searchText) params.textSearch = searchText;
        if (status !== undefined) params.status = status;
        const response = await axios.get('/Cms/user', { params });
        // Map phoneNumber -> phone cho từng user
        const users = Array.isArray(response.data.data)
            ? response.data.data.map((u: any) => ({
                ...u,
                phone: u.phoneNumber || '',
            }))
            : [];
        return {
            ...response.data,
            data: users,
        };
    }

    async getCVs(): Promise<TourGuideApplication[]> {
        const response = await axios.get('Cms/tourguide-applications');
        // Đảm bảo luôn trả về mảng
        if (response.data && Array.isArray(response.data.data?.applications)) {
            return response.data.data.applications;
        }
        return [];
    }

    async createUser(payload: CreateUserPayload) {
        const response = await axios.post('/Cms/user', payload);
        return response.data;
    }

    async updateUser(id: string, payload: UpdateUserPayload) {
        const response = await axios.patch(`/Cms/user/${id}`, payload);
        return response.data;
    }

    async deleteUser(id: string) {
        return axios.delete(`/Cms/user/${id}`);
    }

    async toggleUserStatus(id: string, status: boolean) {
        // Sử dụng cùng endpoint với updateUser, chỉ khác payload
        const response = await axios.patch(`/Cms/user/${id}`, { status });
        return response.data;
    }

    async approveTourGuideApplication(cvId: string): Promise<any> {
        const response = await axios.put(`Cms/tourguide-applications/${cvId}/approve`);
        return response.data;
    }
    async rejectTourGuideApplication(cvId: string, reason: string): Promise<any> {
        const response = await axios.put(`Cms/tourguide-applications/${cvId}/reject`, { reason });
        return response.data;
    }

    // Lấy danh sách đơn đăng ký shop
    async getShopRegistrations({
        page = 0,
        pageSize = 10,
        status,
        searchTerm
    }: {
        page?: number;
        pageSize?: number;
        status?: string | number;
        searchTerm?: string;
    } = {}): Promise<any> {
        const params: any = { page, pageSize };
        if (status !== undefined) params.status = status;
        if (searchTerm) params.searchTerm = searchTerm;

        const response = await axios.get('SpecialtyShopApplication', { params });

        // Log để debug

        // Xử lý các cấu trúc response khác nhau
        if (response.data) {
            // Nếu có structure như tour guide (data.applications)
            if (response.data.data && Array.isArray(response.data.data.applications)) {
                return response.data;
            }
            // Nếu có structure items
            if (response.data.data && Array.isArray(response.data.data.items)) {
                return response.data.data.items;
            }
            // Nếu data trực tiếp là array
            if (Array.isArray(response.data)) {
                return response.data;
            }
        }

        return [];
    }

    // Duyệt đơn đăng ký shop
    async approveShopRegistration(applicationId: string): Promise<any> {
        const response = await axios.post(`SpecialtyShopApplication/${applicationId}/approve`);
        return response.data;
    }

    // Từ chối đơn đăng ký shop
    async rejectShopRegistration(applicationId: string, reason: string): Promise<any> {
        const response = await axios.post(`SpecialtyShopApplication/${applicationId}/reject`, { rejectionReason: reason });
        return response.data;
    }

    // Dashboard Statistics
    async getDashboardStats(year: number, month: number): Promise<{
        totalAccounts: number;
        newAccountsThisMonth: number;
        bookingsThisMonth: number;
        ordersThisMonth: number;
        totalRevenue: number;
        withdrawRequestsTotal: number;
        withdrawRequestsApprove: number;
        newTourGuidesThisMonth: number;
        newShopsThisMonth: number;
        newPostsThisMonth: number;
        revenueByShop: any[];
    }> {
        try {
            const params = {
                year,
                month
            };

            const response = await axios.get('/Admin/Dashboard', { params });

            // Validate and return with default values if needed
            return {
                totalAccounts: response.data.totalAccounts || 0,
                newAccountsThisMonth: response.data.newAccountsThisMonth || 0,
                bookingsThisMonth: response.data.bookingsThisMonth || 0,
                ordersThisMonth: response.data.ordersThisMonth || 0,
                totalRevenue: response.data.totalRevenue || 0,
                withdrawRequestsTotal: response.data.withdrawRequestsTotal || 0,
                withdrawRequestsApprove: response.data.withdrawRequestsApprove || 0,
                newTourGuidesThisMonth: response.data.newTourGuidesThisMonth || 0,
                newShopsThisMonth: response.data.newShopsThisMonth || 0,
                newPostsThisMonth: response.data.newPostsThisMonth || 0,
                revenueByShop: response.data.revenueByShop || []
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            this.handleError(error, 'Error fetching dashboard statistics');

            // Return default values on error
            return {
                totalAccounts: 0,
                newAccountsThisMonth: 0,
                bookingsThisMonth: 0,
                ordersThisMonth: 0,
                totalRevenue: 0,
                withdrawRequestsTotal: 0,
                withdrawRequestsApprove: 0,
                newTourGuidesThisMonth: 0,
                newShopsThisMonth: 0,
                newPostsThisMonth: 0,
                revenueByShop: []
            };
        }
    }

    // Specialty Shop Management
    async getSpecialtyShops({
        pageIndex = 0,
        pageSize = 10,
        includeInactive = false,
        searchTerm = ''
    }: {
        pageIndex?: number;
        pageSize?: number;
        includeInactive?: boolean;
        searchTerm?: string;
    } = {}): Promise<{
        shops: any[];
        totalCount: number;
        pageIndex: number;
        pageSize: number;
        isSuccess: boolean;
        message: string;
    }> {
        try {
            const params: any = {
                pageIndex,
                pageSize,
                includeInactive
            };

            if (searchTerm) {
                params.searchTerm = searchTerm;
            }

            const response = await axios.get<{
                data: any[];
                isSuccess: boolean;
                statusCode: number;
                message: string;
                success: boolean;
                validationErrors: any[];
            }>('/SpecialtyShop', { params });

            // Validate response structure
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid response format from server');
            }

            const shops = Array.isArray(response.data.data) ? response.data.data : [];

            return {
                shops: shops,
                totalCount: shops.length, // API might not provide total count, using array length
                pageIndex: pageIndex,
                pageSize: pageSize,
                isSuccess: response.data.isSuccess || false,
                message: response.data.message || 'Retrieved shops successfully'
            };

        } catch (error) {
            console.error('Error fetching specialty shops:', error);
            this.handleError(error, 'Error fetching specialty shops');

            // Return default values on error
            return {
                shops: [],
                totalCount: 0,
                pageIndex: pageIndex || 0,
                pageSize: pageSize || 10,
                isSuccess: false,
                message: 'Failed to fetch shops'
            };
        }
    }

    // Tour Guide Management
    async getTourGuides(params: {
        pageIndex?: number;
        pageSize?: number;
        includeInactive?: boolean;
        searchTerm?: string;
    } = {}) {
        try {
            const {
                pageIndex = 0,
                pageSize = 10,
                includeInactive = false,
                searchTerm = ''
            } = params;

            const queryParams = new URLSearchParams({
                pageIndex: pageIndex.toString(),
                pageSize: pageSize.toString(),
                includeInactive: includeInactive.toString(),
                ...(searchTerm && { searchTerm })
            });

            const response = await axios.get(`/Account/guides?${queryParams}`);

            return {
                isSuccess: true,
                tourGuides: response.data.data || response.data || [],
                totalCount: response.data.totalCount || response.data.length || 0,
                message: 'Lấy danh sách hướng dẫn viên thành công'
            };
        } catch (error: any) {
            console.error('Error fetching tour guides:', error);
            return {
                isSuccess: false,
                tourGuides: [],
                totalCount: 0,
                message: error?.response?.data?.message || 'Không thể lấy danh sách hướng dẫn viên'
            };
        }
    }
}

export const adminService = new AdminService();
export default adminService;
