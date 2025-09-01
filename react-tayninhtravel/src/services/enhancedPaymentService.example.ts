import axios from '../config/axios';
import { ServiceWrapper, createServiceMethod } from '../utils/serviceWrapper';
import { getErrorMessage } from '../utils/errorHandler';

// Example of enhanced payment service with comprehensive error handling

interface PaymentRequest {
  orderId?: string;
  tourBookingId?: string;
  amount: number;
  description: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  paymentUrl?: string;
  transactionId?: string;
}

class EnhancedPaymentService {
  /**
   * Create payment with automatic retry for network errors
   */
  createPayment = createServiceMethod(
    async (request: PaymentRequest): Promise<PaymentResponse> => {
      const response = await axios.post('/payment/create', request);
      return response.data;
    },
    { 
      retryOnError: true, // Automatically retry on 5xx errors
      customErrorMessage: 'Không thể tạo thanh toán. Vui lòng thử lại.'
    }
  );

  /**
   * Verify payment status with error handling
   */
  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    return ServiceWrapper.handleRequest(
      async () => {
        const response = await axios.get(`/payment/verify/${transactionId}`);
        
        // Transform and validate response
        return ServiceWrapper.transformResponse(response.data, (data) => {
          if (!data.success && data.statusCode === 404) {
            throw new Error('Giao dịch không tồn tại');
          }
          return data;
        });
      },
      { customErrorMessage: 'Không thể xác thực thanh toán' }
    );
  }

  /**
   * Handle payment webhook with validation
   */
  async handleWebhook(webhookData: any): Promise<void> {
    return ServiceWrapper.handleRequest(
      async () => {
        // Validate webhook data
        if (!webhookData.transactionId) {
          throw new Error('Invalid webhook data: missing transactionId');
        }

        const response = await axios.post('/payment/webhook', webhookData);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Webhook processing failed');
        }
      },
      { 
        retryOnError: false, // Don't retry webhooks
        customErrorMessage: 'Lỗi xử lý webhook thanh toán' 
      }
    );
  }

  /**
   * Get payment history with pagination
   */
  async getPaymentHistory(params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: string;
  }) {
    return ServiceWrapper.handleRequest(
      async () => {
        const response = await axios.get('/payment/history', { params });
        return ServiceWrapper.handlePaginatedResponse(response.data);
      },
      { customErrorMessage: 'Không thể tải lịch sử thanh toán' }
    );
  }

  /**
   * Cancel payment with proper error handling
   */
  async cancelPayment(transactionId: string, reason?: string): Promise<void> {
    try {
      await ServiceWrapper.handleRequest(
        async () => {
          const response = await axios.post(`/payment/cancel/${transactionId}`, { reason });
          
          if (!response.data.success) {
            // Check specific error cases
            if (response.data.statusCode === 400) {
              throw new Error('Giao dịch đã được xử lý, không thể hủy');
            }
            throw new Error(response.data.message || 'Không thể hủy thanh toán');
          }
        }
      );
    } catch (error: any) {
      // Handle specific error types
      if (ServiceWrapper.isErrorType(error, 'validation')) {
        throw new Error('Thông tin hủy thanh toán không hợp lệ');
      }
      
      if (ServiceWrapper.isErrorType(error, 'auth')) {
        throw new Error('Bạn không có quyền hủy thanh toán này');
      }

      // Re-throw with original or custom message
      throw error;
    }
  }

  /**
   * Process refund with amount validation
   */
  async processRefund(transactionId: string, amount: number): Promise<{
    success: boolean;
    refundId?: string;
    message: string;
  }> {
    // Validate amount before sending
    if (amount <= 0) {
      throw new Error('Số tiền hoàn trả phải lớn hơn 0');
    }

    return ServiceWrapper.handleRequest(
      async () => {
        const response = await axios.post('/payment/refund', {
          transactionId,
          amount
        });

        // Check for partial refund
        if (response.data.partialRefund) {
          console.warn('Partial refund processed:', response.data);
        }

        return {
          success: response.data.success,
          refundId: response.data.refundId,
          message: response.data.message || 'Hoàn tiền thành công'
        };
      },
      {
        retryOnError: false, // Don't retry refunds to avoid duplicate
        customErrorMessage: 'Không thể xử lý hoàn tiền'
      }
    );
  }

  /**
   * Get payment methods with caching
   */
  private cachedPaymentMethods: any = null;
  private cacheExpiry: Date | null = null;

  async getPaymentMethods(forceRefresh = false) {
    // Check cache
    if (!forceRefresh && this.cachedPaymentMethods && this.cacheExpiry && new Date() < this.cacheExpiry) {
      return this.cachedPaymentMethods;
    }

    return ServiceWrapper.handleRequest(
      async () => {
        const response = await axios.get('/payment/methods');
        
        // Cache for 5 minutes
        this.cachedPaymentMethods = response.data;
        this.cacheExpiry = new Date(Date.now() + 5 * 60 * 1000);
        
        return response.data;
      },
      {
        retryOnError: true,
        customErrorMessage: 'Không thể tải phương thức thanh toán'
      }
    );
  }

  /**
   * Validate payment amount
   */
  async validateAmount(amount: number, currency = 'VND'): Promise<boolean> {
    return ServiceWrapper.handleRequest(
      async () => {
        const response = await axios.post('/payment/validate-amount', {
          amount,
          currency
        });

        if (!response.data.isValid) {
          const minAmount = response.data.minAmount || 10000;
          const maxAmount = response.data.maxAmount || 500000000;
          
          if (amount < minAmount) {
            throw new Error(`Số tiền tối thiểu là ${minAmount.toLocaleString('vi-VN')} ${currency}`);
          }
          
          if (amount > maxAmount) {
            throw new Error(`Số tiền tối đa là ${maxAmount.toLocaleString('vi-VN')} ${currency}`);
          }
          
          throw new Error('Số tiền không hợp lệ');
        }

        return true;
      },
      { customErrorMessage: 'Không thể kiểm tra số tiền thanh toán' }
    );
  }
}

// Export singleton instance
export const enhancedPaymentService = new EnhancedPaymentService();

// Usage example:
/*
try {
  // Create payment with automatic retry
  const payment = await enhancedPaymentService.createPayment({
    tourBookingId: 'abc123',
    amount: 1000000,
    description: 'Tour Tây Ninh 1 ngày'
  });

  if (payment.success) {
    window.location.href = payment.paymentUrl;
  }
} catch (error: any) {
  // Error is already handled and displayed by interceptor
  // Additional handling if needed
  if (error.isNetworkError) {
    // Show offline message
    console.log('You are offline');
  }
}
*/
