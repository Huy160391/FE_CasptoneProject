# ?? H? TH?NG VOUCHER - H??NG D?N API ??N GI?N

## ?? Base URL
```
https://localhost:7205/api/Product
```

---

## ????? ADMIN APIs

### 1. ?? T?o voucher m?i
```http
POST /api/Product/Create-Voucher
```

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body truy?n vào:**
```json
{
    "name": "Gi?m 50K cu?i tu?n",
    "description": "Voucher gi?m giá cu?i tu?n",
    "quantity": 100,
    "discountAmount": 50000,
    "discountPercent": null,
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-21T23:59:59Z"
}
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "Voucher ?ã ???c t?o thành công và thông báo ?ã ???c g?i ??n t?t c? ng??i dùng",
    "success": true,
    "voucherId": "550e8400-e29b-41d4-a716-446655440000",
    "voucherName": "Gi?m 50K cu?i tu?n",
    "quantity": 100
}
```

---

### 2. ?? Xem t?t c? voucher (Admin)
```http
GET /api/Product/GetAll-Voucher?pageIndex=1&pageSize=10&textSearch=&status=true
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `pageIndex`: Trang hi?n t?i (1, 2, 3...)
- `pageSize`: S? l??ng m?i trang (m?c ??nh 10)
- `textSearch`: Tìm ki?m theo tên voucher (có th? ?? tr?ng)
- `status`: true = active, false = inactive, không truy?n = t?t c?

**Response:**
```json
{
    "statusCode": 200,
    "message": "L?y danh sách voucher thành công",
    "success": true,
    "data": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Gi?m 50K cu?i tu?n",
            "description": "Voucher gi?m giá cu?i tu?n",
            "quantity": 100,
            "usedCount": 15,
            "remainingCount": 85,
            "discountAmount": 50000,
            "discountPercent": null,
            "startDate": "2024-01-15T00:00:00Z",
            "endDate": "2024-01-21T23:59:59Z",
            "isActive": true,
            "isExpired": false,
            "createdAt": "2024-01-14T10:00:00Z"
        }
    ],
    "totalRecord": 1,
    "totalPages": 1
}
```

---

### 3. ?? C?p nh?t voucher
```http
PUT /api/Product/Update-Voucher/{voucherId}
```

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body truy?n vào:**
```json
{
    "name": "Gi?m 75K cu?i tu?n (Updated)",
    "description": "Mô t? m?i",
    "quantity": 150,
    "discountAmount": 75000,
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-25T23:59:59Z",
    "isActive": true
}
```

---

### 4. ??? Xóa voucher
```http
DELETE /api/Product/Voucher/{voucherId}
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "Xóa voucher thành công",
    "success": true
}
```

---

### 5. ?? Xem thông tin voucher c? th?
```http
GET /api/Product/GetVoucher/{voucherId}
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "L?y thông tin voucher thành công",
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Gi?m 50K cu?i tu?n",
        "description": "Voucher gi?m giá cu?i tu?n",
        "quantity": 100,
        "usedCount": 15,
        "remainingCount": 85,
        "discountAmount": 50000,
        "discountPercent": null,
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": "2024-01-21T23:59:59Z",
        "isActive": true
    }
}
```

---

## ?? USER APIs

### 1. ?? Xem voucher kh? d?ng
```http
GET /api/Product/GetAvailable-Vouchers?pageIndex=1&pageSize=10
```

**Headers:**
```
Authorization: Bearer {user_token}
```

**Query Parameters:**
- `pageIndex`: Trang hi?n t?i (1, 2, 3...)
- `pageSize`: S? l??ng m?i trang (m?c ??nh 10)

**Response:**
```json
{
    "statusCode": 200,
    "message": "L?y danh sách voucher kh? d?ng thành công",
    "success": true,
    "data": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Gi?m 50K cu?i tu?n",
            "description": "Voucher gi?m giá cu?i tu?n",
            "discountAmount": 50000,
            "discountPercent": null,
            "remainingCount": 85,
            "startDate": "2024-01-15T00:00:00Z",
            "endDate": "2024-01-21T23:59:59Z",
            "isExpiringSoon": false
        }
    ],
    "totalRecord": 1,
    "totalPages": 1
}
```

---

### 2. ?? Checkout v?i voucher
```http
POST /api/Product/checkout
```

**Headers:**
```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Body truy?n vào:**
```json
{
    "cartItemIds": [
        "123e4567-e89b-12d3-a456-426614174001",
        "123e4567-e89b-12d3-a456-426614174002"
    ],
    "voucherId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**L?u ý:**
- `cartItemIds`: Danh sách ID các s?n ph?m trong gi? hàng (b?t bu?c)
- `voucherId`: ID voucher mu?n áp d?ng (có th? ?? tr?ng n?u không dùng voucher)

**Response thành công:**
```json
{
    "checkoutUrl": "https://checkout.payos.vn/web/...",
    "orderId": "789e0123-e45f-67g8-h901-234567890123",
    "totalOriginal": 60000,
    "discountAmount": 50000,
    "totalAfterDiscount": 10000
}
```

**Response l?i (ví d? s?n ph?m ?ang sale):**
```json
{
    "message": "S?n ph?m \"Tên s?n ph?m\" ?ang ???c gi?m giá, không th? áp d?ng voucher."
}
```

---

## ?? QUY T?C S? D?NG

### Khi t?o voucher:
1. **Ph?i có ít nh?t m?t lo?i gi?m giá**: `discountAmount > 0` HO?C `discountPercent > 0`
2. **Không ???c có c? hai**: Ch? ch?n m?t trong hai lo?i gi?m
3. **Ngày h?p l?**: `startDate < endDate`
4. **S? l??ng**: `1 <= quantity <= 10,000`

### Khi s? d?ng voucher:
1. **Voucher ph?i còn hi?u l?c**: ch?a h?t h?n và còn l??t s? d?ng
2. **Không dùng v?i s?n ph?m sale**: N?u gi? hàng có s?n ph?m ?ang gi?m giá thì không th? dùng voucher
3. **T?i thi?u 1 VN?**: Sau khi áp d?ng voucher, s? ti?n thanh toán t?i thi?u là 1 VN?

---

## ?? VÍ D? S? D?NG JAVASCRIPT

### T?o voucher (Admin):
```javascript
const createVoucher = async () => {
    const response = await fetch('/api/Product/Create-Voucher', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: "Flash Sale 100K",
            description: "Voucher flash sale",
            quantity: 50,
            discountAmount: 100000,
            discountPercent: null,
            startDate: "2024-01-20T00:00:00Z",
            endDate: "2024-01-25T23:59:59Z"
        })
    });
    
    const result = await response.json();
    console.log(result);
};
```

### L?y voucher kh? d?ng (User):
```javascript
const getAvailableVouchers = async () => {
    const response = await fetch('/api/Product/GetAvailable-Vouchers?pageIndex=1&pageSize=20', {
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
    });
    
    const result = await response.json();
    if (result.success) {
        console.log(`Có ${result.data.length} voucher kh? d?ng`);
        return result.data;
    }
    return [];
};
```

### Checkout v?i voucher (User):
```javascript
const checkoutWithVoucher = async (cartItemIds, voucherId) => {
    const response = await fetch('/api/Product/checkout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cartItemIds: cartItemIds,
            voucherId: voucherId  // Có th? ?? null n?u không dùng voucher
        })
    });
    
    const result = await response.json();
    
    if (response.ok && result.checkoutUrl) {
        // Chuy?n h??ng ??n trang thanh toán PayOS
        window.location.href = result.checkoutUrl;
    } else {
        alert(`L?i checkout: ${result.message}`);
    }
    
    return result;
};
```

---

## ?? TÓM T?T NHANH

**Admin có th?:**
- T?o voucher m?i ? `POST /api/Product/Create-Voucher`
- Xem t?t c? voucher ? `GET /api/Product/GetAll-Voucher`
- C?p nh?t voucher ? `PUT /api/Product/Update-Voucher/{id}`
- Xóa voucher ? `DELETE /api/Product/Voucher/{id}`
- Xem chi ti?t voucher ? `GET /api/Product/GetVoucher/{id}`

**User có th?:**
- Xem voucher kh? d?ng ? `GET /api/Product/GetAvailable-Vouchers`
- Checkout v?i voucher ? `POST /api/Product/checkout` (truy?n voucherId)