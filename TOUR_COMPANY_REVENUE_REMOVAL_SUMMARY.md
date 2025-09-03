# Tài liệu xóa màn hình Revenue Dashboard và Reviews của Tour Company

## Tổng quan về cấu trúc Tour Company

### 1. Cấu trúc Routing
- **Route chính**: `/tour-company/*`
- **Layout**: `TourCompanyLayout` (src/components/layout/TourCompanyLayout.tsx)
- **Routes con**: Được định nghĩa trong `tourCompanyRoutes.tsx`

### 2. Các màn hình Tour Company hiện có (sau khi xóa revenue và reviews)

| Route | Component | Mô tả |
|-------|-----------|-------|
| `/tour-company/dashboard` | TourCompanyDashboard | Dashboard chính với thống kê tổng quan |
| `/tour-company/tour-templates` | TourTemplateManagement | Quản lý template tour |
| `/tour-company/tours` | TourDetailsManagement | Quản lý chi tiết tour |
| `/tour-company/tours-old` | TourManagement | Quản lý tour (phiên bản cũ) |
| `/tour-company/analytics` | DetailedAnalytics | Phân tích chi tiết |
| `/tour-company/wallet` | TourCompanyWalletManagement | Quản lý ví |
| `/tour-company/incidents` | IncidentManagement | Quản lý sự cố |
| `/tour-company/profile` | TourCompanyProfile | Thông tin cá nhân |

### 3. Sidebar Menu
Sidebar được định nghĩa trong `TourCompanyLayout.tsx` với các menu items:
- Dashboard
- Tour Templates
- Tours Management
- Wallet (Quản lý ví)

## Những thay đổi đã thực hiện

### 1. Xóa Route Revenue
**File**: `src/routes/tourCompanyRoutes.tsx`
- Xóa import `RevenueDashboard`
- Xóa route `revenue` khỏi children array

### 2. Xóa Menu Item Revenue
**File**: `src/components/layout/TourCompanyLayout.tsx`
- Xóa menu item `/tour-company/revenue` khỏi menuItems array
- Xóa import `BarChartOutlined` (không còn sử dụng)

### 3. Xóa Component Files
- Xóa `src/pages/tourcompany/RevenueDashboard.tsx`
- Xóa `src/pages/tourcompany/RevenueDashboard.scss`

### 4. Cập nhật Translation Files
**File**: `src/i18n/messages/vi.json`
- Xóa key `revenue` khỏi `tourCompany.sidebar`
- Xóa toàn bộ section `tourCompany.revenue`

**File**: `src/i18n/messages/en.json`
- Xóa key `revenue` khỏi `tourCompany.sidebar`
- Xóa toàn bộ section `tourCompany.revenue`

## Thông tin quan trọng

### 1. Dashboard chính vẫn có thông tin doanh thu
`TourCompanyDashboard` vẫn hiển thị các thông tin doanh thu cơ bản:
- Doanh thu trước thuế
- Doanh thu sau thuế
- Doanh thu trung bình/booking
- Thông tin VAT và phí nền tảng

### 2. Admin Revenue Dashboard không bị ảnh hưởng
`AdminRevenueDashboard` (dành cho admin) vẫn hoạt động bình thường tại `/admin/revenue-dashboard`

### 3. Các component khác không bị ảnh hưởng
- Các màn hình khác của tour company vẫn hoạt động bình thường
- Routing và navigation vẫn ổn định
- Build thành công không có lỗi

## Kiểm tra sau khi thay đổi

✅ **Build thành công**: `npm run build` chạy không có lỗi
✅ **Routing clean**: Không còn reference đến RevenueDashboard trong tour company context
✅ **Translation clean**: Xóa sạch các key liên quan đến revenue
✅ **Import clean**: Xóa các import không sử dụng

## Lưu ý cho tương lai

1. **Nếu cần khôi phục**: Có thể tham khảo git history để khôi phục màn hình revenue
2. **Thông tin doanh thu**: Vẫn có thể xem thông tin doanh thu cơ bản trong dashboard chính
3. **Analytics**: Màn hình analytics (`/tour-company/analytics`) vẫn có thể chứa thông tin phân tích doanh thu chi tiết
