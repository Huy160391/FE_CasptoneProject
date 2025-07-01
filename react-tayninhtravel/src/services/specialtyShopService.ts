import axios from '../config/axios';
import { Product, GetProductsParams, GetProductsResponse } from '../types';

// Interface cho dữ liệu tạo/cập nhật sản phẩm
export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    quantityInStock: number;
    imageUrl: string[];
    category: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    // Có thể cập nhật các field khác nếu cần
}

// Thêm sản phẩm mới
export const createProduct = async (data: CreateProductData, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/Product/Product', data, { headers });
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

// Cập nhật sản phẩm
export const updateProduct = async (id: string, data: UpdateProductData, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/Product/Product/${id}`, data, { headers });
    return response.data;
};

// Xóa sản phẩm
export const deleteProduct = async (id: string, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/Product/Product/${id}`, { headers });
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