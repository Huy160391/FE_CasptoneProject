# 🎫 FRONTEND MIGRATION PLAN - Individual QR System

## 📋 **CURRENT FLOW ANALYSIS**

### **Current BookingPage Flow:**
```
Step 0: Tour Info & Slot Selection
Step 1: Contact Info (1 person + numberOfGuests)
Step 2: Confirmation & Payment
```

### **Current Guest Info Collection:**
- ✅ `contactName` - 1 người liên hệ
- ✅ `contactPhone` - số điện thoại liên hệ  
- ✅ `contactEmail` - email liên hệ
- ✅ `numberOfGuests` - số lượng khách
- ❌ **MISSING**: Individual guest information

---

## 🎯 **MIGRATION STRATEGY**

### **Keep Current 3-Step Flow + Enhance Step 1**
```
Step 0: Tour Info & Slot Selection (NO CHANGE)
Step 1: Contact Info + Individual Guest Info (ENHANCED)
Step 2: Confirmation & Payment (MINOR UPDATE)
```

---

## 🔧 **SPECIFIC CODE CHANGES**

### **1. Update BookingFormData Interface**
**File:** `src/pages/BookingPage.tsx` line 50-56

```typescript
// CURRENT
interface BookingFormData {
    numberOfGuests: number;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    specialRequests?: string;
}

// ✅ NEW
interface BookingFormData {
    numberOfGuests: number;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    specialRequests?: string;
    guests: GuestInfoRequest[]; // ✅ ADD THIS
}
```

### **2. Update Initial State**
**File:** `src/pages/BookingPage.tsx` line 78-84

```typescript
// CURRENT
const [formValues, setFormValues] = useState<BookingFormData>({
    numberOfGuests: 1,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequests: ''
});

// ✅ NEW
const [formValues, setFormValues] = useState<BookingFormData>({
    numberOfGuests: 1,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequests: '',
    guests: [{ guestName: '', guestEmail: '', guestPhone: '' }] // ✅ ADD THIS
});
```

### **3. Update Step 1 Form**
**File:** `src/pages/BookingPage.tsx` line 637-723

**ADD sau existing contact form:**
```tsx
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
                        { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
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
                        { type: 'email', message: 'Email không hợp lệ' }
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
        >
            <Input 
                prefix={<PhoneOutlined />} 
                placeholder="0123456789"
                onChange={(e) => updateGuestInfo(index, 'guestPhone', e.target.value)}
            />
        </Form.Item>
    </Card>
))}
```

### **4. Add Helper Functions**
**File:** `src/pages/BookingPage.tsx` - ADD these functions

```typescript
const updateGuestInfo = (index: number, field: keyof GuestInfoRequest, value: string) => {
    const updatedGuests = [...formValues.guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    
    setFormValues(prev => ({
        ...prev,
        guests: updatedGuests
    }));
};

// UPDATE existing handleFormValuesChange function
const handleFormValuesChange = (changedValues: Partial<BookingFormData>, allValues: BookingFormData) => {
    setFormValues(allValues);

    if (changedValues.numberOfGuests) {
        // ✅ NEW: Auto-adjust guests array
        const newGuestCount = allValues.numberOfGuests;
        const newGuests = Array.from({ length: newGuestCount }, (_, index) => {
            if (index < formValues.guests.length) {
                return formValues.guests[index]; // Keep existing data
            } else {
                // Auto-populate first guest với contact info
                if (index === 0) {
                    return {
                        guestName: allValues.contactName || '',
                        guestEmail: allValues.contactEmail || '',
                        guestPhone: allValues.contactPhone || ''
                    };
                }
                return { guestName: '', guestEmail: '', guestPhone: '' };
            }
        });
        
        setFormValues(prev => ({ ...prev, guests: newGuests }));
        handleGuestCountChange(allValues);
    }
};
```

### **5. Update handleSubmit Request**
**File:** `src/pages/BookingPage.tsx` line 285-295

```typescript
// CURRENT
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

// ✅ NEW
const bookingRequest: CreateTourBookingRequest = {
    tourSlotId: selectedSlot?.id || '',
    numberOfGuests: formValues.numberOfGuests,
    contactPhone: formValues.contactPhone,
    specialRequests: formValues.specialRequests,
    guests: formValues.guests, // ✅ NEW: Individual guest info
    
    // Keep legacy fields for compatibility
    tourOperationId: tourDetails.tourOperation.id,
    adultCount: formValues.numberOfGuests,
    childCount: 0,
    contactName: formValues.contactName,
    contactEmail: formValues.contactEmail
};
```

---

## 📊 **STEP-BY-STEP IMPLEMENTATION**

### **Phase 1: Basic Individual Guest Collection**
1. ✅ Update BookingFormData interface
2. ✅ Update initial state với guests array
3. ✅ Add individual guest form fields
4. ✅ Add updateGuestInfo helper function
5. ✅ Update handleFormValuesChange

### **Phase 2: API Integration**
6. ✅ Update CreateTourBookingRequest interface
7. ✅ Update handleSubmit request object
8. ✅ Update validation function
9. ✅ Test API call với new format

### **Phase 3: Display Updates**
10. ✅ Update Step 2 confirmation để show individual guests
11. ✅ Update booking history để show guest info
12. ✅ Add QR code display cho individual guests

### **Phase 4: Testing & Polish**
13. ✅ Test complete booking flow
14. ✅ Test validation scenarios
15. ✅ Test payment success flow
16. ✅ Polish UI/UX

---

## 🧪 **TESTING PLAN**

### **Test Scenario 1: Single Guest Booking**
```typescript
const testData = {
    numberOfGuests: 1,
    contactName: 'Nguyễn Văn A',
    contactPhone: '+84901234567',
    contactEmail: 'nguyenvana@test.com',
    guests: [
        {
            guestName: 'Nguyễn Văn A',
            guestEmail: 'nguyenvana@test.com',
            guestPhone: '+84901234567'
        }
    ]
};
```

### **Test Scenario 2: Multiple Guests Booking**
```typescript
const testData = {
    numberOfGuests: 3,
    contactName: 'Nguyễn Văn A',
    contactPhone: '+84901234567',
    contactEmail: 'nguyenvana@test.com',
    guests: [
        {
            guestName: 'Nguyễn Văn A',
            guestEmail: 'nguyenvana@test.com',
            guestPhone: '+84901234567'
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
};
```

### **Test Scenario 3: Validation Errors**
- ✅ numberOfGuests ≠ guests.length
- ✅ Duplicate guest emails
- ✅ Invalid email formats
- ✅ Empty guest names
- ✅ Guest name < 2 characters

---

## ⚠️ **IMPORTANT NOTES**

### **🔒 Backward Compatibility:**
- ✅ Keep existing contactName, contactPhone, contactEmail fields
- ✅ Legacy API format vẫn supported
- ✅ Existing bookings không bị ảnh hưởng

### **🎯 Key Changes:**
- ✅ Step 1 form expanded với individual guest fields
- ✅ API request include guests array
- ✅ Validation enhanced cho guest data
- ✅ Payment flow unchanged (Enhanced Payment System)

### **🚀 Implementation Priority:**
1. **HIGH**: Update booking form với guest collection
2. **MEDIUM**: Update API service và validation
3. **LOW**: Update display components với guest info

**Ready to implement! Start với Phase 1! 🎉**
