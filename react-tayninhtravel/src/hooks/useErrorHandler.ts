import { useCallback } from 'react';
import { message, notification } from 'antd';
import { getErrorMessage, handleValidationErrors } from '@/utils/errorHandler';

/**
 * Custom hook for handling errors in components
 */
export const useErrorHandler = () => {
  /**
   * Handle API errors with optional custom message
   */
  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorMessage = customMessage || getErrorMessage(error);

    // Show appropriate notification based on error type
    if (error.isAuthError) {
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      // Redirect will be handled by axios interceptor
    } else if (error.isNetworkError) {
      message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } else if (error.isTimeout) {
      message.error('Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.');
    } else if (error.isValidationError) {
      message.warning(errorMessage);
    } else if (error.isConflict) {
      message.warning(errorMessage);
    } else if (error.isServerError) {
      message.error('Lỗi hệ thống. Vui lòng thử lại sau.');
    } else {
      message.error(errorMessage);
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('Error handled by useErrorHandler:', error);
    }
  }, []);

  /**
   * Handle form validation errors
   */
  const handleFormErrors = useCallback((errors: Record<string, string> | undefined, form: any) => {
    if (errors && form) {
      handleValidationErrors(errors, form);
    }
  }, []);

  /**
   * Handle booking-specific errors
   */
  const handleBookingError = useCallback((error: any) => {
    if (error.message?.includes('Tour slot đã được booking')) {
      notification.warning({
        message: 'Tour đã hết chỗ',
        description: 'Tour slot này đã được người khác đặt. Vui lòng chọn slot khác.',
        duration: 5
      });
    } else if (error.message?.includes('Tour đã khởi hành')) {
      notification.error({
        message: 'Tour đã khởi hành',
        description: 'Không thể đặt tour đã khởi hành.',
        duration: 5
      });
    } else if (error.message?.includes('chỗ trống')) {
      notification.warning({
        message: 'Không đủ chỗ trống',
        description: error.message,
        duration: 5
      });
    } else {
      handleError(error);
    }
  }, [handleError]);

  /**
   * Handle payment-specific errors
   */
  const handlePaymentError = useCallback((error: any) => {
    if (error.message?.includes('PayOS service không khả dụng')) {
      notification.error({
        message: 'Lỗi thanh toán',
        description: 'Hệ thống thanh toán đang gặp sự cố. Vui lòng thử lại sau.',
        duration: 5
      });
    } else if (error.message?.includes('Phiên thanh toán đã hết hạn')) {
      notification.warning({
        message: 'Phiên thanh toán hết hạn',
        description: 'Vui lòng tạo lại đơn hàng.',
        duration: 5
      });
    } else {
      handleError(error);
    }
  }, [handleError]);

  /**
   * Handle authentication-specific errors
   */
  const handleAuthError = useCallback((error: any) => {
    if (error.message?.includes('Email hoặc mật khẩu không đúng')) {
      message.error('Email hoặc mật khẩu không đúng');
    } else if (error.message?.includes('Email đã được sử dụng')) {
      message.warning('Email này đã được đăng ký. Vui lòng sử dụng email khác.');
    } else if (error.message?.includes('Tài khoản chưa được xác thực')) {
      message.warning('Tài khoản chưa được xác thực. Vui lòng kiểm tra email.');
    } else if (error.message?.includes('Mã OTP không đúng')) {
      message.error('Mã OTP không đúng. Vui lòng kiểm tra lại.');
    } else if (error.message?.includes('Mã OTP đã hết hạn')) {
      message.warning('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    } else {
      handleError(error);
    }
  }, [handleError]);

  /**
   * Handle file upload errors
   */
  const handleUploadError = useCallback((error: any) => {
    if (error.message?.includes('File vượt quá dung lượng')) {
      message.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
    } else if (error.message?.includes('Chỉ chấp nhận file ảnh')) {
      message.error('Chỉ chấp nhận file ảnh (jpg, png, gif).');
    } else {
      handleError(error, 'Không thể tải lên file. Vui lòng thử lại.');
    }
  }, [handleError]);

  /**
   * Show success message
   */
  const showSuccess = useCallback((message: string) => {
    notification.success({
      message: 'Thành công',
      description: message,
      duration: 3
    });
  }, []);

  /**
   * Show info message
   */
  const showInfo = useCallback((message: string) => {
    notification.info({
      message: 'Thông báo',
      description: message,
      duration: 3
    });
  }, []);

  /**
   * Handle tour template specific errors
   */
  const handleTourTemplateError = useCallback((error: any) => {
    if (error.message?.includes('Template đã tồn tại')) {
      notification.warning({
        message: 'Template đã tồn tại',
        description: 'Template với tên này đã tồn tại cho thời gian đã chọn. Vui lòng chọn tên khác hoặc thời gian khác.',
        duration: 5
      });
    } else if (error.message?.includes('Tháng và năm đã có template')) {
      notification.warning({
        message: 'Thời gian không hợp lệ',
        description: error.message,
        duration: 5
      });
    } else if (error.message?.includes('scheduleDays')) {
      notification.error({
        message: 'Ngày trong tuần không hợp lệ',
        description: 'Chỉ chấp nhận Thứ 7 (6) hoặc Chủ nhật (0)',
        duration: 5
      });
    } else if (error.message?.includes('templateType')) {
      notification.error({
        message: 'Loại tour không hợp lệ',
        description: 'Vui lòng chọn loại tour hợp lệ (1: FreeScenic, 2: PaidAttraction)',
        duration: 5
      });
    } else if (error.response?.status === 400) {
      notification.error({
        message: 'Dữ liệu không hợp lệ',
        description: error.message || 'Vui lòng kiểm tra lại thông tin đã nhập',
        duration: 5
      });
    } else if (error.response?.status === 409) {
      notification.warning({
        message: 'Xung đột dữ liệu',
        description: error.message || 'Dữ liệu đã tồn tại hoặc có xung đột',
        duration: 5
      });
    } else {
      handleError(error);
    }
  }, [handleError]);

  /**
   * Show warning message
   */
  const showWarning = useCallback((message: string) => {
    notification.warning({
      message: 'Cảnh báo',
      description: message,
      duration: 4
    });
  }, []);

  return {
    handleError,
    handleFormErrors,
    handleBookingError,
    handlePaymentError,
    handleAuthError,
    handleUploadError,
    handleTourTemplateError,
    showSuccess,
    showInfo,
    showWarning
  };
};

export default useErrorHandler;
