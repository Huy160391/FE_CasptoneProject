# Error Handling Testing Guide

## Overview
This guide provides comprehensive testing scenarios for the error handling implementation based on the Backend Error Message Documentation.

## Manual Testing Checklist

### ✅ Authentication & Account Management

#### Login Errors
- [ ] **Invalid Credentials (401)**
  - Try login with wrong email/password
  - Expected: "Email hoặc mật khẩu không đúng"
  - Should show error message and not redirect

- [ ] **Account Not Verified (401)**
  - Try login with unverified account
  - Expected: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email"
  - Should show warning message

- [ ] **Account Deactivated (403)**
  - Try login with deactivated account
  - Expected: "Tài khoản đã bị vô hiệu hóa"
  - Should show error and prevent access

#### Registration Errors
- [ ] **Email Already Exists (400)**
  - Try register with existing email
  - Expected: "Email đã được sử dụng"
  - Should show warning message

- [ ] **Invalid Email Format (400)**
  - Try register with invalid email format
  - Expected: "Email không hợp lệ"
  - Should show validation error

- [ ] **Weak Password (400)**
  - Try register with password < 6 characters
  - Expected: "Mật khẩu phải có ít nhất 6 ký tự"
  - Should show validation error

#### OTP Verification Errors
- [ ] **Invalid OTP (400)**
  - Enter wrong OTP code
  - Expected: "Mã OTP không đúng"
  - Should show error message

- [ ] **Expired OTP (400)**
  - Wait for OTP to expire, then try to verify
  - Expected: "Mã OTP đã hết hạn"
  - Should show warning message

### ✅ Tour Booking Module

#### Booking Creation Errors
- [ ] **Tour Slot Not Available (400)**
  - Try booking unavailable tour slot
  - Expected: "Tour slot không khả dụng để booking"
  - Should show warning notification

- [ ] **Insufficient Capacity (400)**
  - Try booking more guests than available
  - Expected: "Slot này chỉ còn {available} chỗ trống, không đủ cho {requested} khách"
  - Should show specific capacity message

- [ ] **Tour Already Started (400)**
  - Try booking tour that already started
  - Expected: "Tour đã khởi hành"
  - Should show error notification

- [ ] **Tour Not Public (400)**
  - Try booking non-public tour
  - Expected: "Tour chưa được công khai"
  - Should show warning message

- [ ] **Concurrent Booking Conflict (409)**
  - Simulate concurrent booking scenario
  - Expected: "Tour slot đã được booking bởi người khác, vui lòng thử lại"
  - Should show conflict notification and suggest refresh

#### Booking Management Errors
- [ ] **Booking Not Found (404)**
  - Try access non-existent booking
  - Expected: "Booking không tồn tại"
  - Should show info message

- [ ] **Cannot Cancel Booking (400)**
  - Try cancel already cancelled booking
  - Expected: "Booking đã được hủy trước đó"
  - Should show warning message

- [ ] **No Permission to Cancel (403)**
  - Try cancel someone else's booking
  - Expected: "Bạn không có quyền hủy booking này"
  - Should show permission error

### ✅ Payment & Transaction

#### Payment Errors
- [ ] **Payment Service Error (500)**
  - Simulate PayOS service unavailable
  - Expected: "PayOS service không khả dụng. Vui lòng thử lại sau."
  - Should show error notification with retry suggestion

- [ ] **Invalid Payment Amount (400)**
  - Try payment with invalid amount
  - Expected: "Số tiền thanh toán không hợp lệ"
  - Should show validation error

- [ ] **Payment Expired (400)**
  - Try complete expired payment
  - Expected: "Phiên thanh toán đã hết hạn"
  - Should show warning message

- [ ] **Payment Verification Failed (400)**
  - Simulate payment verification failure
  - Expected: "Không thể xác thực thanh toán"
  - Should show error message

### ✅ File Upload

#### Image Upload Errors
- [ ] **File Too Large (400)**
  - Try upload file > 5MB
  - Expected: "File vượt quá dung lượng cho phép (5MB)"
  - Should show error message

- [ ] **Invalid File Type (400)**
  - Try upload non-image file
  - Expected: "Chỉ chấp nhận file ảnh (jpg, png, gif)"
  - Should show error message

- [ ] **Upload Failed (500)**
  - Simulate upload service failure
  - Expected: "Không thể tải lên file. Vui lòng thử lại"
  - Should show error with retry option

### ✅ Network & System Errors

#### Network Errors
- [ ] **Network Disconnection**
  - Disconnect internet, try any API call
  - Expected: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
  - Should show network error message

- [ ] **Request Timeout**
  - Simulate slow network/timeout
  - Expected: "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại."
  - Should show timeout message

- [ ] **Server Error (500)**
  - Simulate internal server error
  - Expected: "Lỗi hệ thống. Vui lòng thử lại sau"
  - Should show generic server error

#### Token Expiration
- [ ] **Expired Token (401)**
  - Wait for token to expire, try authenticated action
  - Expected: "Phiên đăng nhập đã hết hạn"
  - Should redirect to login after 1.5 seconds

### ✅ Error Boundary Testing

#### Component Errors
- [ ] **React Component Error**
  - Trigger component error (e.g., undefined property access)
  - Expected: Enhanced error boundary with error ID
  - Should show fallback UI with reload/home options

- [ ] **JavaScript Runtime Error**
  - Trigger JS error in component
  - Expected: Error boundary catches and displays details
  - Should show error details in development mode

## Testing Tools & Setup

### Browser Developer Tools
1. **Network Tab**: Simulate network failures
   - Disable cache
   - Throttle network speed
   - Block specific requests

2. **Console**: Monitor error logs
   - Check for proper error logging
   - Verify error context information

3. **Application Tab**: Test token expiration
   - Manually delete/modify tokens
   - Test localStorage clearing

### Testing Scenarios

#### Automated Testing
```bash
# Run error handling tests
npm run test src/test/errorHandling.test.ts

# Run with coverage
npm run test:coverage
```

#### Manual Testing Steps
1. **Setup Test Environment**
   - Use development environment
   - Enable detailed error logging
   - Clear browser cache and storage

2. **Test Each Error Category**
   - Follow checklist systematically
   - Document any deviations from expected behavior
   - Test both success and error paths

3. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari
   - Test on mobile browsers
   - Verify error messages display correctly

4. **Performance Testing**
   - Test error handling under load
   - Verify error messages don't cause memory leaks
   - Test retry mechanisms

## Expected Behavior Summary

### Error Message Display
- ✅ Backend messages take priority over default messages
- ✅ Context-specific handlers show appropriate notifications
- ✅ Fallback messages for unknown errors
- ✅ User-friendly Vietnamese messages

### Error Recovery
- ✅ Automatic retry for server errors (500+)
- ✅ No retry for client errors (4xx)
- ✅ Token refresh on 401 errors
- ✅ Graceful degradation on network errors

### User Experience
- ✅ Clear, actionable error messages
- ✅ Appropriate notification types (error/warning/info)
- ✅ Loading states during error recovery
- ✅ Error boundary fallback for unhandled errors

## Reporting Issues

When reporting error handling issues, include:
1. **Error Type**: Network, validation, server, etc.
2. **Expected Behavior**: What should happen
3. **Actual Behavior**: What actually happened
4. **Steps to Reproduce**: Detailed reproduction steps
5. **Browser/Environment**: Browser version, OS, etc.
6. **Error Logs**: Console errors, network logs
7. **Screenshots**: Error messages, UI state

## Success Criteria

Error handling implementation is considered complete when:
- [ ] All manual test cases pass
- [ ] Automated tests have >90% coverage
- [ ] Error messages match documentation exactly
- [ ] User experience is smooth and informative
- [ ] No unhandled errors in production
- [ ] Error recovery mechanisms work correctly
