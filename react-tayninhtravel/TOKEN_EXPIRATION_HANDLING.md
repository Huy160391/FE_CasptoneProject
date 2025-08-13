# Token Expiration Handling Implementation

## Overview
Đã triển khai hệ thống xử lý token hết hạn toàn diện để cải thiện UX khi user mở app với token đã hết hạn.

## Implemented Features

### 1. App Initialization Service (`appInitService.ts`)
- **Validate token khi app khởi động**: Kiểm tra token còn hợp lệ không khi user mở app
- **JWT Decode**: Decode token để kiểm tra expiration claim
- **Auto redirect**: Tự động redirect về `/login` nếu token hết hạn
- **Periodic validation**: Kiểm tra token mỗi 60 giây khi app đang chạy
- **Clear auth data**: Xóa toàn bộ data authentication khi token không hợp lệ

### 2. Enhanced Axios Interceptor (`axios.ts`)
- **Pre-request validation**: Kiểm tra token trước khi gửi request
- **Token decode**: Decode và validate JWT token expiration
- **Cancel invalid requests**: Hủy request nếu token hết hạn
- **Auto redirect**: Redirect về `/login` thay vì `/404` khi 401
- **Better error handling**: Xử lý token expired/invalid errors

### 3. Protected Route Enhancement (`ProtectedRoute.tsx`)
- **Token validation on mount**: Validate token khi component mount
- **JWT expiration check**: Kiểm tra token expiration trong protected routes
- **User feedback**: Hiển thị message lỗi rõ ràng cho user
- **Redirect to login**: Chuyển về `/login` thay vì `/` khi cần auth

### 4. App.tsx Integration
- **Auto initialization**: Tự động gọi `appInitService.initialize()` khi app load
- **Cleanup on unmount**: Clear timers khi app unmount

## How It Works

1. **Khi user mở app**:
   - `appInitService.initialize()` được gọi trong `App.tsx`
   - Kiểm tra token trong localStorage
   - Decode JWT và check expiration
   - Nếu hết hạn → clear auth data → redirect to `/login`
   - Nếu còn hạn → setup expiration timer + periodic validation

2. **Khi gửi API request**:
   - Axios interceptor validate token trước khi gửi
   - Nếu token hết hạn → cancel request → redirect to `/login`
   - Nếu nhận 401 response → clear auth → redirect to `/login`

3. **Trong Protected Routes**:
   - Validate token khi route mount
   - Kiểm tra expiration và redirect nếu cần
   - Hiển thị message error cho user

4. **Periodic Validation**:
   - Mỗi 60 giây, app sẽ validate token
   - Auto logout và redirect nếu token hết hạn

## Benefits
- ✅ **Better UX**: User không bị stuck với token hết hạn
- ✅ **Proactive validation**: Kiểm tra trước, không chờ API fail
- ✅ **Clear feedback**: Message rõ ràng khi cần đăng nhập lại
- ✅ **Consistent behavior**: Xử lý thống nhất ở mọi layer
- ✅ **Auto cleanup**: Tự động clear expired tokens

## Testing Scenarios
1. Mở app với token hết hạn → Should redirect to `/login`
2. Token hết hạn khi đang dùng app → Auto logout và redirect
3. Gọi API với token hết hạn → Cancel request và redirect
4. Truy cập protected route với token hết hạn → Redirect to `/login`

## Notes
- Token validation sử dụng JWT decode để check `exp` claim
- Redirect về `/login` thay vì `/404` để UX tốt hơn
- Periodic check mỗi 60 giây để ensure token luôn valid
- Clear toàn bộ auth data khi token invalid để tránh inconsistency