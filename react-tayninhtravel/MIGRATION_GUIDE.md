# 🔄 MIGRATION GUIDE - Individual QR System

## 📋 **OVERVIEW**
Hướng dẫn migrate existing booking system sang Individual QR System dựa trên current flow hiện tại.

## 🔍 **CURRENT BOOKING FLOW ANALYSIS**

### **Current 3-Step Flow:**
1. **Step 0**: Tour Info & Slot Selection
2. **Step 1**: Guest Info (Contact person + numberOfGuests)
3. **Step 2**: Confirmation & Payment

### **Current BookingFormData:**
```typescript
interface BookingFormData {
    numberOfGuests: number;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    specialRequests?: string;
}
```

### **Current CreateTourBookingRequest:**
```typescript
interface CreateTourBookingRequest {
    tourOperationId: string;
    numberOfGuests: number;
    adultCount: number; // = numberOfGuests
    childCount: number; // = 0
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    specialRequests?: string;
    tourSlotId?: string;
}
```

### **Current Payment Flow:**
- Enhanced Payment System với createPaymentLink()
- Payment success → UnifiedPaymentSuccess component
- Booking status: Pending → Confirmed

---

## 🎯 **STEP 1: UPDATE BOOKING FORM (BookingPage.tsx)**

### **1.1 Update BookingFormData Interface**
```typescript
// CURRENT: src/pages/BookingPage.tsx line 50-56
interface BookingFormData {
    numberOfGuests: number;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    specialRequests?: string;
}

// ✅ NEW: Add guests array
interface BookingFormData {
    numberOfGuests: number;
    contactName: string;        // Keep for backward compatibility
    contactPhone: string;
    contactEmail: string;
    specialRequests?: string;
    guests: GuestInfoRequest[]; // ✅ NEW: Individual guest info
}
```

### **1.2 Update BookingPage State**
```typescript
// CURRENT: line 78-84
const [formValues, setFormValues] = useState<BookingFormData>({
    numberOfGuests: 1,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequests: ''
});

// ✅ NEW: Add guests state
const [formValues, setFormValues] = useState<BookingFormData>({
    numberOfGuests: 1,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequests: '',
    guests: [{ guestName: '', guestEmail: '', guestPhone: '' }] // ✅ NEW
});
```

### **1.3 Update Step 1 Form (Guest Info Section)**
```typescript
// CURRENT: Step 1 chỉ có contact info (line 637-723)
// ✅ NEW: Add individual guest forms sau contact info

{currentStep === 1 && (
    <div>
        <Title level={4}>Thông tin khách hàng</Title>

        {/* Existing contact info form */}
        <Form form={form} layout="vertical" onValuesChange={handleFormValuesChange}>
            {/* Keep existing contact fields */}

            {/* ✅ NEW: Individual guest information */}
            <Divider>Thông tin từng khách hàng</Divider>

            {Array.from({ length: formValues.numberOfGuests }, (_, index) => (
                <Card key={index} size="small" style={{ marginBottom: 16 }}>
                    <Title level={5}>Khách hàng {index + 1}</Title>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name={['guests', index, 'guestName']}
                                label="Họ và tên"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên khách hàng' },
                                    { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
                                    { max: 100, message: 'Tên không quá 100 ký tự' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập họ và tên đầy đủ"
                                    onChange={(e) => updateGuestInfo(index, 'guestName', e.target.value)}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name={['guests', index, 'guestEmail']}
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' },
                                    {
                                        validator: (_, value) => validateUniqueEmail(value, index, formValues.guests)
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="email@example.com"
                                    onChange={(e) => updateGuestInfo(index, 'guestEmail', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name={['guests', index, 'guestPhone']}
                        label="Số điện thoại (tùy chọn)"
                        rules={[
                            { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="0123456789"
                            onChange={(e) => updateGuestInfo(index, 'guestPhone', e.target.value)}
                        />
                    </Form.Item>
                </Card>
            ))}
        </Form>
    </div>
)}
```

### **1.4 Add Helper Functions**
```typescript
// ✅ NEW: Add these helper functions to BookingPage.tsx

const updateGuestInfo = (index: number, field: keyof GuestInfoRequest, value: string) => {
    const updatedGuests = [...formValues.guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };

    setFormValues(prev => ({
        ...prev,
        guests: updatedGuests
    }));
};

const validateUniqueEmail = (email: string, currentIndex: number, guests: GuestInfoRequest[]) => {
    if (!email) return Promise.resolve();

    const duplicateIndex = guests.findIndex((guest, index) =>
        index !== currentIndex && guest.guestEmail.toLowerCase() === email.toLowerCase()
    );

    if (duplicateIndex !== -1) {
        return Promise.reject(new Error(`Email đã được sử dụng cho khách hàng ${duplicateIndex + 1}`));
    }

    return Promise.resolve();
};

const handleGuestCountChange = (allValues: BookingFormData) => {
    const newGuestCount = allValues.numberOfGuests;
    const currentGuests = formValues.guests;

    // Auto-adjust guests array
    const newGuests = Array.from({ length: newGuestCount }, (_, index) => {
        if (index < currentGuests.length) {
            return currentGuests[index]; // Keep existing data
        } else {
            // Auto-populate first guest với contact info
            if (index === 0 && allValues.contactName && allValues.contactEmail) {
                return {
                    guestName: allValues.contactName,
                    guestEmail: allValues.contactEmail,
                    guestPhone: allValues.contactPhone || ''
                };
            }
            return { guestName: '', guestEmail: '', guestPhone: '' };
        }
    });

    setFormValues(prev => ({
        ...prev,
        guests: newGuests
    }));

    // Continue with existing price calculation logic...
    if (tourDetails && selectedSlot) {
        handlePriceCalculation(allValues);
    }
};
```

---

## 🔧 **STEP 2: UPDATE API SERVICE**

### **2.1 Update CreateTourBookingRequest Interface**
```typescript
// CURRENT: src/services/tourBookingService.ts line 82-92
export interface CreateTourBookingRequest {
    tourOperationId: string;
    numberOfGuests: number;
    adultCount: number; // = numberOfGuests
    childCount: number; // = 0
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    specialRequests?: string;
    tourSlotId?: string;
}

// ✅ NEW: Update to match backend schema
export interface CreateTourBookingRequest {
    tourOperationId?: string;  // Optional - auto-detected từ tourSlotId
    tourSlotId: string;        // Required - slot cụ thể user chọn
    numberOfGuests: number;    // Required, 1-50, phải = guests.length
    contactPhone?: string;     // Optional, max 20 chars
    specialRequests?: string;  // Optional, max 500 chars
    guests: GuestInfoRequest[]; // ✅ NEW: Required, min 1 guest

    // 🔄 LEGACY: Keep for backward compatibility
    adultCount?: number;       // Deprecated
    childCount?: number;       // Deprecated
    contactName?: string;      // Deprecated - use guests[0].guestName
    contactEmail?: string;     // Deprecated - use guests[0].guestEmail
}
```

### **2.2 Update handleSubmit Function**
```typescript
// CURRENT: BookingPage.tsx line 285-295
const bookingRequest: CreateTourBookingRequest = {
    tourOperationId: tourDetails.tourOperation.id,
    numberOfGuests: formValues.numberOfGuests,
    adultCount: formValues.numberOfGuests,
    childCount: 0,
    contactName: formValues.contactName,
    contactPhone: formValues.contactPhone,
    contactEmail: formValues.contactEmail,
    specialRequests: formValues.specialRequests,
    tourSlotId: selectedSlot?.id
};

// ✅ NEW: Include guests array
const bookingRequest: CreateTourBookingRequest = {
    tourSlotId: selectedSlot?.id || '',
    numberOfGuests: formValues.numberOfGuests,
    contactPhone: formValues.contactPhone,
    specialRequests: formValues.specialRequests,
    guests: formValues.guests, // ✅ NEW: Individual guest info

    // 🔄 LEGACY: Keep for backward compatibility
    tourOperationId: tourDetails.tourOperation.id,
    adultCount: formValues.numberOfGuests,
    childCount: 0,
    contactName: formValues.contactName,
    contactEmail: formValues.contactEmail
};
```

### **2.3 Update Validation Function**
```typescript
// CURRENT: validateBookingRequest() line 516-543
// ✅ ADD: Guest validation

export const validateBookingRequest = (request: CreateTourBookingRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Existing validations...
    if (!request.tourSlotId) {
        errors.push('Vui lòng chọn ngày tour');
    }

    if (!request.numberOfGuests || request.numberOfGuests < 1) {
        errors.push('Số lượng người phải lớn hơn 0');
    }

    // ✅ NEW: Guest validations
    if (!request.guests || request.guests.length === 0) {
        errors.push('Thông tin khách hàng là bắt buộc');
    } else {
        // Validate guest count matches
        if (request.guests.length !== request.numberOfGuests) {
            errors.push(`Số lượng thông tin khách hàng (${request.guests.length}) phải khớp với số lượng khách đã chọn (${request.numberOfGuests})`);
        }

        // Validate each guest
        request.guests.forEach((guest, index) => {
            if (!guest.guestName || guest.guestName.trim().length < 2) {
                errors.push(`Tên khách hàng thứ ${index + 1} phải có ít nhất 2 ký tự`);
            }

            if (!guest.guestEmail || !isValidEmail(guest.guestEmail)) {
                errors.push(`Email khách hàng thứ ${index + 1} không hợp lệ`);
            }
        });

        // Validate unique emails
        const emails = request.guests.map(g => g.guestEmail.toLowerCase());
        const uniqueEmails = new Set(emails);
        if (emails.length !== uniqueEmails.size) {
            errors.push('Email khách hàng phải unique trong cùng booking');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
```

---

## 📱 **STEP 3: UPDATE BOOKING DISPLAY COMPONENTS**

### **2.1 Update tourBookingService.ts**
```typescript
// ADD: Import new types
import { 
  CreateTourBookingRequest,
  TourBookingGuest,
  GuestInfoRequest 
} from '../types/individualQR';

// UPDATE: createBooking method
export const createBooking = async (request: CreateTourBookingRequest) => {
  // ✅ NEW: Include guests in request
  return IndividualQRBookingService.createBooking(token, request);
};

// UPDATE: getMyBookings method  
export const getMyBookings = async (pageIndex = 1, pageSize = 10) => {
  // ✅ UPDATED: Response now includes guests array
  return IndividualQRBookingService.getMyBookings(token, pageIndex, pageSize);
};
```

### **2.2 Add QR Code Utilities**
```typescript
// utils/qrCodeUtils.ts
export const downloadQRCode = (qrCodeData: string, guestName: string) => {
  // Generate QR code image và download
  const canvas = document.createElement('canvas');
  QRCode.toCanvas(canvas, qrCodeData, (error) => {
    if (!error) {
      const link = document.createElement('a');
      link.download = `QR_${guestName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  });
};

export const printAllQRCodes = (guests: TourBookingGuest[]) => {
  // Print all individual QR codes
  const printWindow = window.open('', '_blank');
  const qrCodesHtml = guests.map(guest => 
    `<div style="page-break-after: always;">
       <h2>${guest.guestName}</h2>
       <div id="qr-${guest.id}"></div>
     </div>`
  ).join('');
  
  printWindow?.document.write(`
    <html>
      <head><title>QR Codes - Tour Booking</title></head>
      <body>${qrCodesHtml}</body>
    </html>
  `);
  
  // Generate QR codes trong print window
  guests.forEach(guest => {
    if (guest.qrCodeData) {
      QRCode.toCanvas(
        printWindow?.document.getElementById(`qr-${guest.id}`),
        guest.qrCodeData
      );
    }
  });
  
  printWindow?.print();
};
```

---

## 🎨 **STEP 3: UI/UX UPDATES**

### **3.1 Guest Information Form**
```tsx
// components/GuestInfoForm.tsx
const GuestInfoForm = ({ numberOfGuests, onGuestsChange }) => {
  const [guests, setGuests] = useState<GuestInfoRequest[]>([]);

  useEffect(() => {
    // Auto-adjust guest array khi numberOfGuests thay đổi
    const newGuests = Array.from({ length: numberOfGuests }, (_, index) => 
      guests[index] || {
        guestName: '',
        guestEmail: '',
        guestPhone: ''
      }
    );
    setGuests(newGuests);
    onGuestsChange(newGuests);
  }, [numberOfGuests]);

  const updateGuest = (index: number, field: keyof GuestInfoRequest, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
    onGuestsChange(updatedGuests);
  };

  return (
    <div>
      <h3>Thông tin khách hàng</h3>
      {guests.map((guest, index) => (
        <div key={index} className="guest-form">
          <h4>Khách hàng {index + 1}</h4>
          <input
            type="text"
            placeholder="Họ và tên"
            value={guest.guestName}
            onChange={(e) => updateGuest(index, 'guestName', e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={guest.guestEmail}
            onChange={(e) => updateGuest(index, 'guestEmail', e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Số điện thoại (tùy chọn)"
            value={guest.guestPhone || ''}
            onChange={(e) => updateGuest(index, 'guestPhone', e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};
```

### **3.2 Individual QR Display**
```tsx
// components/IndividualQRDisplay.tsx
const IndividualQRDisplay = ({ guests }: { guests: TourBookingGuest[] }) => {
  return (
    <div className="individual-qr-section">
      <h3>QR Codes cá nhân</h3>
      <div className="qr-grid">
        {guests.map(guest => (
          <div key={guest.id} className="qr-card">
            <h4>{guest.guestName}</h4>
            <p>{guest.guestEmail}</p>
            
            {guest.qrCodeData ? (
              <div>
                <QRCode value={guest.qrCodeData} size={150} />
                <div className="qr-actions">
                  <button onClick={() => downloadQRCode(guest.qrCodeData!, guest.guestName)}>
                    📥 Download
                  </button>
                  <button onClick={() => shareQRCode(guest.qrCodeData!, guest.guestName)}>
                    📤 Share
                  </button>
                </div>
              </div>
            ) : (
              <div className="qr-pending">
                <p>⏳ QR code sẽ được tạo sau khi thanh toán</p>
              </div>
            )}
            
            <div className={`check-in-status ${guest.isCheckedIn ? 'checked-in' : 'pending'}`}>
              {guest.isCheckedIn ? (
                <span>✅ Đã check-in lúc {formatDateTime(guest.checkInTime)}</span>
              ) : (
                <span>⏳ Chưa check-in</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bulk-actions">
        <button onClick={() => printAllQRCodes(guests)}>
          🖨️ In tất cả QR codes
        </button>
        <button onClick={() => downloadAllQRCodes(guests)}>
          📥 Tải tất cả QR codes
        </button>
      </div>
    </div>
  );
};
```

---

## 🚀 **STEP 4: IMPLEMENTATION CHECKLIST**

### **✅ Backend Ready:**
- [x] Individual QR generation system
- [x] Guest management APIs
- [x] Tour guide check-in endpoints
- [x] Email system với individual templates
- [x] Database schema updated

### **📱 Frontend Tasks:**
- [ ] Update booking form với guest information
- [ ] Update booking list với guest display
- [ ] Update booking details với individual QRs
- [ ] Implement QR code utilities
- [ ] Add tour guide check-in interface
- [ ] Update API service calls
- [ ] Add error handling cho new flows
- [ ] Test end-to-end scenarios

### **🧪 Testing Tasks:**
- [ ] Unit tests cho new components
- [ ] Integration tests cho API calls
- [ ] E2E tests cho complete flow
- [ ] Performance testing
- [ ] Error scenario testing
- [ ] Backward compatibility testing

---

## ⚠️ **MIGRATION NOTES**

### **🔒 Backward Compatibility:**
- ✅ Existing bookings vẫn hoạt động với legacy QR
- ✅ Old API endpoints vẫn available
- ✅ Gradual migration - không force update

### **📧 Email Changes:**
- ✅ Individual emails cho new bookings
- ✅ Legacy email format cho old bookings
- ✅ QR codes embedded trong emails

### **🎯 Rollback Plan:**
- ✅ Feature flags để enable/disable individual QR
- ✅ Database rollback scripts available
- ✅ API versioning cho compatibility

**🚀 Ready to start migration!**
