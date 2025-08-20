# Tour Pricing Logic - Tây Ninh Travel

## 📋 Quy định về thời gian đặt tour và mức giảm giá

### 🎯 **1. Đặt sớm (Early Bird)**

**Điều kiện:**
- Khách hàng đặt tour trong **14 ngày đầu** sau khi tour được tạo/mở bán
- Tính từ ngày tour được tạo (`createdAt`) đến ngày đặt hiện tại

**Ưu đãi:**
- **Giảm giá 25%** so với giá gốc của tour
- Hiển thị tag "🎉 Ưu đãi đặt sớm"
- Loại giá: "Early Bird"

### 💰 **2. Đặt trễ (Last Minute)**

**Điều kiện:**
- Khách hàng đặt tour **sau 14 ngày đầu** (từ ngày thứ 15 trở đi)

**Ưu đãi:**
- **Không giảm giá** - thanh toán 100% giá tour
- Loại giá: "Standard"

---

## 🧮 **Công thức tính giá**

### **Bước 1: Xác định loại giá**
```javascript
const tourCreatedDate = new Date(tourDetails.createdAt);
const currentDate = new Date();
const daysSinceCreated = Math.floor((currentDate.getTime() - tourCreatedDate.getTime()) / (1000 * 60 * 60 * 24));

const isEarlyBird = daysSinceCreated <= 14;
const discountPercent = isEarlyBird ? 25 : 0;
```

### **Bước 2: Tính toán giá**
```javascript
const pricePerGuest = tourDetails.tourOperation.price;
const totalOriginalPrice = pricePerGuest * numberOfGuests;
const discountAmount = (totalOriginalPrice * discountPercent) / 100;
const finalPrice = totalOriginalPrice - discountAmount;
```

---

## 📊 **Ví dụ cụ thể**

### **Ví dụ 1: Early Bird (Ngày 1-14)**
- **Tour được tạo:** 15/07/2025
- **Khách đặt:** 20/07/2025 (5 ngày sau khi tạo)
- **Giá gốc:** 100,000 VND/người
- **Số khách:** 2 người
- **Tính toán:**
  - Tổng giá gốc: 200,000 VND
  - Giảm giá Early Bird: 50,000 VND (25%)
  - **Giá cuối cùng: 150,000 VND**

### **Ví dụ 2: Standard (Ngày 15+)**
- **Tour được tạo:** 15/07/2025
- **Khách đặt:** 05/08/2025 (21 ngày sau khi tạo)
- **Giá gốc:** 100,000 VND/người
- **Số khách:** 2 người
- **Tính toán:**
  - Tổng giá gốc: 200,000 VND
  - Giảm giá: 0 VND (0%)
  - **Giá cuối cùng: 200,000 VND**

---

## 🔧 **Implementation trong Code**

### **Service Function**
```typescript
// File: src/services/tourBookingService.ts
export const calculateBookingPrice = async (request: CalculatePriceRequest, token?: string)
```

### **UI Display**
```typescript
// File: src/pages/BookingPage.tsx
// Hiển thị:
// - Giá gốc
// - Giảm giá (nếu có)
// - Tổng cộng
// - Tag Early Bird (nếu có)
// - Loại giá
```

### **API Response Format**
```json
{
  "success": true,
  "data": {
    "tourDetailsId": "uuid",
    "tourTitle": "Tour name",
    "numberOfGuests": 2,
    "originalPricePerGuest": 100000,
    "totalOriginalPrice": 200000,
    "discountPercent": 25,
    "discountAmount": 50000,
    "finalPrice": 150000,
    "isEarlyBird": true,
    "pricingType": "Early Bird",
    "daysSinceCreated": 5,
    "bookingDate": "2025-07-20T10:00:00Z"
  }
}
```

---

## 🎨 **UI/UX Features**

### **Price Display**
- ✅ Giá gốc với số lượng khách
- ✅ Giảm giá (màu xanh nếu có)
- ✅ Tổng cộng (màu đỏ, font lớn)
- ✅ Tag "🎉 Ưu đãi đặt sớm" (màu xanh)
- ✅ Loại giá (Early Bird/Standard)

### **Real-time Calculation**
- ✅ Tự động tính lại khi thay đổi số khách
- ✅ Loading state khi đang tính toán
- ✅ Error handling nếu không tính được giá

---

## 🚀 **Testing**

### **Test Cases**
1. **Early Bird (Day 1-14)**: Kiểm tra giảm giá 25%
2. **Standard (Day 15+)**: Kiểm tra không giảm giá
3. **Edge Case (Day 14)**: Kiểm tra ngày cuối Early Bird
4. **Multiple Guests**: Kiểm tra tính toán với nhiều khách
5. **Error Handling**: Kiểm tra khi không có tourOperation

### **Current Test Data**
- **Tour ID:** `8a4f9892-98a4-430f-8468-5dba980eeff3`
- **Created:** 15/07/2025 10:14:22
- **Price:** 11,111 VND/người
- **Status:** Public (có thể booking)
- **Expected:** Early Bird discount (25% off)

---

## 📝 **Notes**

- Logic tính toán dựa trên `createdAt` của TourDetails
- Không phụ thuộc vào ngày khởi hành tour
- Discount áp dụng cho tất cả khách (adult + child)
- UI hiển thị rõ ràng breakdown giá
- Real-time calculation khi user thay đổi input
