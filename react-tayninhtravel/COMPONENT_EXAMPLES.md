# 🎨 COMPONENT EXAMPLES - Individual QR System

## 📋 **OVERVIEW**
Các component examples cụ thể để implement Individual QR System dựa trên current UI patterns.

---

## 🎯 **1. ENHANCED GUEST INFO FORM**

### **GuestInfoSection.tsx** (NEW COMPONENT)
```tsx
import React from 'react';
import { Card, Form, Input, Row, Col, Typography, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { GuestInfoRequest } from '../types/individualQR';

const { Title } = Typography;

interface GuestInfoSectionProps {
    numberOfGuests: number;
    guests: GuestInfoRequest[];
    onGuestUpdate: (index: number, field: keyof GuestInfoRequest, value: string) => void;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

const GuestInfoSection: React.FC<GuestInfoSectionProps> = ({
    numberOfGuests,
    guests,
    onGuestUpdate,
    contactName,
    contactEmail,
    contactPhone
}) => {
    return (
        <>
            <Divider>Thông tin từng khách hàng</Divider>
            
            {Array.from({ length: numberOfGuests }, (_, index) => {
                const guest = guests[index] || { guestName: '', guestEmail: '', guestPhone: '' };
                const isFirstGuest = index === 0;
                
                return (
                    <Card 
                        key={index} 
                        size="small" 
                        style={{ marginBottom: 16 }}
                        title={
                            <span>
                                👤 Khách hàng {index + 1}
                                {isFirstGuest && <span style={{ color: '#1890ff', fontSize: '12px', marginLeft: 8 }}>
                                    (Người liên hệ chính)
                                </span>}
                            </span>
                        }
                    >
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
                                    initialValue={isFirstGuest ? contactName : ''}
                                >
                                    <Input 
                                        prefix={<UserOutlined />} 
                                        placeholder="Nhập họ và tên đầy đủ"
                                        onChange={(e) => onGuestUpdate(index, 'guestName', e.target.value)}
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
                                    initialValue={isFirstGuest ? contactEmail : ''}
                                >
                                    <Input 
                                        prefix={<MailOutlined />} 
                                        placeholder="email@example.com"
                                        onChange={(e) => onGuestUpdate(index, 'guestEmail', e.target.value)}
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
                            initialValue={isFirstGuest ? contactPhone : ''}
                        >
                            <Input 
                                prefix={<PhoneOutlined />} 
                                placeholder="0123456789"
                                onChange={(e) => onGuestUpdate(index, 'guestPhone', e.target.value)}
                            />
                        </Form.Item>
                    </Card>
                );
            })}
        </>
    );
};

export default GuestInfoSection;
```

---

## 📱 **2. BOOKING CONFIRMATION UPDATE**

### **Update Step 2 Confirmation**
**File:** `src/pages/BookingPage.tsx` line 738-800

**ADD trong confirmation section:**
```tsx
{/* ✅ NEW: Individual guest confirmation */}
<Descriptions title="Thông tin khách hàng" column={1} bordered style={{ marginTop: 16 }}>
    <Descriptions.Item label="Số lượng khách">
        {formValues.numberOfGuests} người
    </Descriptions.Item>
    <Descriptions.Item label="Danh sách khách hàng">
        <div>
            {formValues.guests.map((guest, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                    <strong>{index + 1}. {guest.guestName}</strong>
                    <br />
                    <span style={{ color: '#666' }}>📧 {guest.guestEmail}</span>
                    {guest.guestPhone && (
                        <span style={{ color: '#666', marginLeft: 16 }}>📞 {guest.guestPhone}</span>
                    )}
                </div>
            ))}
        </div>
    </Descriptions.Item>
</Descriptions>
```

---

## 🔧 **3. API SERVICE UPDATE**

### **Update tourBookingService.ts**
**File:** `src/services/tourBookingService.ts`

```typescript
// ✅ UPDATE: Import new types
import { GuestInfoRequest } from '../types/individualQR';

// ✅ UPDATE: CreateTourBookingRequest interface (line 82-92)
export interface CreateTourBookingRequest {
    tourSlotId: string;        // Required - slot cụ thể user chọn
    numberOfGuests: number;    // Required, 1-50, phải = guests.length
    contactPhone?: string;     // Optional, max 20 chars
    specialRequests?: string;  // Optional, max 500 chars
    guests: GuestInfoRequest[]; // ✅ NEW: Required, min 1 guest
    
    // Legacy fields for backward compatibility
    tourOperationId?: string;
    adultCount?: number;
    childCount?: number;
    contactName?: string;
    contactEmail?: string;
}

// ✅ UPDATE: validateBookingRequest function (line 516-543)
export const validateBookingRequest = (request: CreateTourBookingRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

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

// ✅ ADD: Email validation helper
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
```

---

## 📊 **4. BOOKING DISPLAY UPDATES**

### **BookingCard Component Enhancement**
```tsx
// ✅ NEW: Enhanced booking card với guest info
const BookingCard = ({ booking }: { booking: TourBookingDto }) => {
    const hasIndividualGuests = booking.guests && booking.guests.length > 0;
    
    return (
        <Card>
            <div className="booking-header">
                <h3>{booking.bookingCode}</h3>
                <Tag color={getBookingStatusColor(booking.status)}>
                    {getBookingStatusText(booking.status)}
                </Tag>
            </div>
            
            {/* ✅ NEW: Guest information display */}
            <div className="guest-info">
                {hasIndividualGuests ? (
                    <div>
                        <p><strong>{booking.numberOfGuests} khách hàng:</strong></p>
                        <div className="guest-list">
                            {booking.guests.slice(0, 3).map((guest, index) => (
                                <div key={guest.id} className="guest-item">
                                    <span>{guest.guestName}</span>
                                    {guest.isCheckedIn && <span className="check-in-badge">✅</span>}
                                </div>
                            ))}
                            {booking.guests.length > 3 && (
                                <span className="more-guests">
                                    và {booking.guests.length - 3} người khác
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>{booking.numberOfGuests} khách hàng</p>
                )}
            </div>
            
            {/* ✅ NEW: QR Code section */}
            <div className="qr-section">
                {hasIndividualGuests ? (
                    <div>
                        <p><strong>QR Codes:</strong></p>
                        <div className="qr-status">
                            {booking.guests.filter(g => g.qrCodeData).length} / {booking.guests.length} QR codes ready
                        </div>
                    </div>
                ) : (
                    booking.qrCodeData && <p>QR Code: Available</p>
                )}
            </div>
        </Card>
    );
};
```

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **✅ Files to Update:**
- [ ] `src/pages/BookingPage.tsx` - Main booking form
- [ ] `src/services/tourBookingService.ts` - API interfaces
- [ ] `src/types/individualQR.ts` - Type definitions (already created)
- [ ] `src/components/booking/` - Display components

### **✅ New Components to Create:**
- [ ] `GuestInfoSection.tsx` - Individual guest form
- [ ] `IndividualQRDisplay.tsx` - QR code display
- [ ] `BookingGuestList.tsx` - Guest list component

### **✅ Testing Tasks:**
- [ ] Test single guest booking
- [ ] Test multiple guests booking
- [ ] Test validation scenarios
- [ ] Test payment flow
- [ ] Test QR code generation

**🚀 Start implementation với BookingPage.tsx updates!**
