# Hướng dẫn Test API Booking Tour

## 1. Chuẩn bị Test

### Kiểm tra Backend đang chạy
```bash
# Kiểm tra health check
GET http://localhost:5267/api/Health/ping
```

### Đăng nhập để lấy token
```bash
POST http://localhost:5267/api/Authentication/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "12345678h@"
}
```

## 2. Test Flow Booking Tour

### Bước 1: Lấy danh sách tours có sẵn
```bash
GET http://localhost:5267/api/TourDetails/paginated?pageIndex=0&pageSize=10
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tour-id-guid",
      "title": "Tour Núi Bà Đen",
      "status": 8,
      "tourOperation": {
        "id": "operation-id-guid",
        "price": 500000,
        "maxGuests": 20,
        "currentBookings": 5,
        "isActive": true
      }
    }
  ]
}
```

### Bước 2: Lấy chi tiết tour để booking
```bash
GET http://localhost:5267/api/TourDetails/{tour-id}
Authorization: Bearer {token}
```

### Bước 3: Kiểm tra availability
```bash
GET http://localhost:5267/api/TourBooking/operation/{operation-id}/capacity?requestedGuests=2
Authorization: Bearer {token}
```

### Bước 4: Tạo booking
```bash
POST http://localhost:5267/api/TourBooking
Authorization: Bearer {token}
Content-Type: application/json

{
  "tourOperationId": "operation-id-guid",
  "adultCount": 2,
  "childCount": 0,
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0123456789",
  "contactEmail": "test@example.com",
  "customerNotes": "Yêu cầu đặc biệt nếu có"
}
```

**Response mẫu:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Đặt tour thành công",
  "bookingData": {
    "id": "booking-id-guid",
    "bookingCode": "TB20241215123456",
    "payOsOrderCode": "TNDT1234567890",
    "totalPrice": 1000000,
    "status": 0
  },
  "paymentUrl": "https://pay.payos.vn/web/..."
}
```

### Bước 5: Xử lý thanh toán
- Frontend redirect user đến `paymentUrl`
- User hoàn thành thanh toán trên PayOS
- PayOS redirect về:
  - Success: `https://tndt.netlify.app/payment-success?orderId={orderCode}&orderCode={payOsOrderCode}`
  - Cancel: `https://tndt.netlify.app/payment-cancel?orderId={orderCode}&orderCode={payOsOrderCode}`

### Bước 6: Xử lý callback thanh toán
```bash
# Success callback
POST http://localhost:5267/api/payment-callback/paid/{orderCode}
Content-Type: application/json

{
  "orderCode": "TNDT1234567890",
  "status": "PAID",
  "amount": 1000000,
  "transactionDateTime": "2024-12-15T10:30:00Z"
}
```

### Bước 7: Kiểm tra lịch sử booking
```bash
GET http://localhost:5267/api/TourBooking/my-bookings?pageIndex=0&pageSize=10
Authorization: Bearer {token}
```

## 3. Test với MCP Tool

### Test tạo booking
```javascript
// Sử dụng MCP tool test_request_tayninhtour-api
{
  "method": "POST",
  "endpoint": "/api/TourBooking",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  },
  "body": {
    "tourOperationId": "TOUR_OPERATION_ID",
    "adultCount": 2,
    "childCount": 0,
    "contactName": "Test User",
    "contactPhone": "0123456789",
    "contactEmail": "test@example.com",
    "customerNotes": "Test booking"
  }
}
```

### Test check capacity
```javascript
{
  "method": "GET",
  "endpoint": "/api/TourBooking/operation/OPERATION_ID/capacity?requestedGuests=2",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  }
}
```

## 4. Frontend Integration

### Cách sử dụng services đã tạo

#### 1. Import services
```typescript
import {
  getTourDetailsForBooking,
  createTourBooking,
  checkTourAvailability,
  getMyBookings
} from '../services/tourBookingService';

import {
  handleTourBookingPaymentSuccess,
  redirectToPayOsPayment
} from '../services/paymentService';
```

#### 2. Lấy thông tin tour để booking
```typescript
const loadTourForBooking = async (tourId: string) => {
  try {
    const response = await getTourDetailsForBooking(tourId);
    if (response.success) {
      setTourDetails(response.data);
    }
  } catch (error) {
    console.error('Error loading tour:', error);
  }
};
```

#### 3. Tạo booking
```typescript
const handleCreateBooking = async (bookingData: CreateTourBookingRequest) => {
  try {
    const response = await createTourBooking(bookingData, token);
    if (response.success && response.data?.paymentUrl) {
      // Redirect to PayOS
      redirectToPayOsPayment(response.data.paymentUrl);
    }
  } catch (error) {
    message.error('Có lỗi xảy ra khi đặt tour');
  }
};
```

#### 4. Xử lý payment success
```typescript
// Trong PaymentSuccess component
useEffect(() => {
  const processPaymentSuccess = async () => {
    const params = parsePayOsCallbackParams(window.location.href);
    const callbackRequest = createPayOsCallbackRequest(params);
    
    const response = await handleTourBookingPaymentSuccess(callbackRequest);
    if (response.success) {
      // Show success message
    }
  };
  
  processPaymentSuccess();
}, []);
```

## 5. Các Lỗi Thường Gặp

### 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Kiểm tra user đã đăng nhập chưa

### 400 Bad Request
- Kiểm tra dữ liệu request có đúng format không
- Kiểm tra validation rules

### 409 Conflict
- Tour đã hết chỗ
- Có người khác đang booking cùng lúc

### 404 Not Found
- Tour không tồn tại
- TourOperation không active

## 6. Debugging Tips

### Check console logs
```javascript
// Trong browser console
console.log('Auth token:', localStorage.getItem('token'));
console.log('User info:', JSON.parse(localStorage.getItem('user') || '{}'));
```

### Check network requests
- Mở Developer Tools → Network tab
- Kiểm tra request/response headers
- Kiểm tra status codes

### Check backend logs
- Kiểm tra console output của backend
- Tìm error messages liên quan đến booking

## 7. Test Cases

### Happy Path
1. User browse tours → Select tour → Fill booking form → Payment → Success

### Error Cases
1. User not authenticated → Show login modal
2. Tour not available → Show error message
3. Payment failed → Redirect to cancel page
4. Network error → Show retry option

### Edge Cases
1. Multiple users booking same tour simultaneously
2. Tour capacity exactly full
3. Invalid payment callback data
4. User closes payment window

## 8. Performance Considerations

### Frontend
- Debounce price calculation when user changes guest count
- Cache tour details to avoid repeated API calls
- Show loading states during API calls

### Backend
- Use optimistic concurrency control for booking
- Implement rate limiting for booking APIs
- Cache frequently accessed tour data

## 9. Security Checklist

- [ ] All booking APIs require authentication
- [ ] Input validation on both frontend and backend
- [ ] PayOS signature verification for callbacks
- [ ] Prevent SQL injection and XSS attacks
- [ ] Rate limiting to prevent abuse
