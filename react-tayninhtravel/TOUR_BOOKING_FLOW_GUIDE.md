# Tour Booking & Payment Flow Guide

## Tổng quan Flow Booking và Payment

### 1. Flow Booking Tour

```
User Browse Tours → Select Tour → Booking Page → Fill Info → Payment → Success/Cancel
```

#### Chi tiết từng bước:

1. **Browse Tours** (`/things-to-do`)
   - User xem danh sách tours có sẵn
   - Click "Book Now" trên tour card

2. **Tour Detail** (`/things-to-do/:id`)
   - Xem chi tiết tour
   - Click "Book Now" → navigate to booking page

3. **Booking Page** (`/booking/:tourId`)
   - **Step 1**: Xem thông tin tour, timeline
   - **Step 2**: Điền thông tin khách hàng (số người, contact info)
   - **Step 3**: Xác nhận và thanh toán

4. **Payment Process**
   - Tạo booking record với status `Pending`
   - Tạo PayOS payment URL
   - Redirect user đến PayOS

5. **Payment Result**
   - **Success**: `/payment-success` → booking status = `Confirmed`
   - **Cancel**: `/payment-cancel` → booking status vẫn `Pending`

### 2. Backend API Endpoints

#### Tour Booking APIs
```
GET    /api/user-tour-booking/tour-details/{id}     - Lấy chi tiết tour để booking
POST   /api/user-tour-booking/calculate-price       - Tính giá (có early bird discount)
POST   /api/user-tour-booking/create-booking        - Tạo booking mới (cần auth)
GET    /api/user-tour-booking/my-bookings           - Lịch sử booking của user
GET    /api/user-tour-booking/check-availability    - Kiểm tra availability
GET    /api/user-tour-booking/available-tours       - Danh sách tours có sẵn
```

#### Payment APIs
```
POST   /api/tour-booking-payment/payment-success   - PayOS success callback
POST   /api/tour-booking-payment/payment-cancel    - PayOS cancel callback  
GET    /api/tour-booking-payment/lookup/{orderCode} - Lookup booking info
```

### 3. Frontend Services

#### tourBookingService.ts
- `getTourDetailsForBooking()` - Lấy thông tin tour để booking
- `calculateBookingPrice()` - Tính giá với early bird discount
- `createTourBooking()` - Tạo booking mới
- `getMyBookings()` - Lịch sử booking
- `checkTourAvailability()` - Kiểm tra chỗ trống

#### paymentService.ts
- `handleTourBookingPaymentSuccess()` - Xử lý payment success
- `handleTourBookingPaymentCancel()` - Xử lý payment cancel
- `lookupTourBookingByPayOsOrderCode()` - Tra cứu booking
- `parsePayOsCallbackParams()` - Parse URL parameters
- `redirectToPayOsPayment()` - Redirect đến PayOS

### 4. Frontend Components

#### Pages
- `BookingPage.tsx` - Trang đặt tour (3 steps)
- `PaymentSuccess.tsx` - Trang thanh toán thành công
- `PaymentCancel.tsx` - Trang thanh toán bị hủy
- `BookingHistory.tsx` - Lịch sử đặt tour

#### Key Features
- **Multi-step booking form** với validation
- **Real-time price calculation** với early bird discount
- **Availability checking** trước khi booking
- **PayOS integration** cho thanh toán
- **Booking history** với pagination và filter

### 5. Data Models

#### TourDetailsForBooking
```typescript
interface TourDetailsForBooking {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    startLocation: string;
    endLocation: string;
    tourOperation: TourOperationSummary;
    timeline: TimelineItem[];
    tourDates: TourDate[];
}
```

#### CreateTourBookingRequest
```typescript
interface CreateTourBookingRequest {
    tourOperationId: string;
    numberOfGuests: number;
    adultCount: number;
    childCount: number;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    specialRequests?: string;
}
```

#### TourBooking
```typescript
interface TourBooking {
    id: string;
    bookingCode: string;
    payOsOrderCode?: string;
    status: BookingStatus;
    numberOfGuests: number;
    totalPrice: number;
    bookingDate: string;
    // ... other fields
}
```

### 6. BookingStatus Enum
```typescript
enum BookingStatus {
    Pending = 0,        // Chờ thanh toán
    Confirmed = 1,      // Đã xác nhận
    CancelledByCustomer = 2,
    CancelledByCompany = 3,
    Completed = 4,      // Đã hoàn thành
    NoShow = 5,         // Không xuất hiện
    Refunded = 6        // Đã hoàn tiền
}
```

### 7. PayOS Integration

#### Payment URLs
- **Success**: `https://tndt.netlify.app/payment-success?orderId={orderCode}&orderCode={payOsOrderCode}`
- **Cancel**: `https://tndt.netlify.app/payment-cancel?orderId={orderCode}&orderCode={payOsOrderCode}`

#### Order Code Format
- **PayOS Order Code**: `TNDT + 10 digits` (e.g., `TNDT1234567890`)
- **Booking Code**: `TB + YYYYMMDD + 6 random digits` (e.g., `TB202412151234567`)

### 8. Early Bird Pricing

Backend tự động tính discount dựa trên:
- Số ngày từ khi tạo tour đến ngày booking
- Số ngày từ booking đến ngày tour
- Logic discount được implement trong `UserTourBookingService.CalculateEarlyBirdPricing()`

### 9. Error Handling

#### Common Errors
- **Authentication required** - User chưa login
- **Tour not available** - Tour đã hết chỗ hoặc không active
- **Invalid booking data** - Validation failed
- **Payment failed** - PayOS payment error
- **Concurrency conflict** - Multiple users booking cùng lúc

#### Error Display
- Form validation errors hiển thị inline
- API errors hiển thị bằng `message.error()`
- Payment errors redirect đến error page

### 10. Testing

#### Manual Testing Steps
1. Browse tours → Select tour → Click "Book Now"
2. Fill booking form với different guest counts
3. Verify price calculation và early bird discount
4. Submit booking → Check PayOS redirect
5. Complete payment → Verify success page
6. Cancel payment → Verify cancel page
7. Check booking history

#### API Testing với MCP
```bash
# Test booking creation
POST /api/user-tour-booking/create-booking
{
    "tourOperationId": "guid",
    "numberOfGuests": 2,
    "adultCount": 2,
    "childCount": 0,
    "contactName": "Test User",
    "contactPhone": "0123456789",
    "contactEmail": "test@example.com"
}
```

### 11. Security Considerations

- **Authentication required** cho tất cả booking APIs
- **Input validation** ở cả frontend và backend
- **Concurrency control** để tránh overbooking
- **PayOS signature verification** cho payment callbacks
- **Rate limiting** cho booking APIs

### 12. Performance Optimizations

- **Debounced price calculation** khi user thay đổi guest count
- **Cached tour details** để tránh reload
- **Pagination** cho booking history
- **Lazy loading** cho tour images
- **Optimistic UI updates** cho better UX
