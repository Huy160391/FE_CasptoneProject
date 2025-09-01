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
        description: 'Tour đã được người khác đặt. Vui lòng chọn slot khác.',
        duration: 5
      });
    }
  },
  '/payment': (error) => {
    if (error.statusCode === 500) {
      notification.error({
        message: 'Lỗi thanh toán',
        description: 'Hệ thống thanh toán đang gặp sự cố. Vui lòng thử lại sau.',
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

  // Use backend message if available
  if (errorData?.message) {
    errorResponse.message = errorData.message;
  } else {
    // Fallback to default message
    errorResponse.message = DEFAULT_ERROR_MESSAGES[status] || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }

  // Show notification based on severity
  if (showNotification) {
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

  // Apply context-specific handlers
  Object.keys(CONTEXT_ERROR_HANDLERS).forEach(context => {
    if (requestUrl.includes(context)) {
      CONTEXT_ERROR_HANDLERS[context](errorResponse);
    }
  });

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
 * Error boundary fallback component
 */
export const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h2 style={{ color: '#ff4d4f', marginBottom: '20px' }}>
        Đã xảy ra lỗi không mong muốn
      </h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        {getErrorMessage(error)}
      </p>
      <button
        onClick={resetError}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Thử lại
      </button>
      {import.meta.env.DEV && (
        <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
          <summary style={{ cursor: 'pointer', color: '#999' }}>
            Chi tiết lỗi (Development only)
          </summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '10px'
          }}>
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
};

export default {
  handleApiError,
  handleValidationErrors,
  retryRequest,
  getErrorMessage,
  logError,
  ErrorFallback
};
