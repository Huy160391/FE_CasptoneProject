import axios from '../config/axios';
import { Product, GetProductsParams, GetProductsResponse } from '../types';

// Interface cho dữ liệu tạo/cập nhật sản phẩm
export interface CreateProductData {
    Name: string;
    Description: string;
    Price: number;
    QuantityInStock: number;
    Files: string[];
    Category: string;
    IsSale?: boolean;
    SalePercent?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    // Có thể cập nhật các field khác nếu cần
}

// Thêm sản phẩm mới - luôn sử dụng FormData theo yêu cầu của API
export const createProduct = async (data: FormData | CreateProductData, token?: string) => {
    // Thêm Content-Type: multipart/form-data vào header
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    // Không thêm Content-Type khi dùng FormData, axios sẽ tự thêm với boundary đúng

    // Nếu data không phải là FormData, chuyển đổi nó thành FormData
    if (!(data instanceof FormData)) {
        const formData = new FormData();

        // Thêm các trường dữ liệu từ đối tượng JSON vào FormData
        formData.append('Name', data.Name || '');
        formData.append('Description', data.Description || '');
        formData.append('Price', String(data.Price || 0));
        formData.append('QuantityInStock', String(data.QuantityInStock || 0));
        formData.append('Category', String(data.Category || ''));
        formData.append('IsSale', String(data.IsSale || false));

        if (data.IsSale && data.SalePercent) {
            formData.append('SalePercent', String(data.SalePercent));
        }

        // Files phải là mảng các URL hoặc mảng rỗng
        if (data.Files && Array.isArray(data.Files)) {
            data.Files.forEach(fileUrl => {
                formData.append('ExistingImageUrls', fileUrl);
            });
        }

        data = formData;
    }


    const response = await axios.post('/Product/Product', data, {
        headers,
    });
    return response.data;
};

// Lấy danh sách sản phẩm
export const getProducts = async (params: GetProductsParams = {}, token?: string): Promise<GetProductsResponse> => {
    const {
        pageIndex = 1,
        pageSize = 10,
        textSearch = '',
        status,
        sortBySoldCount
    } = params;

    const queryParams: any = {
        pageIndex,
        pageSize,
        textSearch
    };

    // Thêm các tham số tùy chọn nếu có giá trị
    if (status !== undefined) queryParams.status = status;
    if (sortBySoldCount !== undefined) queryParams.sortBySoldCount = sortBySoldCount;

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/Product/Product', { params: queryParams, headers });
    return response.data;
};

// Lấy sản phẩm theo ID
export const getProductById = async (id: string, token?: string): Promise<Product | null> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        const response = await axios.get(`/Product/Product/${id}`, { headers });
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

// Cập nhật sản phẩm - luôn sử dụng FormData theo yêu cầu của API
export const updateProduct = async (id: string, data: FormData | UpdateProductData, token?: string) => {
    // Thêm Content-Type: multipart/form-data vào header
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    // Không thêm Content-Type khi dùng FormData, axios sẽ tự thêm với boundary đúng

    // Nếu data không phải là FormData, chuyển đổi nó thành FormData
    if (!(data instanceof FormData)) {
        const formData = new FormData();

        // Thêm ID vào FormData
        formData.append('Id', id);

        // Thêm các trường dữ liệu từ đối tượng JSON vào FormData
        if (data.Name !== undefined) formData.append('Name', data.Name);
        if (data.Description !== undefined) formData.append('Description', data.Description);
        if (data.Price !== undefined) formData.append('Price', String(data.Price));
        if (data.QuantityInStock !== undefined) formData.append('QuantityInStock', String(data.QuantityInStock));
        if (data.Category !== undefined) formData.append('Category', String(data.Category));

        // Boolean cần chuyển sang string "true"/"false"
        if (data.IsSale !== undefined) formData.append('IsSale', String(data.IsSale));
        if (data.SalePercent !== undefined) formData.append('SalePercent', String(data.SalePercent));

        // Files phải là mảng các URL hoặc mảng rỗng
        if (data.Files && Array.isArray(data.Files)) {
            data.Files.forEach(fileUrl => {
                formData.append('ExistingImageUrls', fileUrl);
            });
        }

        data = formData;
    }

    // Log trước khi gửi

    const response = await axios.put(`/Product/Product/${id}`, data, {
        headers,
    });
    return response.data;
};

// Cập nhật trạng thái kích hoạt sản phẩm
export const toggleProductStatus = async (id: string, isActive: boolean, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/Product/Product/${id}/status`, { isActive }, { headers });
    return response.data;
};

// Cập nhật số lượng tồn kho
export const updateProductStock = async (id: string, quantityInStock: number, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/Product/Product/${id}/stock`, { quantityInStock }, { headers });
    return response.data;
};

// Lấy sản phẩm nổi bật
export const getFeaturedProducts = async (limit: number = 10, token?: string): Promise<Product[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/Product/Product/featured', {
        params: { limit },
        headers
    });
    return response.data.data || response.data;
};

// Tìm kiếm sản phẩm
export const searchProducts = async (searchTerm: string, params: GetProductsParams = {}, token?: string): Promise<GetProductsResponse> => {
    return getProducts({ ...params, textSearch: searchTerm }, token);
};

// Xóa sản phẩm
export const deleteProduct = async (id: string, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/Product/Product/${id}`, { headers });
    return response.data;
};

// ==================== DASHBOARD APIs ====================

// Interface cho dashboard data
export interface DashboardData {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    wallet: number;
    averageProductRating: number;
    totalProductRatings: number;
    shopAverageRating: number;
}

// Lấy data dashboard cho specialty shop
export const getDashboardData = async (year: number, month: number, token?: string): Promise<DashboardData> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
        const params = {
            year,
            month
        };

        console.log('Calling /SpecialtyShop/Dashboard with params:', params);

        const response = await axios.get('/SpecialtyShop/Dashboard', { params, headers });

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

        // Validate and return with default values if needed
        return {
            totalProducts: actualData?.totalProducts || 0,
            totalOrders: actualData?.totalOrders || 0,
            totalRevenue: actualData?.totalRevenue || 0,
            wallet: actualData?.wallet || 0,
            averageProductRating: actualData?.averageProductRating || 0,
            totalProductRatings: actualData?.totalProductRatings || 0,
            shopAverageRating: actualData?.shopAverageRating || 0
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);

        // Log the error details
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
        }

        // Return default values on error - same as admin and blogger pattern
        return {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            wallet: 0,
            averageProductRating: 0,
            totalProductRatings: 0,
            shopAverageRating: 0
        };
    }
};

// Interface cho detailed dashboard data (nếu cần thêm thông tin chi tiết)
export interface DetailedDashboardData extends DashboardData {
    activeProducts?: number;
    inactiveProducts?: number;
    pendingOrders?: number;
    completedOrders?: number;
    monthlyRevenue?: number;
    topSellingProducts?: Array<{
        id: string;
        name: string;
        soldQuantity: number;
        revenue: number;
        imageUrl?: string;
    }>;
    recentOrders?: Array<{
        id: string;
        userId: string;
        totalAmount: number;
        status: string;
        payOsOrderCode: string;
        createdAt: string;
    }>;
    monthlyStats?: Array<{
        month: string;
        revenue: number;
        orders: number;
    }>;
}

// Lấy sản phẩm bán chạy nhất
export const getTopSellingProducts = async (limit: number = 5, token?: string): Promise<Array<{
    id: string;
    name: string;
    soldQuantity: number;
    revenue: number;
    imageUrl: string;
}>> => {
    try {
        console.log('Calling getProducts with sortBySoldCount for top selling products, limit:', limit);

        // Sử dụng hàm getProducts đã có với thêm param sortBySoldCount
        const response = await getProducts({
            pageIndex: 1,
            pageSize: limit,
            sortBySoldCount: 'desc' // Sắp xếp theo số lượng bán giảm dần
        }, token);

        console.log('Top selling products response:', response);

        // Lấy data từ response
        const products = response.data || [];

        // Chuyển đổi format để match với interface yêu cầu
        const topSellingProducts = products.map(product => ({
            id: product.id || '',
            name: product.name || '',
            soldQuantity: product.soldCount || 0, // Sử dụng soldCount thay vì soldQuantity
            revenue: (product.soldCount || 0) * (product.price || 0), // Tính revenue từ soldCount * price
            imageUrl: Array.isArray(product.imageUrl) && product.imageUrl.length > 0
                ? product.imageUrl[0]
                : ''
        }));

        return topSellingProducts;
    } catch (error) {
        console.error('Error fetching top selling products:', error);

        // Log error details
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
        }

        return [];
    }
};

// Lấy thống kê theo tháng
export const getMonthlyStats = async (year: number, month: number, token?: string): Promise<Array<{
    month: string;
    revenue: number;
    orders: number;
    products: number;
}>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        const params = {
            year,
            month
        };

        console.log('Calling /SpecialtyShop/monthly-stats with params:', params);

        const response = await axios.get('/SpecialtyShop/monthly-stats', {
            params,
            headers
        });

        console.log('Monthly stats response:', response.data);

        // Handle response structure similar to admin/blogger pattern
        let actualData = response.data;
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            actualData = response.data.data;
        }

        // Return array or empty array if no data
        return Array.isArray(actualData) ? actualData : [];
    } catch (error) {
        console.error('Error fetching monthly stats:', error);

        // Log error details
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
        }

        return [];
    }
};

// Lấy đơn hàng gần đây
export const getRecentOrders = async (limit: number = 5, token?: string): Promise<ShopOrder[]> => {
    try {
        console.log('Calling getShopOrders for recent orders with limit:', limit);

        // Sử dụng hàm getShopOrders với pageSize = limit để lấy đơn hàng gần đây
        const response = await getShopOrders({
            pageIndex: 1,
            pageSize: limit,
            status: true // Luôn true theo yêu cầu
        }, token);

        console.log('Recent orders response:', response);

        // Trả về data từ response
        return response.data || [];
    } catch (error) {
        console.error('Error fetching recent orders:', error);

        // Log error details
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
        }

        return [];
    }
};

// Lấy thống kê tổng quan
export const getOverviewStats = async (year: number, month: number, token?: string): Promise<{
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
}> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        const params = {
            year,
            month
        };

        console.log('Calling /SpecialtyShop/overview-stats with params:', params);

        const response = await axios.get('/SpecialtyShop/overview-stats', { params, headers });

        console.log('Overview stats response:', response.data);

        // Handle response structure similar to admin/blogger pattern
        let actualData = response.data;
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            actualData = response.data.data;
        }

        // Validate and return with default values
        return {
            totalProducts: actualData?.totalProducts || 0,
            activeProducts: actualData?.activeProducts || 0,
            totalOrders: actualData?.totalOrders || 0,
            completedOrders: actualData?.completedOrders || 0,
            totalRevenue: actualData?.totalRevenue || 0,
            monthlyRevenue: actualData?.monthlyRevenue || 0
        };
    } catch (error) {
        console.error('Error fetching overview stats:', error);

        // Log error details
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
        }

        // Return default values on error - same as admin pattern
        return {
            totalProducts: 0,
            activeProducts: 0,
            totalOrders: 0,
            completedOrders: 0,
            totalRevenue: 0,
            monthlyRevenue: 0
        };
    }
};

// Lấy số dư ví của shop
export const getWalletBalance = async (shopId: string, token?: string): Promise<number> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/ShopWallet/${shopId}/balance`, { headers });
    // API trả về { balance: number }
    return response.data?.balance ?? 0;
};

// ==================== ORDER APIs ====================

// Interface cho đơn hàng
export interface ShopOrder {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhoneNumber: string;
    totalAmount: number;
    discountAmount: number;
    totalAfterDiscount: number;
    status: string; // Pending, Paid, Cancelled
    voucherCode: string | null;
    payOsOrderCode: string;
    isChecked: boolean;
    checkedAt: string | null;
    checkedByShopId: string | null;
    createdAt: string;
    orderDetails: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        imageUrl: string | null;
        shopId: string;
        shopName?: string | null;
        shopEmail?: string | null;
        shopType?: string | null;
        rating?: number | null;
    }>;
}

// Lấy danh sách đơn hàng của shop
export const getShopOrders = async (params: {
    pageIndex?: number;
    pageSize?: number;
    payOsOrderCode?: string;
    status?: boolean; // Luôn để true theo yêu cầu
    isChecked?: boolean; // Đã nhận hàng hay chưa
    orderStatus?: 'Pending' | 'Paid' | 'Cancelled'; // Status của đơn hàng (theo response thực tế)
} = {}, token?: string): Promise<{ data: ShopOrder[]; totalCount: number; totalRecord?: number; totalPages?: number; pageIndex?: number; pageSize?: number }> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Tạo query params với các tham số mới
    const queryParams: any = {
        pageIndex: params.pageIndex || 1,
        pageSize: params.pageSize || 10,
        status: params.status !== undefined ? params.status : true // Mặc định true như yêu cầu
    };

    // Thêm các tham số tùy chọn nếu có
    if (params.payOsOrderCode) queryParams.payOsOrderCode = params.payOsOrderCode;
    if (params.isChecked !== undefined) queryParams.isChecked = params.isChecked;
    if (params.orderStatus) queryParams.orderStatus = params.orderStatus;

    console.log('Calling Product/GetOrder-ByShop with params:', queryParams);

    try {
        const response = await axios.get('/Product/GetOrder-ByCurrentShop', { params: queryParams, headers });

        console.log('Shop orders response:', response.data);

        // Handle response structure based on actual API format
        let orders = [];
        let totalCount = 0;
        let totalPages = 0;
        let pageIndex = queryParams.pageIndex;
        let pageSize = queryParams.pageSize;

        // Handle the specific response format from API
        if (response.data && typeof response.data === 'object') {
            // Response format: { statusCode, message, success, data, totalPages, totalRecord, totalCount, pageIndex, pageSize }
            orders = Array.isArray(response.data.data) ? response.data.data : [];
            totalCount = response.data.totalRecord || response.data.totalCount || 0;
            totalPages = response.data.totalPages || 0;
            // API trả về pageIndex và pageSize là null, sử dụng giá trị từ queryParams
            pageIndex = response.data.pageIndex || queryParams.pageIndex;
            pageSize = response.data.pageSize || queryParams.pageSize;
        }

        return {
            data: orders,
            totalCount,
            totalPages,
            pageIndex,
            pageSize
        };
    } catch (error) {
        console.error('Error fetching shop orders:', error);

        // Log error details
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
        }

        return {
            data: [],
            totalCount: 0,
            totalPages: 0,
            pageIndex: params.pageIndex || 1,
            pageSize: params.pageSize || 10
        };
    }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (orderId: string, token?: string): Promise<ShopOrder> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/SpecialtyShop/orders/${orderId}`, { headers });
    return response.data?.data || response.data;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: string, status: string, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/SpecialtyShop/orders/${orderId}/status`, { status }, { headers });
    return response.data;
};

// Xác nhận đơn hàng
export const confirmOrder = async (orderId: string, token?: string): Promise<any> => {
    return updateOrderStatus(orderId, 'Confirmed', token);
};

// Hủy đơn hàng
export const cancelOrder = async (orderId: string, reason: string, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/SpecialtyShop/orders/${orderId}/cancel`, { reason }, { headers });
    return response.data;
};

// Đánh dấu đơn hàng đã giao (deprecated - sử dụng markOrderAsReceived thay thế)
export const markOrderAsDelivered = async (orderId: string, token?: string): Promise<any> => {
    return updateOrderStatus(orderId, 'Delivered', token);
};

// Xác nhận khách hàng đã nhận hàng (API mới)
export const markOrderAsReceived = async (payOsOrderCode: string, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/Order/check', {
        payOsOrderCode: payOsOrderCode
    }, { headers });
    return response.data;
};

// Lấy lịch sử giao dịch ví
export const getWalletTransactions = async (shopId: string, params: { page?: number; pageSize?: number } = {}, token?: string): Promise<any[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/ShopWallet/${shopId}/transactions`, { params, headers });
    // API trả về mảng transaction
    return response.data?.data || response.data || [];
};

// Lấy lịch sử rút tiền
export const getWithdrawHistory = async (shopId: string, params: { page?: number; pageSize?: number } = {}, token?: string): Promise<any[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/ShopWallet/${shopId}/withdrawals`, { params, headers });
    // API trả về mảng withdrawal
    return response.data?.data || response.data || [];
};

// Rút tiền từ ví (deprecated - use withdrawal request instead)
export const withdrawMoney = async (shopId: string, amount: number, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = { shopId, amount };
    const response = await axios.post(`/ShopWallet/${shopId}/withdraw`, body, { headers });
    return response.data;
};

// ==================== BANK ACCOUNT APIs ====================

// Lấy danh sách tài khoản ngân hàng của user
export const getBankAccounts = async (token?: string): Promise<any[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/BankAccount/my-accounts', { headers });
    return response.data?.data || response.data || [];
};

// Tạo tài khoản ngân hàng mới
export const createBankAccount = async (data: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isDefault?: boolean;
}, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/BankAccount', data, { headers });
    return response.data;
};

// Cập nhật tài khoản ngân hàng
export const updateBankAccount = async (id: string, data: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    isDefault?: boolean;
}, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/BankAccount/${id}`, data, { headers });
    return response.data;
};

// Xóa tài khoản ngân hàng
export const deleteBankAccount = async (id: string, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/BankAccount/${id}`, { headers });
    return response.data;
};

// Đặt tài khoản ngân hàng làm mặc định
export const setDefaultBankAccount = async (id: string, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/BankAccount/${id}`, { isDefault: true }, { headers });
    return response.data;
};

// ==================== WITHDRAWAL REQUEST APIs ====================

// Tạo yêu cầu rút tiền
export const createWithdrawalRequest = async (data: {
    amount: number;
    bankAccountId: string;
}, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/WithdrawalRequest', data, { headers });
    return response.data;
};

// Lấy danh sách yêu cầu rút tiền của user
export const getMyWithdrawalRequests = async (params: {
    pageIndex?: number;
    pageSize?: number;
    status?: number;
} = {}, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/WithdrawalRequest/my-requests', { params, headers });
    return response.data;
};

// Lấy chi tiết yêu cầu rút tiền
export const getWithdrawalRequestById = async (id: string, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/WithdrawalRequest/${id}`, { headers });
    return response.data;
};

// Hủy yêu cầu rút tiền (nếu còn ở trạng thái Pending)
export const cancelWithdrawalRequest = async (id: string, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/WithdrawalRequest/${id}/cancel`, {}, { headers });
    return response.data;
};

// ==================== ADMIN WITHDRAWAL APIs ====================

// Lấy danh sách yêu cầu rút tiền (Admin)
export const getAdminWithdrawalRequests = async (params: {
    pageIndex?: number;
    pageSize?: number;
    status?: number;
    userId?: string;
    fromDate?: string;
    toDate?: string;
} = {}, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/Admin/WithdrawalRequests', { params, headers });
    return response.data;
};

// Duyệt yêu cầu rút tiền (Admin)
export const approveWithdrawalRequest = async (id: string, data: {
    adminNotes?: string;
} = {}, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/Admin/WithdrawalRequests/${id}/approve`, data, { headers });
    return response.data;
};

// Từ chối yêu cầu rút tiền (Admin)
export const rejectWithdrawalRequest = async (id: string, data: {
    adminNotes?: string;
} = {}, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/Admin/WithdrawalRequests/${id}/reject`, data, { headers });
    return response.data;
};