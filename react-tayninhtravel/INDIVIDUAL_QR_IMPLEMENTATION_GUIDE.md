# 🎫 INDIVIDUAL QR SYSTEM - FRONTEND IMPLEMENTATION GUIDE

## 📋 **OVERVIEW**
Hệ thống Individual QR Codes cho phép mỗi guest trong tour booking có QR code riêng để check-in độc lập.

### **🔄 FLOW CHÍNH:**
1. **User tạo booking** với thông tin từng guest → Individual QR codes generated
2. **Payment success** → Individual emails sent cho từng guest với QR riêng
3. **Tour guide check-in** → Scan individual QR codes thay vì booking QR

---

## 🚀 **PHASE 1: TOUR BOOKING FLOW**

### **1.1 Get Available Tours**
```typescript
// GET /api/UserTourBooking/available-tours?pageIndex=1&pageSize=10
const getAvailableTours = async (pageIndex = 1, pageSize = 10) => {
  const response = await fetch(`${API_BASE}/api/UserTourBooking/available-tours?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### **1.2 Get Tour Details & Slots**
```typescript
// GET /api/UserTourBooking/tour-details/{tourDetailsId}
const getTourDetails = async (tourDetailsId: string) => {
  const response = await fetch(`${API_BASE}/api/UserTourBooking/tour-details/${tourDetailsId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### **1.3 Calculate Price**
```typescript
// POST /api/UserTourBooking/calculate-price
interface CalculatePriceRequest {
  tourOperationId: string;
  numberOfGuests: number;
  bookingDate?: string; // ISO date string
}

const calculatePrice = async (request: CalculatePriceRequest) => {
  const response = await fetch(`${API_BASE}/api/UserTourBooking/calculate-price`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  return response.json();
};
```

### **1.4 Create Booking với Individual Guests**
```typescript
// POST /api/UserTourBooking/create-booking
interface GuestInfoRequest {
  guestName: string;      // Required, 2-100 chars
  guestEmail: string;     // Required, unique trong booking
  guestPhone?: string;    // Optional, phone format
}

interface CreateTourBookingRequest {
  tourOperationId?: string;  // Optional - auto-detected từ tourSlotId
  tourSlotId: string;        // Required - slot cụ thể user chọn
  numberOfGuests: number;    // Required, 1-50, phải = guests.length
  contactPhone?: string;     // Optional, max 20 chars
  specialRequests?: string;  // Optional, max 500 chars
  guests: GuestInfoRequest[]; // Required, min 1 guest
}

const createBooking = async (request: CreateTourBookingRequest) => {
  const response = await fetch(`${API_BASE}/api/UserTourBooking/create-booking`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  return response.json();
};

// ✅ EXAMPLE REQUEST:
const exampleBookingRequest = {
  tourSlotId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  numberOfGuests: 3,
  contactPhone: "+84901234567",
  specialRequests: "Có người già cần hỗ trợ",
  guests: [
    {
      guestName: "Nguyễn Văn A",
      guestEmail: "nguyenvana@gmail.com",
      guestPhone: "+84901111111"
    },
    {
      guestName: "Trần Thị B",
      guestEmail: "tranthib@gmail.com",
      guestPhone: "+84902222222"
    },
    {
      guestName: "Lê Văn C",
      guestEmail: "levanc@gmail.com",
      guestPhone: "+84903333333"
    }
  ]
};
```

---

## 💳 **PHASE 2: PAYMENT FLOW**

### **2.1 Payment Success Callback**
```typescript
// POST /api/tour-booking-payment/payment-success/{orderCode}
const handlePaymentSuccess = async (orderCode: string) => {
  const response = await fetch(`${API_BASE}/api/tour-booking-payment/payment-success/${orderCode}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

**⚡ AUTOMATIC PROCESSES sau payment success:**
- ✅ Individual QR codes generated cho từng guest
- ✅ Individual emails sent với QR riêng cho từng guest
- ✅ Booking status → `Confirmed`
- ✅ Database updated với guest QR codes

---

## 📱 **PHASE 3: USER BOOKING MANAGEMENT**

### **3.1 Get My Bookings (với Individual Guests)**
```typescript
// GET /api/UserTourBooking/my-bookings?pageIndex=1&pageSize=10
interface TourBookingGuestDto {
  id: string;
  tourBookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  checkInNotes?: string;
  qrCodeData?: string;     // ✅ NEW: Individual QR code
  createdAt: string;
}

interface TourBookingDto {
  id: string;
  bookingCode: string;
  payOsOrderCode?: string;
  status: BookingStatus;
  numberOfGuests: number;
  totalPrice: number;
  qrCodeData?: string;     // ⚠️ LEGACY: Deprecated, use guests[].qrCodeData
  guests: TourBookingGuestDto[]; // ✅ NEW: Individual guests với QR codes
  // ... other fields
}

const getMyBookings = async (pageIndex = 1, pageSize = 10) => {
  const response = await fetch(`${API_BASE}/api/UserTourBooking/my-bookings?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### **3.2 Get Booking Details**
```typescript
// GET /api/UserTourBooking/booking-details/{bookingId}
const getBookingDetails = async (bookingId: string) => {
  const response = await fetch(`${API_BASE}/api/UserTourBooking/booking-details/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

---

## 👨‍🏫 **PHASE 4: TOUR GUIDE CHECK-IN SYSTEM**

### **4.1 Get Tour Slot Guests**
```typescript
// GET /api/TourGuide/tour-slot/{tourSlotId}/guests
const getTourSlotGuests = async (tourSlotId: string) => {
  const response = await fetch(`${API_BASE}/api/TourGuide/tour-slot/${tourSlotId}/guests`, {
    headers: {
      'Authorization': `Bearer ${tourGuideToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// ✅ RESPONSE STRUCTURE:
interface TourSlotGuestsResponse {
  statusCode: 200;
  message: string;
  data: {
    tourSlotId: string;
    tourSlotDate: string;
    totalGuests: number;
    checkedInGuests: number;
    pendingGuests: number;
    guests: Array<{
      id: string;
      guestName: string;
      guestEmail: string;
      guestPhone?: string;
      isCheckedIn: boolean;
      checkInTime?: string;
      checkInNotes?: string;
      bookingCode: string;
      bookingId: string;
      customerName: string;
      totalGuests: number;
    }>;
  };
  success: true;
}
```

### **4.2 Individual Guest Check-in (QR Scan)**
```typescript
// POST /api/TourGuide/check-in-guest-qr
interface CheckInGuestByQRRequest {
  qrCodeData: string;              // Required, max 2000 chars
  notes?: string;                  // Optional, max 500 chars
  overrideTimeRestriction?: boolean; // Default: false
  customCheckInTime?: string;      // ISO date string, optional
}

const checkInGuestByQR = async (request: CheckInGuestByQRRequest) => {
  const response = await fetch(`${API_BASE}/api/TourGuide/check-in-guest-qr`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tourGuideToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  return response.json();
};

// ✅ EXAMPLE REQUEST:
const checkInExample = {
  qrCodeData: "QR_CODE_DATA_FROM_GUEST_EMAIL",
  notes: "Check-in thành công qua QR scan",
  overrideTimeRestriction: false
};
```

### **4.3 Bulk Check-in Multiple Guests**
```typescript
// POST /api/TourGuide/bulk-check-in-guests
interface BulkCheckInGuestsRequest {
  guestIds: string[];              // Required, min 1, max 50
  notes?: string;                  // Optional, max 500 chars
  customCheckInTime?: string;      // ISO date string, optional
  overrideTimeRestriction?: boolean; // Default: false
}

const bulkCheckInGuests = async (request: BulkCheckInGuestsRequest) => {
  const response = await fetch(`${API_BASE}/api/TourGuide/bulk-check-in-guests`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tourGuideToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  return response.json();
};

// ✅ EXAMPLE REQUEST:
const bulkCheckInExample = {
  guestIds: [
    "guest-id-1",
    "guest-id-2", 
    "guest-id-3"
  ],
  notes: "Bulk check-in cho nhóm khách",
  overrideTimeRestriction: false
};
```

---

## 🔧 **PHASE 5: FRONTEND IMPLEMENTATION TASKS**

### **5.1 Update Booking Form**
```typescript
// components/BookingForm.tsx
interface BookingFormState {
  tourSlotId: string;
  numberOfGuests: number;
  contactPhone: string;
  specialRequests: string;
  guests: Array<{
    guestName: string;
    guestEmail: string;
    guestPhone: string;
  }>;
}

// ✅ VALIDATION RULES:
// - guests.length === numberOfGuests
// - All guest emails unique
// - All guest names required (2-100 chars)
// - All guest emails required (valid email format)
```

### **5.2 Update Booking List Component**
```typescript
// components/BookingList.tsx
// ✅ DISPLAY CHANGES:
// - Show individual guest count: "3 guests"
// - Show guest names: "Nguyễn Văn A, Trần Thị B, Lê Văn C"
// - Individual QR codes available per guest
// - Check-in status per guest
```

### **5.3 Update Booking Details Component**
```typescript
// components/BookingDetails.tsx
// ✅ NEW FEATURES:
// - Guest list với individual QR codes
// - Individual check-in status
// - Download individual QR codes
// - Guest-specific information display
```

### **5.4 Tour Guide Check-in Interface**
```typescript
// components/TourGuideCheckIn.tsx
// ✅ NEW FEATURES:
// - Guest list với check-in status
// - QR scanner cho individual guests
// - Bulk check-in selection
// - Real-time check-in updates
```

---

## 📊 **PHASE 6: DATA STRUCTURES**

### **6.1 Updated TypeScript Interfaces**
```typescript
// types/booking.ts
interface TourBookingGuest {
  id: string;
  tourBookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  checkInNotes?: string;
  qrCodeData?: string;
  createdAt: string;
}

interface TourBooking {
  id: string;
  bookingCode: string;
  payOsOrderCode?: string;
  status: BookingStatus;
  numberOfGuests: number;
  totalPrice: number;
  qrCodeData?: string; // ⚠️ DEPRECATED: Use guests[].qrCodeData
  guests: TourBookingGuest[]; // ✅ NEW: Individual guests
  tourOperation?: TourOperationSummary;
  user?: UserSummary;
  // ... other fields
}
```

### **6.2 API Response Types**
```typescript
// types/api.ts
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
```

---

## 🎯 **PHASE 7: IMPLEMENTATION PRIORITIES**

### **🔥 HIGH PRIORITY:**
1. **Update CreateTourBookingRequest** - Include guests array
2. **Update BookingList** - Display guest information
3. **Update BookingDetails** - Show individual QR codes
4. **QR Code Display** - Individual QR per guest

### **🔶 MEDIUM PRIORITY:**
5. **Tour Guide Interface** - Guest check-in system
6. **Bulk Operations** - Multi-guest check-in
7. **Error Handling** - Individual guest validation

### **🔵 LOW PRIORITY:**
8. **Analytics** - Individual guest statistics
9. **Export Features** - Individual guest reports
10. **Advanced Features** - Guest preferences, notes

---

## ⚠️ **IMPORTANT NOTES**

### **🔒 BACKWARD COMPATIBILITY:**
- ✅ Legacy `qrCodeData` field vẫn có trong response (marked obsolete)
- ✅ Old booking endpoints vẫn hoạt động
- ✅ Existing bookings không bị ảnh hưởng

### **🛡️ SECURITY:**
- ✅ Individual QR codes unique và secure
- ✅ Tour guide permissions enforced
- ✅ Guest data validation strict

### **📧 EMAIL SYSTEM:**
- ✅ Mỗi guest nhận email riêng với QR code cá nhân
- ✅ Professional email templates
- ✅ QR code embedded trong email

### **🎯 VALIDATION RULES:**
- ✅ `numberOfGuests` phải = `guests.length`
- ✅ Guest emails phải unique trong cùng booking
- ✅ Guest names required (2-100 chars)
- ✅ Guest emails required (valid format)

---

## 🚀 **NEXT STEPS FOR FE DEV:**

1. **Update booking form** để collect individual guest info
2. **Update API service** với new request/response types
3. **Update booking display** để show individual guests
4. **Implement QR display** cho từng guest
5. **Test end-to-end flow** từ booking đến check-in

**Ready to implement! 🎉**

---

## 🧪 **DETAILED TEST SCENARIOS**

### **TEST 1: Complete Booking Flow**
```javascript
// Step 1: Login
const loginResponse = await fetch('/api/Authentication/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@gmail.com',
    password: '12345678h@'
  })
});
const { token } = await loginResponse.json();

// Step 2: Get available tours
const toursResponse = await fetch('/api/UserTourBooking/available-tours?pageIndex=1&pageSize=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const tours = await toursResponse.json();
const tourDetailsId = tours.data.items[0].id;

// Step 3: Get tour details & slots
const detailsResponse = await fetch(`/api/UserTourBooking/tour-details/${tourDetailsId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const tourDetails = await detailsResponse.json();
const tourSlotId = tourDetails.data.availableSlots[0].id;

// Step 4: Calculate price
const priceResponse = await fetch('/api/UserTourBooking/calculate-price', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tourOperationId: tourDetails.data.tourOperation.id,
    numberOfGuests: 3
  })
});
const pricing = await priceResponse.json();

// Step 5: Create booking với individual guests
const bookingResponse = await fetch('/api/UserTourBooking/create-booking', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tourSlotId: tourSlotId,
    numberOfGuests: 3,
    contactPhone: '+84901234567',
    specialRequests: 'Test individual QR system',
    guests: [
      {
        guestName: 'Nguyễn Văn A',
        guestEmail: 'nguyenvana@test.com',
        guestPhone: '+84901111111'
      },
      {
        guestName: 'Trần Thị B',
        guestEmail: 'tranthib@test.com',
        guestPhone: '+84902222222'
      },
      {
        guestName: 'Lê Văn C',
        guestEmail: 'levanc@test.com',
        guestPhone: '+84903333333'
      }
    ]
  })
});
const booking = await bookingResponse.json();

// Step 6: Simulate payment success
const paymentResponse = await fetch(`/api/tour-booking-payment/payment-success/${booking.data.payOsOrderCode}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Step 7: Verify booking với individual QR codes
const updatedBookingResponse = await fetch(`/api/UserTourBooking/booking-details/${booking.data.id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const updatedBooking = await updatedBookingResponse.json();

console.log('✅ Individual QR Codes Generated:');
updatedBooking.data.guests.forEach((guest, index) => {
  console.log(`Guest ${index + 1}: ${guest.guestName} - QR: ${guest.qrCodeData ? 'Generated' : 'Missing'}`);
});
```

### **TEST 2: Tour Guide Check-in Flow**
```javascript
// Step 1: Login as tour guide
const guideLoginResponse = await fetch('/api/Authentication/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tourguide@gmail.com',
    password: '12345678h@'
  })
});
const { token: guideToken } = await guideLoginResponse.json();

// Step 2: Get guests in tour slot
const guestsResponse = await fetch(`/api/TourGuide/tour-slot/${tourSlotId}/guests`, {
  headers: { 'Authorization': `Bearer ${guideToken}` }
});
const guestsData = await guestsResponse.json();

// Step 3: Check-in individual guest
const firstGuest = guestsData.data.guests[0];
const checkInResponse = await fetch('/api/TourGuide/check-in-guest-qr', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${guideToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCodeData: firstGuest.qrCodeData, // From guest QR code
    notes: 'Check-in thành công qua QR scan'
  })
});

// Step 4: Bulk check-in remaining guests
const remainingGuestIds = guestsData.data.guests.slice(1).map(g => g.id);
const bulkCheckInResponse = await fetch('/api/TourGuide/bulk-check-in-guests', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${guideToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    guestIds: remainingGuestIds,
    notes: 'Bulk check-in cho guests còn lại'
  })
});

// Step 5: Verify all guests checked-in
const finalGuestsResponse = await fetch(`/api/TourGuide/tour-slot/${tourSlotId}/guests`, {
  headers: { 'Authorization': `Bearer ${guideToken}` }
});
const finalGuestsData = await finalGuestsResponse.json();

console.log('✅ Check-in Status:');
console.log(`Total: ${finalGuestsData.data.totalGuests}`);
console.log(`Checked-in: ${finalGuestsData.data.checkedInGuests}`);
console.log(`Pending: ${finalGuestsData.data.pendingGuests}`);
```

### **TEST 3: Error Handling**
```javascript
// Test invalid QR code
const invalidQRResponse = await fetch('/api/TourGuide/check-in-guest-qr', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${guideToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCodeData: 'INVALID_QR_CODE',
    notes: 'Test invalid QR'
  })
});
// Expected: 404 - "Không tìm thấy thông tin khách hàng với QR code này"

// Test duplicate check-in
const duplicateResponse = await fetch('/api/TourGuide/check-in-guest-qr', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${guideToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCodeData: alreadyCheckedInQR,
    notes: 'Test duplicate check-in'
  })
});
// Expected: 400 - "Khách hàng đã được check-in lúc..."
```

---

## 📱 **MOBILE APP CONSIDERATIONS**

### **QR Code Scanner Integration:**
```typescript
// For React Native QR scanner
import { BarCodeScanner } from 'expo-barcode-scanner';

const handleQRScan = async (qrData: string) => {
  try {
    const response = await checkInGuestByQR({
      qrCodeData: qrData,
      notes: 'Scanned via mobile app'
    });

    if (response.success) {
      Alert.alert('Thành công', `Check-in thành công cho ${response.data.guestName}`);
    }
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể check-in guest này');
  }
};
```

**Ready to implement! 🎉**
