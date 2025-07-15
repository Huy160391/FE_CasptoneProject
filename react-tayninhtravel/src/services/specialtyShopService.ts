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
        status
    } = params;

    const queryParams: any = {
        pageIndex,
        pageSize,
        textSearch
    };

    // Thêm các tham số tùy chọn nếu có giá trị
    if (status !== undefined) queryParams.status = status;

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

// Lấy số dư ví của shop
export const getWalletBalance = async (shopId: string, token?: string): Promise<number> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/ShopWallet/${shopId}/balance`, { headers });
    // API trả về { balance: number }
    return response.data?.balance ?? 0;
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

// Rút tiền từ ví
export const withdrawMoney = async (shopId: string, amount: number, token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = { shopId, amount };
    const response = await axios.post(`/ShopWallet/${shopId}/withdraw`, body, { headers });
    return response.data;
};