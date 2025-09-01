import axiosInstance from '@/config/axios'
import { ApiResponse } from '../types'

// Interface for Shop Profile Data
export interface ShopProfileData {
    id: string;
    userId: string;
    shopName: string;
    description: string;
    location: string;
    representativeName: string;
    email: string;
    phoneNumber: string;
    website: string | null;
    businessLicense: string;
    businessLicenseUrl: string | null;
    logoUrl: string | null;
    shopType: string;
    openingHours: string;
    closingHours: string;
    rating: number;
    isShopActive: boolean;
    createdAt: string;
    updatedAt: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    userRole: string;
}

export class ProfileService {
    /**
     * Lấy thông tin shop hiện tại
     */
    async getMyShopProfile(): Promise<ApiResponse<ShopProfileData>> {
        const response = await axiosInstance.get('SpecialtyShop/my-shop')
        return response.data
    }

    /**
     * Lấy thông tin tour company hiện tại
     */
    async getMyTourCompanyProfile(): Promise<any> {
        const response = await axiosInstance.get('TourCompany/my-tour-company')
        return response.data
    }

    /**
     * Cập nhật profile cho shop
     * @param data dữ liệu cập nhật
     */
    async updateShopProfile(data: any): Promise<any> {
        const response = await axiosInstance.put('SpecialtyShop/my-shop', data)
        return response.data
    }

    /**
     * Cập nhật profile cho tour company
     * @param data dữ liệu cập nhật
     */
    async updateTourCompanyProfile(data: any): Promise<any> {
        const response = await axiosInstance.put('TourCompany/Update', data)
        return response.data
    }

    /**
     * Cập nhật logo cho shop
     * @param logoData dữ liệu logo (FormData hoặc object chứa logo)
     */
    async updateShopLogo(logoData: FormData): Promise<any> {
        const response = await axiosInstance.put('SpecialtyShop/update-logo', logoData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    }

    /**
     * Cập nhật logo cho tour company
     * @param logoData dữ liệu logo (FormData hoặc object chứa logo)
     */
    async updateTourCompanyLogo(logoData: FormData): Promise<any> {
        const response = await axiosInstance.put('TourCompany/update-tourcompany-logo', logoData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    }
}

export const profileService = new ProfileService()
