# Holiday Tour Date Format Fix

## 🐛 **Vấn đề**

Frontend đang gửi `tourDate` dưới dạng date-only format:
```json
{
  "title": "stttttttttttttring",
  "startLocation": "ttttttt",
  "endLocation": "ttttttttt",
  "templateType": "FreeScenic",
  "tourDate": "2025-11-02",  // ❌ Chỉ có ngày, thiếu thời gian
  "images": []
}
```

Backend cần datetime format đầy đủ:
```json
{
  "tourDate": "2025-11-06T07:00:00.000+07:00"  // ✅ Datetime đầy đủ
}
```

## ✅ **Giải pháp**

### 1. **Cập nhật HolidayTourForm.tsx**

**Trước (lỗi):**
```typescript
tourDate: values.tourDate.format("YYYY-MM-DD")  // ❌ Chỉ ngày
```

**Sau (đúng):**
```typescript
// Đảm bảo tourDate có thời gian mặc định (7:00 AM) nếu chỉ chọn ngày
const tourDateTime = values.tourDate.hour() === 0 && values.tourDate.minute() === 0 
  ? values.tourDate.hour(7).minute(0).second(0) // Set 7:00 AM nếu chưa set thời gian
  : values.tourDate;

tourDate: tourDateTime.format("YYYY-MM-DDTHH:mm:ss.SSSZ") // ✅ Datetime đầy đủ
```

### 2. **Cập nhật Type Definition**

**File:** `src/types/tour.ts`

```typescript
export interface CreateHolidayTourTemplateRequest {
    title: string;
    startLocation: string;
    endLocation: string;
    templateType: TourTemplateType;
    tourDate: string; // Format: YYYY-MM-DDTHH:mm:ss.SSSZ (ISO datetime)
    images: string[];
}
```

### 3. **Logic Xử Lý Thời Gian**

- **Nếu người dùng chỉ chọn ngày:** Tự động set thời gian mặc định là 07:00:00
- **Nếu người dùng chọn cả ngày và giờ:** Giữ nguyên thời gian đã chọn
- **Format cuối cùng:** `YYYY-MM-DDTHH:mm:ss.SSSZ` (ISO 8601 với timezone)

## 🧪 **Test Component**

Tạo component test để kiểm tra format:
```typescript
import HolidayTourDateTest from './components/tourcompany/HolidayTourDateTest';
```

## 📋 **Kết quả**

### **Request Body Mới:**
```json
{
  "title": "Test Holiday Tour",
  "startLocation": "TP.HCM", 
  "endLocation": "Tây Ninh",
  "templateType": "FreeScenic",
  "tourDate": "2025-11-06T07:00:00.000+07:00",  // ✅ Datetime đầy đủ
  "images": []
}
```

### **Các Format Được Hỗ Trợ:**
- `2025-11-06T07:00:00.000+07:00` - Với timezone
- `2025-11-06T07:00:00.000Z` - UTC
- `2025-11-06T07:00:00` - Local time

## 🔧 **Files Đã Sửa**

1. ✅ `src/components/tourcompany/HolidayTourForm.tsx` - Logic format datetime
2. ✅ `src/types/tour.ts` - Cập nhật comment type definition
3. ✅ `src/components/tourcompany/HolidayTourDateTest.tsx` - Component test (mới)

## 🚀 **Cách Test**

1. **Mở Holiday Tour Form**
2. **Chọn ngày trong tương lai**
3. **Submit form**
4. **Kiểm tra Network tab:** Request body sẽ có `tourDate` với format datetime đầy đủ

### **Expected Result:**
```json
{
  "tourDate": "2025-11-06T07:00:00.000+07:00"
}
```

## 💡 **Lưu Ý**

- **Thời gian mặc định:** 07:00 AM (có thể điều chỉnh nếu cần)
- **Timezone:** Tự động detect timezone của user
- **Backward compatibility:** Vẫn hoạt động với DatePicker hiện tại
- **Error handling:** Không ảnh hưởng đến error handling đã implement

Bây giờ backend sẽ nhận được datetime format đúng và có thể xử lý Holiday Tour creation thành công! 🎉

---

## 🖼️ **IMAGE UPLOAD FIX - ADDED**

### 🐛 **Vấn đề Upload Ảnh**

HolidayTourForm đang sử dụng **MOCK UPLOAD** thay vì API thật:

```typescript
// ❌ MOCK (cũ)
const mockUrl = `https://example.com/images/${file.name}`;
setImageUrls((prev) => [...prev, mockUrl]);
```

### ✅ **Giải pháp - Sử dụng API thật**

```typescript
// ✅ API thật (mới)
const imageUrl = await publicService.uploadImage(file);
if (imageUrl) {
  setImageUrls((prev) => [...prev, imageUrl]);
}
```

### 🔧 **API Integration:**

- **Backend Endpoint:** `POST /Image/Upload`
- **Frontend Service:** `publicService.uploadImage(file)`
- **Response Format:** `{ urls: string[] }`
- **Max Files:** 5 ảnh
- **Supported Formats:** .png, .jpg, .jpeg, .webp

### 🧪 **Test Component:**

```typescript
import HolidayTourImageUploadTest from './components/tourcompany/HolidayTourImageUploadTest';
```

### 📋 **Features Added:**

1. ✅ **Real API Upload** - Sử dụng `/Image/Upload` endpoint
2. ✅ **Image Preview** - Hiển thị ảnh đã upload
3. ✅ **Remove Images** - Xóa ảnh đã chọn
4. ✅ **Upload Limit** - Tối đa 5 ảnh
5. ✅ **Loading State** - Hiển thị trạng thái đang upload
6. ✅ **Error Handling** - Xử lý lỗi upload

### 🎯 **Kết quả:**

Holiday Tour bây giờ sẽ upload ảnh thật lên server và gửi URLs thật trong request body! 🚀
