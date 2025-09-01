import axiosInstance from '@/config/axios'
import type {
    Voucher,
    CreateVoucherRequest,
    UpdateVoucherRequest,
    VoucherListResponse,
    VoucherApiResponse,
    CreateVoucherResponse,
    CheckoutRequest,
    CheckoutResponse
} from '@/types/voucher'

class VoucherService {
    private readonly baseURL = '/Product'

    // Admin APIs

    /**
     * Tạo voucher mới (Admin only)
     */
    async createVoucher(data: CreateVoucherRequest): Promise<CreateVoucherResponse> {
        const response = await axiosInstance.post(`${this.baseURL}/Create-Voucher`, data)
        return response.data
    }

    /**
     * Lấy tất cả voucher với phân trang và tìm kiếm (Admin only)
     */
    async getAllVouchers(
        pageIndex: number = 1,
        pageSize: number = 10,
        textSearch: string = '',
        status?: boolean
    ): Promise<VoucherListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
            textSearch: textSearch || ''
        })

        if (status !== undefined) {
            params.append('status', status.toString())
        }

        const response = await axiosInstance.get(`${this.baseURL}/GetAll-Voucher?${params}`)
        return response.data
    }

    /**
     * Cập nhật voucher (Admin only)
     */
    async updateVoucher(voucherId: string, data: UpdateVoucherRequest): Promise<any> {
        const response = await axiosInstance.put(`${this.baseURL}/Update-Voucher/${voucherId}`, data)
        return response.data
    }

    /**
     * Xóa voucher (Admin only)
     */
    async deleteVoucher(voucherId: string): Promise<any> {
        const response = await axiosInstance.delete(`${this.baseURL}/Voucher/${voucherId}`)
        return response.data
    }

    /**
     * Lấy thông tin voucher cụ thể
     */
    async getVoucherById(voucherId: string): Promise<VoucherApiResponse<Voucher>> {
        const response = await axiosInstance.get(`${this.baseURL}/GetVoucher/${voucherId}`)
        return response.data
    }

    // User APIs

    /**
     * Lấy danh sách voucher khả dụng cho user
     */
    async getAvailableVouchers(
        pageIndex: number = 1,
        pageSize: number = 10
    ): Promise<VoucherListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString()
        })

        const response = await axiosInstance.get(`${this.baseURL}/GetAvailable-Vouchers?${params}`)
        return response.data
    }

    /**
     * Checkout với voucher
     */
    async checkoutWithVoucher(data: CheckoutRequest): Promise<CheckoutResponse> {
        const response = await axiosInstance.post(`${this.baseURL}/checkout`, data)
        return response.data
    }

    /**
     * Lấy phần trăm giảm giá hiện tại cho khách du lịch đi tour
     */
    async getDiscountForVisitor(): Promise<{ discountPercent: number }> {
        const response = await axiosInstance.get('/Cms/discount-for-visitor')
        return response.data
    }

    /**
     * Cập nhật phần trăm giảm giá cho khách du lịch đi tour
     */
    async updateDiscountForVisitor(discountPercent: number): Promise<any> {
        const response = await axiosInstance.put('/Cms/discount-visitor', { discountPercent })
        return response.data
    }

    // Helper methods

    /**
     * Kiểm tra voucher có hợp lệ không
     */
    isVoucherValid(voucher: Voucher): boolean {
        const now = new Date()
        const startDate = new Date(voucher.startDate)
        const endDate = new Date(voucher.endDate)

        return (
            voucher.isActive &&
            !voucher.isExpired &&
            voucher.remainingCount > 0 &&
            now >= startDate &&
            now <= endDate
        )
    }

    /**
     * Tính số ngày còn lại của voucher
     */
    getDaysRemaining(voucher: Voucher): number {
        const now = new Date()
        const endDate = new Date(voucher.endDate)
        const diffTime = endDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return Math.max(0, diffDays)
    }

    /**
     * Format tiền tệ VND
     */
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    /**
     * Format ngày tháng
     */
    formatDate(dateString: string): string {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    /**
     * Lấy loại giảm giá của voucher
     */
    getDiscountType(voucher: Voucher): 'amount' | 'percent' {
        return voucher.discountAmount ? 'amount' : 'percent'
    }

    /**
     * Lấy giá trị giảm giá đã format
     */
    getFormattedDiscount(voucher: Voucher): string {
        if (voucher.discountAmount) {
            return this.formatCurrency(voucher.discountAmount)
        }
        if (voucher.discountPercent) {
            return `${voucher.discountPercent}%`
        }
        return '0'
    }

    /**
     * Validate dữ liệu voucher trước khi tạo/cập nhật
     */
    validateVoucherData(data: CreateVoucherRequest | UpdateVoucherRequest): string[] {
        const errors: string[] = []

        // Kiểm tra tên
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Tên voucher không được để trống')
        }

        // Kiểm tra mô tả
        if (!data.description || data.description.trim().length === 0) {
            errors.push('Mô tả voucher không được để trống')
        }

        // Kiểm tra số lượng
        if (!data.quantity || data.quantity < 1 || data.quantity > 10000) {
            errors.push('Số lượng voucher phải từ 1 đến 10,000')
        }

        // Kiểm tra loại giảm giá
        const hasDiscountAmount = data.discountAmount && data.discountAmount > 0
        const hasDiscountPercent = data.discountPercent && data.discountPercent > 0

        if (!hasDiscountAmount && !hasDiscountPercent) {
            errors.push('Phải có ít nhất một loại giảm giá (số tiền hoặc phần trăm)')
        }

        if (hasDiscountAmount && hasDiscountPercent) {
            errors.push('Không được có cả hai loại giảm giá cùng lúc')
        }

        // Kiểm tra giá trị giảm giá
        if (hasDiscountPercent && (data.discountPercent! < 1 || data.discountPercent! > 100)) {
            errors.push('Phần trăm giảm giá phải từ 1% đến 100%')
        }

        // Kiểm tra ngày tháng
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)

        if (startDate >= endDate) {
            errors.push('Ngày bắt đầu phải nhỏ hơn ngày kết thúc')
        }

        if (startDate < new Date()) {
            errors.push('Ngày bắt đầu không được trong quá khứ')
        }

        return errors
    }
}

export const voucherService = new VoucherService()
