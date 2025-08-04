# H??NG D?N API LU?NG R�T TI?N

## ?? T?ng quan lu?ng r�t ti?n
1. **L?y danh s�ch ng�n h�ng h? tr?** (t�y ch?n)
2. **T?o/qu?n l� t�i kho?n ng�n h�ng**
3. **T?o y�u c?u r�t ti?n**
4. **Theo d�i tr?ng th�i y�u c?u**
5. **Admin x? l� y�u c?u** (backend)

---

## ?? 1. L?y danh s�ch ng�n h�ng h? tr?

### `GET /api/BankAccount/supported-banks`
- **Method**: GET
- **Authentication**: Kh�ng c?n (AllowAnonymous)
- **Tham s?**: Kh�ng
- **T�c d?ng**: L?y danh s�ch 29+ ng�n h�ng h? tr? t?i Vi?t Nam + t�y ch?n "Ng�n h�ng kh�c"
- **Response**: Danh s�ch ng�n h�ng v?i t�n hi?n th?, t�n vi?t t?t

```json
{
  "isSuccess": true,
  "data": [
    {
      "value": 0,
      "name": "Vietcombank",
      "displayName": "Ng�n h�ng Ngo?i th??ng Vi?t Nam (Vietcombank)",
      "shortName": "VCB",
      "isActive": true
    },
    {
      "value": 999,
      "name": "Other",
      "displayName": "Ng�n h�ng kh�c",
      "shortName": "OTHER",
      "isActive": true
    }
  ]
}
```

---

## ?? 2. Qu?n l� t�i kho?n ng�n h�ng

### 2.1 T?o t�i kho?n ng�n h�ng
**`POST /api/BankAccount`**
- **Method**: POST
- **Authentication**: Bearer Token
- **Body** (Ch?n t? danh s�ch ng�n h�ng c� s?n):
```json
{
  "supportedBankId": 0,
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "accountHolderName": "NGUYEN VAN A",
  "isDefault": true,
  "notes": "T�i kho?n ch�nh"
}
```

- **Body** (Ch?n "Ng�n h�ng kh�c"):
```json
{
  "supportedBankId": 999,
  "bankName": "Vietcombank",
  "customBankName": "Ng�n h�ng ABC XYZ",
  "accountNumber": "1234567890",
  "accountHolderName": "NGUYEN VAN A",
  "isDefault": true,
  "notes": "T�i kho?n ng�n h�ng kh�c"
}
```

- **Body** (Backward compatibility - kh�ng d�ng enum):
```json
{
  "bankName": "T�n ng�n h�ng t? do",
  "accountNumber": "1234567890",
  "accountHolderName": "NGUYEN VAN A",
  "isDefault": true,
  "notes": "T�i kho?n t? do"
}
```

- **T�c d?ng**: T?o t�i kho?n ng�n h�ng ?? nh?n ti?n r�t

### 2.2 L?y danh s�ch t�i kho?n ng�n h�ng
**`GET /api/BankAccount/my-accounts`**
- **Method**: GET
- **Authentication**: Bearer Token
- **T�c d?ng**: L?y t?t c? t�i kho?n ng�n h�ng c?a user hi?n t?i

### 2.3 L?y t�i kho?n m?c ??nh
**`GET /api/BankAccount/default`**
- **Method**: GET
- **Authentication**: Bearer Token
- **T�c d?ng**: L?y t�i kho?n ng�n h�ng m?c ??nh ?? pre-fill form

---

## ?? 3. T?o y�u c?u r�t ti?n

### 3.1 Validate tr??c khi t?o y�u c?u
**`POST /api/WithdrawalRequest/validate`**
- **Method**: POST
- **Authentication**: Bearer Token
- **Body**:
```json
{
  "amount": 100000,
  "bankAccountId": "guid-id"
}
```
- **T�c d?ng**: Ki?m tra s? d? v�, t�i kho?n ng�n h�ng h?p l?

### 3.2 Ki?m tra ?i?u ki?n t?o y�u c?u
**`GET /api/WithdrawalRequest/can-create`**
- **Method**: GET
- **Authentication**: Bearer Token
- **T�c d?ng**: Ki?m tra user c� th? t?o y�u c?u m?i kh�ng (kh�ng c� y�u c?u pending)

### 3.3 T?o y�u c?u r�t ti?n
**`POST /api/WithdrawalRequest`**
- **Method**: POST
- **Authentication**: Bearer Token
- **Body**:
```json
{
  "bankAccountId": "guid-id",
  "amount": 100000,
  "userNotes": "R�t ti?n l??ng th�ng 12"
}
```
- **T�c d?ng**: T?o y�u c?u r�t ti?n v?i tr?ng th�i Pending

---

## ?? 4. Theo d�i y�u c?u r�t ti?n

### 4.1 L?y danh s�ch y�u c?u c?a user
**`GET /api/WithdrawalRequest/my-requests`**
- **Method**: GET
- **Authentication**: Bearer Token
- **Query Parameters**:
  - `status` (optional): 0=Pending, 1=Approved, 2=Rejected, 3=Cancelled
  - `pageNumber` (default: 1)
  - `pageSize` (default: 10)
- **T�c d?ng**: Xem l?ch s? v� tr?ng th�i c�c y�u c?u r�t ti?n

### 4.2 L?y chi ti?t y�u c?u r�t ti?n
**`GET /api/WithdrawalRequest/{id}`**
- **Method**: GET
- **Authentication**: Bearer Token
- **T�c d?ng**: Xem chi ti?t m?t y�u c?u r�t ti?n c? th?

### 4.3 L?y y�u c?u g?n nh?t
**`GET /api/WithdrawalRequest/latest`**
- **Method**: GET
- **Authentication**: Bearer Token
- **T�c d?ng**: Xem y�u c?u r�t ti?n g?n nh?t c?a user

### 4.4 H?y y�u c?u r�t ti?n
**`PUT /api/WithdrawalRequest/{id}/cancel`**
- **Method**: PUT
- **Authentication**: Bearer Token
- **Body**:
```json
{
  "reason": "L� do h?y y�u c?u"
}
```
- **T�c d?ng**: H?y y�u c?u r�t ti?n ?ang ? tr?ng th�i Pending

### 4.5 L?y th?ng k� r�t ti?n
**`GET /api/WithdrawalRequest/stats`**
- **Method**: GET
- **Authentication**: Bearer Token
- **T�c d?ng**: Xem th?ng k� t?ng quan v? c�c y�u c?u r�t ti?n

---

## ?? 5. Admin APIs (Backend x? l�)

### 5.1 L?y danh s�ch y�u c?u cho admin
**`GET /api/admin/withdrawals`**
- **Method**: GET
- **Authentication**: Admin Role
- **T�c d?ng**: Admin xem t?t c? y�u c?u r�t ti?n

### 5.2 Duy?t y�u c?u r�t ti?n
**`PUT /api/admin/withdrawals/{id}/approve`**
- **Method**: PUT
- **Authentication**: Admin Role
- **T�c d?ng**: Admin ph� duy?t y�u c?u r�t ti?n

### 5.3 T? ch?i y�u c?u r�t ti?n
**`PUT /api/admin/withdrawals/{id}/reject`**
- **Method**: PUT
- **Authentication**: Admin Role
- **T�c d?ng**: Admin t? ch?i y�u c?u r�t ti?n

---

## ?? Lu?ng Frontend khuy?n ngh?

### **1. Trang qu?n l� t�i kho?n ng�n h�ng**: 
- G?i API 1 ?? hi?n th? dropdown ng�n h�ng
- G?i API 2.1, 2.2, 2.3

### **2. Form t?o t�i kho?n ng�n h�ng**:
```javascript
// Step 1: L?y danh s�ch ng�n h�ng
const banksResponse = await fetch('/api/BankAccount/supported-banks');
const banks = banksResponse.data;

// Step 2: Hi?n th? dropdown
// - C�c ng�n h�ng th??ng: banks.filter(b => b.value !== 999)
// - Ng�n h�ng kh�c: banks.find(b => b.value === 999)

// Step 3: X? l� form
if (selectedBankId === 999) {
  // Hi?n th? input cho customBankName
  payload = {
    supportedBankId: 999,
    bankName: "Other", // c� th? ?? tr?ng
    customBankName: userInput,
    // ... other fields
  }
} else {
  // D�ng ng�n h�ng c� s?n
  payload = {
    supportedBankId: selectedBankId,
    bankName: selectedBank.displayName,
    // ... other fields
  }
}
```

### **3. Trang t?o y�u c?u r�t ti?n**: 
- G?i API 2.2 ?? ch?n t�i kho?n ng�n h�ng
- G?i API 3.1 ?? validate
- G?i API 3.3 ?? t?o y�u c?u

### **4. Trang l?ch s? r�t ti?n**: 
- G?i API 4.1, 4.2, 4.5

### **5. Real-time updates**: 
- S? d?ng SignalR ho?c polling API 4.3

---

## ?? L?u � quan tr?ng

- **S? ti?n t?i thi?u**: 1,000 VN?
- **Tr?ng th�i**: Pending ? Approved/Rejected/Cancelled
- **B?o m?t**: S? t�i kho?n ???c mask khi hi?n th?
- **Validation**: Ki?m tra s? d? v� tr??c khi cho ph�p r�t ti?n
- **Duplicate check**: Kh�ng cho ph�p t�i kho?n ng�n h�ng tr�ng l?p
- **T�nh n?ng m?i**: 
  - ? **H? tr? ch?n t? 29+ ng�n h�ng c� s?n**
  - ? **T�y ch?n "Ng�n h�ng kh�c" cho ph�p nh?p t? do**
  - ? **Backward compatibility v?i API c?**
  - ? **Validation t�n ng�n h�ng t? do khi ch?n "Other"**

---

## ?? **T�nh n?ng "Ng�n h�ng kh�c"**

### **Logic x? l�**:
1. **Ch?n ng�n h�ng t? danh s�ch**: `supportedBankId` != 999 ? D�ng t�n t? enum
2. **Ch?n "Ng�n h�ng kh�c"**: `supportedBankId` = 999 ? B?t bu?c c� `customBankName`
3. **Kh�ng ch?n enum**: `supportedBankId` = null ? D�ng `bankName` (backward compatibility)

### **Validation**:
- Khi `supportedBankId` = 999: `customBankName` l� b?t bu?c
- `customBankName` t?i ?a 100 k� t?
- Duplicate check �p d?ng cho t�n cu?i c�ng (sau khi x? l�)