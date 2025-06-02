import axios from '@/config/axios';

// Actual API response structure
export interface ApiUser {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    avatar: string;
    isVerified: boolean;
    isActive: boolean;
    role?: string;
    createdAt: string;
    updatedAt: string;
}

// API response for pagination
export interface ApiGetUsersResponse {
    data: ApiUser[];
    totalPages: number;
    totalRecord: number;
    page: number;
    pageSize: number;
}

// Application interface used throughout the app
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: boolean;
    avatar?: string;
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetUsersResponse {
    data: User[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: boolean;
}

// Map to API payload format
interface ApiUpdateUserPayload {
    name?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    status?: boolean;
}

export interface CreateUserPayload extends UpdateUserPayload {
    password: string;
}

/**
 * Service handling user management API operations
 */
export const userService = {    /**
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
    },/**
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
    },    /**
     * Get a specific user by ID
     * @param id User ID
     * @returns Promise with user data
     */
    getUserById: async (id: string): Promise<User> => {
        const response = await axios.get<ApiUser>(`/Cms/user/${id}`);
        return userService.mapApiUserToUser(response.data);
    },    /**
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
    },/**
     * Delete a user
     * @param id User ID
     * @returns Promise with operation result
     */
    deleteUser: async (id: string): Promise<void> => {
        await axios.delete(`/Cms/user/${id}`);
    },    /**
     * Toggle user active/inactive status
     * @param id User ID
     * @param status New status (true = active, false = inactive)
     * @returns Promise with updated user data
     */
    toggleUserStatus: async (id: string, status: boolean): Promise<User> => {
        const response = await axios.patch<ApiUser>(`/Cms/user/${id}/status`, { status });
        return userService.mapApiUserToUser(response.data);
    },    /**
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
    }
};

// Also export as default
export default userService;
