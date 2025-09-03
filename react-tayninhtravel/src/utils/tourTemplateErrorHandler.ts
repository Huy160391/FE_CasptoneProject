/**
 * Tour Template Error Handler Utilities
 * Xử lý và format các lỗi liên quan đến tour template
 */

export interface TourTemplateError {
    type: 'validation' | 'conflict' | 'permission' | 'network' | 'server' | 'unknown';
    message: string;
    details?: string[];
    field?: string;
    statusCode?: number;
}

/**
 * Parse API error response cho tour template
 */
export const parseTourTemplateError = (error: any): TourTemplateError => {
    const statusCode = error?.response?.status || 0;
    const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
    const errorData = error?.response?.data;

    // Parse validation errors từ backend
    const validationErrors: string[] = [];
    if (errorData?.errors && typeof errorData.errors === 'object') {
        Object.entries(errorData.errors).forEach(([field, message]) => {
            validationErrors.push(`${field}: ${message}`);
        });
    }

    // Xác định loại lỗi dựa trên message content và status code
    if (statusCode === 400) {
        if (errorMessage.includes('scheduleDays')) {
            return {
                type: 'validation',
                message: 'Ngày trong tuần không hợp lệ',
                details: ['Chỉ chấp nhận Thứ 7 (6) hoặc Chủ nhật (0)'],
                field: 'scheduleDays',
                statusCode
            };
        }

        if (errorMessage.includes('templateType')) {
            return {
                type: 'validation',
                message: 'Loại tour không hợp lệ',
                details: ['Chỉ chấp nhận: 1 (FreeScenic) hoặc 2 (PaidAttraction)'],
                field: 'templateType',
                statusCode
            };
        }

        if (errorMessage.includes('title')) {
            return {
                type: 'validation',
                message: 'Tên template không hợp lệ',
                details: ['Tên template không được để trống và phải có ít nhất 3 ký tự'],
                field: 'title',
                statusCode
            };
        }

        if (errorMessage.includes('month') || errorMessage.includes('year')) {
            return {
                type: 'validation',
                message: 'Thời gian không hợp lệ',
                details: [
                    'Tháng phải từ 1 đến 12',
                    'Năm phải từ 2024 đến 2030'
                ],
                field: 'time',
                statusCode
            };
        }

        return {
            type: 'validation',
            message: 'Dữ liệu không hợp lệ',
            details: validationErrors.length > 0 ? validationErrors : [errorMessage],
            statusCode
        };
    }

    if (statusCode === 409) {
        if (errorMessage.includes('Template đã tồn tại') || errorMessage.includes('đã có template')) {
            return {
                type: 'conflict',
                message: 'Template đã tồn tại',
                details: [
                    'Template với cùng tên hoặc cùng thời gian đã được tạo trước đó',
                    'Vui lòng thay đổi tên template hoặc chọn tháng/năm khác'
                ],
                statusCode
            };
        }

        return {
            type: 'conflict',
            message: 'Xung đột dữ liệu',
            details: [errorMessage],
            statusCode
        };
    }

    if (statusCode === 401) {
        return {
            type: 'permission',
            message: 'Phiên đăng nhập đã hết hạn',
            details: ['Vui lòng đăng nhập lại để tiếp tục'],
            statusCode
        };
    }

    if (statusCode === 403) {
        return {
            type: 'permission',
            message: 'Không có quyền thực hiện',
            details: ['Bạn không có quyền tạo hoặc chỉnh sửa tour template'],
            statusCode
        };
    }

    if (statusCode >= 500) {
        return {
            type: 'server',
            message: 'Lỗi server',
            details: [
                'Hệ thống đang gặp sự cố',
                'Vui lòng thử lại sau ít phút'
            ],
            statusCode
        };
    }

    if (statusCode === 0 || errorMessage.includes('Network Error')) {
        return {
            type: 'network',
            message: 'Lỗi kết nối',
            details: [
                'Không thể kết nối đến server',
                'Vui lòng kiểm tra kết nối mạng'
            ],
            statusCode
        };
    }

    return {
        type: 'unknown',
        message: errorMessage,
        details: validationErrors.length > 0 ? validationErrors : undefined,
        statusCode
    };
};

/**
 * Get user-friendly error messages for different scenarios
 */
export const getTourTemplateErrorMessages = (error: TourTemplateError) => {
    const baseMessages = {
        title: '',
        description: '',
        actionable: [] as string[]
    };

    switch (error.type) {
        case 'validation':
            baseMessages.title = 'Dữ liệu không hợp lệ';
            baseMessages.description = 'Vui lòng kiểm tra và sửa các thông tin sau:';
            baseMessages.actionable = [
                'Kiểm tra tất cả các trường bắt buộc đã được điền',
                'Đảm bảo định dạng dữ liệu đúng yêu cầu',
                'Xem chi tiết lỗi bên dưới'
            ];
            break;

        case 'conflict':
            baseMessages.title = 'Dữ liệu đã tồn tại';
            baseMessages.description = 'Template không thể tạo do trùng lặp dữ liệu:';
            baseMessages.actionable = [
                'Thay đổi tên template',
                'Chọn tháng/năm khác',
                'Kiểm tra danh sách template hiện có'
            ];
            break;

        case 'permission':
            baseMessages.title = 'Không có quyền truy cập';
            baseMessages.description = 'Bạn không thể thực hiện thao tác này:';
            baseMessages.actionable = [
                'Đăng nhập lại nếu phiên đã hết hạn',
                'Liên hệ quản trị viên để được cấp quyền',
                'Kiểm tra vai trò tài khoản'
            ];
            break;

        case 'network':
            baseMessages.title = 'Lỗi kết nối';
            baseMessages.description = 'Không thể kết nối đến server:';
            baseMessages.actionable = [
                'Kiểm tra kết nối internet',
                'Thử tải lại trang',
                'Liên hệ hỗ trợ kỹ thuật nếu vấn đề tiếp tục'
            ];
            break;

        case 'server':
            baseMessages.title = 'Lỗi hệ thống';
            baseMessages.description = 'Server đang gặp sự cố:';
            baseMessages.actionable = [
                'Thử lại sau vài phút',
                'Lưu dữ liệu tạm thời nếu có thể',
                'Liên hệ hỗ trợ kỹ thuật nếu lỗi kéo dài'
            ];
            break;

        default:
            baseMessages.title = 'Có lỗi xảy ra';
            baseMessages.description = error.message;
            baseMessages.actionable = [
                'Thử lại thao tác',
                'Kiểm tra dữ liệu nhập vào',
                'Liên hệ hỗ trợ nếu cần'
            ];
    }

    return baseMessages;
};

/**
 * Format validation errors cho form display
 */
export const formatValidationErrors = (error: TourTemplateError): Record<string, string[]> => {
    const formErrors: Record<string, string[]> = {};

    if (error.type === 'validation' && error.details) {
        error.details.forEach(detail => {
            if (detail.includes(':')) {
                const [field, message] = detail.split(':').map(s => s.trim());
                formErrors[field] = [message];
            } else if (error.field) {
                formErrors[error.field] = [detail];
            }
        });
    }

    return formErrors;
};

export default {
    parseTourTemplateError,
    getTourTemplateErrorMessages,
    formatValidationErrors
};
