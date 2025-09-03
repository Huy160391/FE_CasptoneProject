import { message, notification } from 'antd';
import { AxiosError } from 'axios';

// Backend error response interface
interface BackendErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors?: Record<string, string>;
}

// Error severity levels
enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error type mapping
const ERROR_TYPE_MAP: Record<number, ErrorSeverity> = {
  400: ErrorSeverity.WARNING,  // Bad Request
  401: ErrorSeverity.CRITICAL, // Unauthorized
  403: ErrorSeverity.WARNING,  // Forbidden
  404: ErrorSeverity.INFO,     // Not Found
  409: ErrorSeverity.WARNING,  // Conflict
  429: ErrorSeverity.WARNING,  // Rate Limited
  500: ErrorSeverity.ERROR,    // Internal Server Error
  502: ErrorSeverity.ERROR,    // Bad Gateway
  503: ErrorSeverity.ERROR,    // Service Unavailable
  504: ErrorSeverity.ERROR     // Gateway Timeout
};

// Default error messages in Vietnamese
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Có xung đột dữ liệu. Vui lòng thử lại.',
  429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  502: 'Không thể kết nối đến server.',
  503: 'Dịch vụ tạm thời không khả dụng.',
  504: 'Kết nối đến server bị timeout.'
};

// Network error messages
const NETWORK_ERROR_MESSAGES = {
  ECONNABORTED: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
  ERR_NETWORK: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
  ERR_CANCELED: 'Yêu cầu đã bị hủy.',
  ERR_BAD_REQUEST: 'Yêu cầu không hợp lệ.',
  ERR_BAD_RESPONSE: 'Phản hồi từ server không hợp lệ.'
};

// Context-specific error handlers
const CONTEXT_ERROR_HANDLERS: Record<string, (error: BackendErrorResponse) => void> = {
  '/tour-booking': (error) => {
    if (error.statusCode === 409) {
      notification.warning({
        message: 'Lỗi đặt tour',
        description: 'Tour slot đã được booking bởi người khác, vui lòng thử lại',
        duration: 5
      });
    } else if (error.message.includes('Tour slot không khả dụng')) {
      notification.warning({
        message: 'Tour không khả dụng',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Tour đã khởi hành')) {
      notification.error({
        message: 'Tour đã khởi hành',
        description: 'Không thể đặt tour đã khởi hành',
        duration: 5
      });
    } else if (error.message.includes('chỗ trống')) {
      notification.warning({
        message: 'Không đủ chỗ trống',
        description: error.message,
        duration: 5
      });
    }
  },
  '/payment': (error) => {
    if (error.statusCode === 500) {
      notification.error({
        message: 'Lỗi thanh toán',
        description: 'PayOS service không khả dụng. Vui lòng thử lại sau.',
        duration: 5
      });
    } else if (error.message.includes('Phiên thanh toán đã hết hạn')) {
      notification.warning({
        message: 'Phiên thanh toán hết hạn',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Số tiền thanh toán không hợp lệ')) {
      notification.error({
        message: 'Lỗi thanh toán',
        description: error.message,
        duration: 5
      });
    }
  },
  '/withdrawal': (error) => {
    if (error.message.includes('Số dư không đủ')) {
      notification.warning({
        message: 'Không thể rút tiền',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Số tiền rút tối thiểu')) {
      notification.warning({
        message: 'Số tiền không hợp lệ',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('yêu cầu rút tiền đang chờ')) {
      notification.info({
        message: 'Yêu cầu đang xử lý',
        description: error.message,
        duration: 5
      });
    }
  },
  '/authentication': (error) => {
    if (error.message.includes('Email hoặc mật khẩu không đúng')) {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Email đã được sử dụng')) {
      notification.warning({
        message: 'Email đã tồn tại',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Tài khoản chưa được xác thực')) {
      notification.warning({
        message: 'Tài khoản chưa xác thực',
        description: error.message,
        duration: 5
      });
    }
  },
  '/otp': (error) => {
    if (error.message.includes('Mã OTP không đúng')) {
      notification.error({
        message: 'OTP không đúng',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Mã OTP đã hết hạn')) {
      notification.warning({
        message: 'OTP hết hạn',
        description: error.message,
        duration: 5
      });
    }
  },
  '/tour': (error) => {
    if (error.message.includes('Tour không tồn tại')) {
      notification.error({
        message: 'Tour không tìm thấy',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Tour không còn hoạt động')) {
      notification.warning({
        message: 'Tour không khả dụng',
        description: error.message,
        duration: 5
      });
    }
  },
  '/TourCompany/template': (error) => {
    if (error.message.includes('Template đã tồn tại') || error.message.includes('đã có template')) {
      notification.warning({
        message: 'Template đã tồn tại',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Tháng và năm đã có template')) {
      notification.warning({
        message: 'Thời gian không hợp lệ',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Dữ liệu không hợp lệ')) {
      notification.error({
        message: 'Dữ liệu không hợp lệ',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('scheduleDays')) {
      notification.error({
        message: 'Ngày trong tuần không hợp lệ',
        description: 'Chỉ chấp nhận Thứ 7 (6) hoặc Chủ nhật (0)',
        duration: 5
      });
    } else if (error.message.includes('templateType')) {
      notification.error({
        message: 'Loại tour không hợp lệ',
        description: 'Vui lòng chọn loại tour hợp lệ',
        duration: 5
      });
    } else if (error.statusCode === 400) {
      notification.error({
        message: 'Dữ liệu không hợp lệ',
        description: error.message || 'Vui lòng kiểm tra lại thông tin đã nhập',
        duration: 5
      });
    } else if (error.statusCode === 409) {
      notification.warning({
        message: 'Xung đột dữ liệu',
        description: error.message,
        duration: 5
      });
    }
  },
  '/upload': (error) => {
    if (error.message.includes('File vượt quá dung lượng')) {
      notification.error({
        message: 'File quá lớn',
        description: error.message,
        duration: 5
      });
    } else if (error.message.includes('Chỉ chấp nhận file ảnh')) {
      notification.error({
        message: 'Định dạng file không hỗ trợ',
        description: error.message,
        duration: 5
      });
    }
  }
};

/**
 * Main error handler for API responses
 */
export const handleApiError = (error: AxiosError, showNotification = true): BackendErrorResponse => {
  // Extract error details
  const status = error.response?.status || 0;
  const errorData = error.response?.data as BackendErrorResponse;
  const requestUrl = error.config?.url || '';

  // Build error response
  const errorResponse: BackendErrorResponse = {
    success: false,
    statusCode: status,
    message: '',
    errors: errorData?.errors
  };

  // Handle network errors
  if (error.code && error.code in NETWORK_ERROR_MESSAGES) {
    errorResponse.message = NETWORK_ERROR_MESSAGES[error.code as keyof typeof NETWORK_ERROR_MESSAGES];
    if (showNotification) {
      message.error(errorResponse.message);
    }
    return errorResponse;
  }

  // Use backend message if available (prioritize backend messages)
  if (errorData?.message) {
    errorResponse.message = errorData.message;
  } else {
    // Fallback to default message
    errorResponse.message = DEFAULT_ERROR_MESSAGES[status] || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }

  // Apply context-specific handlers first (they may override default notifications)
  let contextHandled = false;
  Object.keys(CONTEXT_ERROR_HANDLERS).forEach(context => {
    if (requestUrl.includes(context)) {
      CONTEXT_ERROR_HANDLERS[context](errorResponse);
      contextHandled = true;
    }
  });

  // Show notification based on severity only if not handled by context handlers
  if (showNotification && !contextHandled) {
    const severity = ERROR_TYPE_MAP[status] || ErrorSeverity.ERROR;

    switch (severity) {
      case ErrorSeverity.INFO:
        message.info(errorResponse.message);
        break;
      case ErrorSeverity.WARNING:
        message.warning(errorResponse.message);
        break;
      case ErrorSeverity.ERROR:
        message.error(errorResponse.message);
        break;
      case ErrorSeverity.CRITICAL:
        message.error(errorResponse.message);
        // Handle critical errors (e.g., redirect to login)
        if (status === 401) {
          setTimeout(() => {
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('auth-storage');

            // Redirect to login
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 1500);
        }
        break;
    }
  }

  // Handle special status codes
  if (status === 401 && showNotification) {
    // Always handle 401 regardless of context
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth-storage');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 1500);
  }

  return errorResponse;
};

/**
 * Handle form validation errors from backend
 */
export const handleValidationErrors = (
  errors: Record<string, string> | undefined,
  form: any
): void => {
  if (!errors || typeof errors !== 'object') return;

  const formErrors = Object.entries(errors).map(([field, message]) => ({
    name: field,
    errors: [message]
  }));

  form.setFields(formErrors);
};

/**
 * Retry handler for failed requests
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry for client errors (4xx)
      if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

/**
 * Extract user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as BackendErrorResponse;
    return errorData?.message || DEFAULT_ERROR_MESSAGES[error.response?.status || 500] || 'Có lỗi xảy ra';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Có lỗi không xác định xảy ra';
};

/**
 * Log error for debugging (development only)
 */
export const logError = (error: any, context?: string): void => {
  if (import.meta.env.DEV) {
    console.group(`🔴 Error ${context ? `in ${context}` : ''}`);

    if (error instanceof AxiosError) {
      console.error('Status:', error.response?.status);
      console.error('Message:', getErrorMessage(error));
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method);
      console.error('Data:', error.response?.data);
    } else {
      console.error('Error:', error);
    }

    console.groupEnd();
  }
};

/**
 * Error fallback component props interface
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export default {
  handleApiError,
  handleValidationErrors,
  retryRequest,
  getErrorMessage,
  logError
};
