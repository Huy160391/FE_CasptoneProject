# 🧪 API TEST SCENARIOS - INDIVIDUAL QR SYSTEM

## 📋 **SETUP REQUIREMENTS**

### **1. Start Backend Server**
```powershell
cd "d:\S_Drive\Code\TayNinhTour\TayNinhTourBE"
dotnet run --project TayNinhTourApi.Controller
```

### **2. Environment Variables**
```
API_BASE=http://localhost:5267
```

### **3. Test Accounts**
- **Customer:** `user@gmail.com` / `12345678h@`
- **Tour Guide:** `tourguide@gmail.com` / `12345678h@`
- **Admin:** `admin@gmail.com` / `12345678h@`

---

## 🎯 **SCENARIO 1: COMPLETE BOOKING FLOW**

### **Step 1: Authentication**
```http
POST /api/Authentication/login
Content-Type: application/json

{
  "email": "user@gmail.com",
  "password": "12345678h@"
}
```
**Expected Response:**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": { ... }
  },
  "success": true
}
```

### **Step 2: Get Available Tours**
```http
GET /api/UserTourBooking/available-tours?pageIndex=1&pageSize=10
Authorization: Bearer {token}
```
**Expected:** List of available tours với tour operations

### **Step 3: Get Tour Details**
```http
GET /api/UserTourBooking/tour-details/{tourDetailsId}
Authorization: Bearer {token}
```
**Expected:** Tour details với available slots và pricing

### **Step 4: Calculate Price**
```http
POST /api/UserTourBooking/calculate-price
Authorization: Bearer {token}
Content-Type: application/json

{
  "tourOperationId": "{tourOperationId}",
  "numberOfGuests": 3,
  "bookingDate": "2024-12-25T00:00:00Z"
}
```
**Expected:** Price calculation với early bird discount nếu applicable

### **Step 5: Create Booking với Individual Guests**
```http
POST /api/UserTourBooking/create-booking
Authorization: Bearer {token}
Content-Type: application/json

{
  "tourSlotId": "{tourSlotId}",
  "numberOfGuests": 3,
  "contactPhone": "+84901234567",
  "specialRequests": "Test individual QR system",
  "guests": [
    {
      "guestName": "Nguyễn Văn A",
      "guestEmail": "nguyenvana@test.com",
      "guestPhone": "+84901111111"
    },
    {
      "guestName": "Trần Thị B",
      "guestEmail": "tranthib@test.com",
      "guestPhone": "+84902222222"
    },
    {
      "guestName": "Lê Văn C",
      "guestEmail": "levanc@test.com",
      "guestPhone": "+84903333333"
    }
  ]
}
```
**Expected Response:**
```json
{
  "statusCode": 200,
  "message": "Tạo booking thành công",
  "data": {
    "id": "booking-uuid",
    "bookingCode": "TB240812001",
    "payOsOrderCode": "1234567890",
    "status": 0,
    "numberOfGuests": 3,
    "totalPrice": 1500000,
    "checkoutUrl": "https://pay.payos.vn/web/...",
    "guests": [
      {
        "id": "guest-uuid-1",
        "guestName": "Nguyễn Văn A",
        "guestEmail": "nguyenvana@test.com",
        "qrCodeData": null
      }
    ]
  },
  "success": true
}
```

### **Step 6: Simulate Payment Success**
```http
POST /api/tour-booking-payment/payment-success/{payOsOrderCode}
Authorization: Bearer {token}
```
**Expected:** Payment processed, QR codes generated, emails sent

### **Step 7: Verify Updated Booking**
```http
GET /api/UserTourBooking/booking-details/{bookingId}
Authorization: Bearer {token}
```
**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "id": "booking-uuid",
    "status": 1,
    "guests": [
      {
        "id": "guest-uuid-1",
        "guestName": "Nguyễn Văn A",
        "guestEmail": "nguyenvana@test.com",
        "isCheckedIn": false,
        "qrCodeData": "GENERATED_QR_CODE_DATA_V3",
        "checkInTime": null
      }
    ]
  },
  "success": true
}
```

---

## 👨‍🏫 **SCENARIO 2: TOUR GUIDE CHECK-IN**

### **Step 1: Tour Guide Login**
```http
POST /api/Authentication/login
Content-Type: application/json

{
  "email": "tourguide@gmail.com",
  "password": "12345678h@"
}
```

### **Step 2: Get Tour Slot Guests**
```http
GET /api/TourGuide/tour-slot/{tourSlotId}/guests
Authorization: Bearer {tourGuideToken}
```
**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "tourSlotId": "slot-uuid",
    "tourSlotDate": "2024-12-25",
    "totalGuests": 3,
    "checkedInGuests": 0,
    "pendingGuests": 3,
    "guests": [
      {
        "id": "guest-uuid-1",
        "guestName": "Nguyễn Văn A",
        "guestEmail": "nguyenvana@test.com",
        "isCheckedIn": false,
        "bookingCode": "TB240812001"
      }
    ]
  },
  "success": true
}
```

### **Step 3: Individual QR Check-in**
```http
POST /api/TourGuide/check-in-guest-qr
Authorization: Bearer {tourGuideToken}
Content-Type: application/json

{
  "qrCodeData": "{guestQRCodeFromEmail}",
  "notes": "Check-in thành công qua QR scan"
}
```
**Expected Response:**
```json
{
  "statusCode": 200,
  "message": "Check-in thành công cho khách hàng Nguyễn Văn A",
  "data": {
    "id": "guest-uuid-1",
    "guestName": "Nguyễn Văn A",
    "isCheckedIn": true,
    "checkInTime": "2024-08-12T10:30:00Z",
    "bookingCode": "TB240812001"
  },
  "success": true
}
```

### **Step 4: Bulk Check-in**
```http
POST /api/TourGuide/bulk-check-in-guests
Authorization: Bearer {tourGuideToken}
Content-Type: application/json

{
  "guestIds": ["guest-uuid-2", "guest-uuid-3"],
  "notes": "Bulk check-in cho 2 guests còn lại"
}
```
**Expected Response:**
```json
{
  "statusCode": 200,
  "message": "Bulk check-in thành công cho 2 khách hàng",
  "data": {
    "updatedCount": 2,
    "checkInTime": "2024-08-12T10:35:00Z",
    "checkedInGuests": [
      {
        "id": "guest-uuid-2",
        "guestName": "Trần Thị B",
        "bookingCode": "TB240812001"
      },
      {
        "id": "guest-uuid-3", 
        "guestName": "Lê Văn C",
        "bookingCode": "TB240812001"
      }
    ]
  },
  "success": true
}
```

---

## ❌ **SCENARIO 3: ERROR HANDLING**

### **Test 1: Invalid QR Code**
```http
POST /api/TourGuide/check-in-guest-qr
Authorization: Bearer {tourGuideToken}
Content-Type: application/json

{
  "qrCodeData": "INVALID_QR_CODE_DATA",
  "notes": "Test invalid QR"
}
```
**Expected:** `404` - "Không tìm thấy thông tin khách hàng với QR code này"

### **Test 2: Duplicate Check-in**
```http
POST /api/TourGuide/check-in-guest-qr
Authorization: Bearer {tourGuideToken}
Content-Type: application/json

{
  "qrCodeData": "{alreadyCheckedInQR}",
  "notes": "Test duplicate"
}
```
**Expected:** `400` - "Khách hàng đã được check-in lúc..."

### **Test 3: Unauthorized Access**
```http
POST /api/TourGuide/check-in-guest-qr
Authorization: Bearer {wrongTourGuideToken}
Content-Type: application/json

{
  "qrCodeData": "{validQR}",
  "notes": "Test unauthorized"
}
```
**Expected:** `403` - "Bạn không có quyền check-in cho tour slot này"

### **Test 4: Validation Errors**
```http
POST /api/UserTourBooking/create-booking
Authorization: Bearer {token}
Content-Type: application/json

{
  "tourSlotId": "{tourSlotId}",
  "numberOfGuests": 2,
  "guests": [
    {
      "guestName": "A",
      "guestEmail": "invalid-email"
    }
  ]
}
```
**Expected:** `400` - Validation errors cho guest name length và email format

---

## 📊 **VERIFICATION CHECKLIST**

### **✅ Functional Tests:**
- [ ] Booking tạo được với multiple guests
- [ ] NumberOfGuests = guests.length validation
- [ ] Individual QR codes generated sau payment
- [ ] Individual emails sent cho từng guest
- [ ] Tour guide check-in individual guests
- [ ] Bulk check-in hoạt động
- [ ] Guest check-in status tracking

### **✅ Data Integrity:**
- [ ] TourBookingGuest records created correctly
- [ ] QR codes unique và không duplicate
- [ ] Guest emails unique trong cùng booking
- [ ] Check-in timestamps accurate
- [ ] Database consistency maintained

### **✅ Error Handling:**
- [ ] Invalid QR codes rejected
- [ ] Duplicate check-ins prevented
- [ ] Unauthorized access blocked
- [ ] Validation errors clear và helpful
- [ ] Network errors handled gracefully

### **✅ Performance:**
- [ ] Booking creation < 2 seconds
- [ ] QR generation < 5 seconds
- [ ] Email sending parallel (không block)
- [ ] Check-in operations < 1 second
- [ ] Bulk operations efficient

---

## 🎯 **SUCCESS CRITERIA**

**✅ READY FOR PRODUCTION khi:**
1. Tất cả test scenarios pass
2. Performance requirements met
3. Error handling robust
4. Data integrity maintained
5. Security validations working
6. Backward compatibility preserved

**🚀 Start testing với Scenario 1!**
