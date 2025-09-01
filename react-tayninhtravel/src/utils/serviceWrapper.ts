import { AxiosError } from 'axios';
import { getErrorMessage } from './errorHandler';

/**
 * Service wrapper to standardize error handling across all API services
 */
export class ServiceWrapper {
  /**
   * Wrap an async service method with standardized error handling
   */
  static async handleRequest<T>(
    requestFn: () => Promise<T>,
    options?: {
      showError?: boolean;
      customErrorMessage?: string;
      retryOnError?: boolean;
      maxRetries?: number;
    }
  ): Promise<T> {
    const { 
      showError = false, // Error already shown by axios interceptor
      customErrorMessage,
      retryOnError = false,
      maxRetries = 3
    } = options || {};

    let lastError: any = null;
    let attempts = retryOnError ? maxRetries : 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;

        // Check if it's a retryable error
        if (retryOnError && attempt < attempts - 1) {
          const isRetryable = error.response?.status >= 500 || 
                             error.code === 'ERR_NETWORK' ||
                             error.code === 'ECONNABORTED';
          
          if (isRetryable) {
            // Wait with exponential backoff
            await new Promise(resolve => 
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
            continue;
          }
        }

        // Throw standardized error
        throw {
          message: customErrorMessage || 
                  error.standardizedError?.message || 
                  getErrorMessage(error),
          statusCode: error.standardizedError?.statusCode || 
                     error.response?.status || 
                     500,
          originalError: error,
          isNetworkError: error.code === 'ERR_NETWORK',
          isTimeout: error.code === 'ECONNABORTED',
          isAuthError: error.response?.status === 401,
          isForbidden: error.response?.status === 403,
          isNotFound: error.response?.status === 404,
          isValidationError: error.response?.status === 400,
          isConflict: error.response?.status === 409,
          isServerError: error.response?.status >= 500
        };
      }
    }

    throw lastError;
  }

  /**
   * Transform response data with error handling
   */
  static transformResponse<T, R>(
    response: T,
    transformer: (data: T) => R
  ): R {
    try {
      return transformer(response);
    } catch (error: any) {
      throw {
        message: 'Error transforming response data',
        originalError: error
      };
    }
  }

  /**
   * Handle paginated responses
   */
  static handlePaginatedResponse<T>(response: any): {
    items: T[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  } {
    if (response.success && response.data) {
      return {
        items: response.data.items || [],
        totalCount: response.data.totalCount || 0,
        pageIndex: response.data.pageIndex || 0,
        pageSize: response.data.pageSize || 10,
        totalPages: response.data.totalPages || 1
      };
    }

    return {
      items: [],
      totalCount: 0,
      pageIndex: 0,
      pageSize: 10,
      totalPages: 0
    };
  }

  /**
   * Check if error is of specific type
   */
  static isErrorType(error: any, type: 'auth' | 'network' | 'validation' | 'server'): boolean {
    switch (type) {
      case 'auth':
        return error.isAuthError || error.statusCode === 401;
      case 'network':
        return error.isNetworkError || error.isTimeout;
      case 'validation':
        return error.isValidationError || error.statusCode === 400;
      case 'server':
        return error.isServerError || error.statusCode >= 500;
      default:
        return false;
    }
  }
}

/**
 * Create a service method with built-in error handling
 */
export function createServiceMethod<TArgs extends any[], TReturn>(
  method: (...args: TArgs) => Promise<TReturn>,
  options?: {
    retryOnError?: boolean;
    customErrorMessage?: string;
  }
) {
  return async (...args: TArgs): Promise<TReturn> => {
    return ServiceWrapper.handleRequest(
      () => method(...args),
      options
    );
  };
}

/**
 * Decorator for service methods (TypeScript experimental)
 */
export function withErrorHandling(options?: {
  retryOnError?: boolean;
  customErrorMessage?: string;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return ServiceWrapper.handleRequest(
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}

export default ServiceWrapper;
