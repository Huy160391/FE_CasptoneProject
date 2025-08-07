// Voucher related types
export interface Voucher {
    id: string
    name: string
    description: string
    quantity: number
    usedCount: number
    remainingCount: number
    discountAmount?: number | null
    discountPercent?: number | null
    startDate: string
    endDate: string
    isActive: boolean
    isExpired?: boolean
    createdAt?: string
    isExpiringSoon?: boolean
}

export interface CreateVoucherRequest {
    name: string
    description: string
    quantity: number
    discountAmount?: number | null
    discountPercent?: number | null
    startDate: string
    endDate: string
}

export interface UpdateVoucherRequest {
    name: string
    description: string
    quantity: number
    discountAmount?: number | null
    discountPercent?: number | null
    startDate: string
    endDate: string
    isActive: boolean
}

export interface VoucherApiResponse<T = any> {
    statusCode: number
    message: string
    success: boolean
    data?: T
    totalRecord?: number
    totalPages?: number
}

export interface VoucherListResponse {
    statusCode: number
    message: string
    success: boolean
    data: Voucher[]
    totalRecord: number
    totalPages: number
}

export interface CreateVoucherResponse {
    statusCode: number
    message: string
    success: boolean
    voucherId: string
    voucherName: string
    quantity: number
}

export interface CheckoutRequest {
    cartItemIds: string[]
    voucherId?: string | null
}

export interface CheckoutResponse {
    checkoutUrl: string
    orderId: string
    totalOriginal: number
    discountAmount: number
    totalAfterDiscount: number
}

export type VoucherStatus = 'active' | 'inactive' | 'expired' | 'upcoming'
export type DiscountType = 'amount' | 'percent'
