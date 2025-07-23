/**
 * Utility functions for handling retry logic and error recovery
 */

export interface RetryOptions {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    timeout?: number;
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: number;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const {
        maxRetries = 3,
        delay = 1000,
        backoff = true,
        timeout = 10000
    } = options;

    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Add timeout to the function call
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            );
            
            const result = await Promise.race([fn(), timeoutPromise]);
            
            return {
                success: true,
                data: result,
                attempts: attempt
            };
        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
            
            // Don't wait after the last attempt
            if (attempt < maxRetries) {
                const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    return {
        success: false,
        error: lastError!,
        attempts: maxRetries
    };
}

/**
 * Retry specifically for payment callbacks with appropriate error messages
 */
export async function retryPaymentCallback<T>(
    callbackFn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const defaultOptions: RetryOptions = {
        maxRetries: 3,
        delay: 2000,
        backoff: false,
        timeout: 10000,
        ...options
    };
    
    return retryWithBackoff(callbackFn, defaultOptions);
}

/**
 * Get user-friendly error message for payment failures
 */
export function getPaymentErrorMessage(error: Error, attempts: number): string {
    if (error.message === 'Request timeout') {
        return 'Kết nối bị timeout. Thanh toán có thể đã được xử lý thành công. Vui lòng kiểm tra lịch sử đặt tour.';
    }
    
    if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
    }
    
    if (attempts >= 3) {
        return 'Không thể xử lý thanh toán sau nhiều lần thử. Vui lòng liên hệ hỗ trợ nếu tiền đã được trừ.';
    }
    
    return error.message || 'Có lỗi xảy ra khi xử lý thanh toán';
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
    const retryableErrors = [
        'Request timeout',
        'Network Error',
        'ERR_NETWORK',
        'ECONNABORTED',
        'ENOTFOUND',
        'ECONNRESET'
    ];
    
    return retryableErrors.some(retryableError => 
        error.message.includes(retryableError)
    );
}

/**
 * Create a timeout promise
 */
export function createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), ms)
    );
}

/**
 * Wrap a promise with timeout
 */
export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        createTimeoutPromise(ms)
    ]);
}
