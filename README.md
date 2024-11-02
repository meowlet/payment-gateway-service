# API Thanh toán

Tài liệu này mô tả chi tiết về các API endpoint phục vụ chức năng thanh toán.

## Base URL

```
http://localhost:3000/api
```

## 1. Tạo URL Thanh toán

Tạo một URL thanh toán mới và chuyển người dùng đến trang thanh toán của nhà cung cấp (ví dụ: MoMo).

### Endpoint

```
POST /payments
```

### Request Body

| Trường             | Kiểu   | Bắt buộc | Mô tả                                                        |
| ------------------ | ------ | -------- | ------------------------------------------------------------ |
| amount             | string | Có       | Số tiền thanh toán (VND)                                     |
| orderInfo          | object | Có       | Thông tin đơn hàng                                           |
| orderInfo.userId   | string | Có       | ID người dùng (24 ký tự)                                     |
| orderInfo.message  | string | Có       | Nội dung thanh toán                                          |
| orderInfo.type     | string | Có       | Loại giao dịch (`PREMIUM_SUBSCRIPTION` hoặc `AUTHOR_PAYOUT`) |
| orderInfo.metadata | object | Không    | Dữ liệu bổ sung của đơn hàng                                 |
| paymentItems       | array  | Không    | Chi tiết các mục thanh toán                                  |
| options            | object | Không    | Tùy chọn thanh toán                                          |

### Ví dụ Request Body

```json
{
  "amount": "199000",
  "orderInfo": {
    "userId": "507f1f77bcf86cd799439011",
    "message": "Nâng cấp tài khoản Premium - 1 tháng",
    "type": "PREMIUM_SUBSCRIPTION",
    "metadata": {
      "subscriptionTier": "premium",
      "durationMonths": 1
    }
  }
}
```

### Response

```json
{
  "success": true,
  "paymentUrl": "https://payment-url-from-provider"
}
```

## 2. Kiểm tra Trạng thái Thanh toán

Kiểm tra trạng thái của một giao dịch thanh toán.

### Endpoint

```
GET /payments/:orderId
```

### Parameters

| Tham số | Kiểu   | Mô tả                      |
| ------- | ------ | -------------------------- |
| orderId | string | ID của đơn hàng (24 ký tự) |

### Response

```json
{
  "success": true,
  "transaction": {
    "id": "transaction-id",
    "userId": "user-id",
    "amount": "199000",
    "status": "PENDING",
    "orderInfo": "Nâng cấp tài khoản Premium - 1 tháng",
    "createdAt": "2024-11-02T10:30:00Z",
    "updatedAt": "2024-11-02T10:30:00Z"
  }
}
```

## 3. Lấy Lịch sử Giao dịch

Lấy danh sách các giao dịch của một người dùng.

### Endpoint

```
GET /users/:userId/transactions
```

### Parameters

| Tham số | Kiểu   | Mô tả                        |
| ------- | ------ | ---------------------------- |
| userId  | string | ID của người dùng (24 ký tự) |

### Response

```json
{
  "success": true,
  "transactions": [
    {
      "id": "transaction-id-1",
      "amount": "199000",
      "status": "SUCCESS",
      "orderInfo": "Nâng cấp tài khoản Premium - 1 tháng",
      "createdAt": "2024-11-02T10:30:00Z"
    }
  ]
}
```

## Trạng thái Thanh toán

| Mã      | Mô tả                 |
| ------- | --------------------- |
| PENDING | Đang chờ thanh toán   |
| SUCCESS | Thanh toán thành công |
| FAILED  | Thanh toán thất bại   |

## Loại Giao dịch

| Mã                   | Mô tả                                 |
| -------------------- | ------------------------------------- |
| PREMIUM_SUBSCRIPTION | Thanh toán nâng cấp tài khoản Premium |
| AUTHOR_PAYOUT        | Thanh toán nhuận bút cho tác giả      |

## Ví dụ Sử dụng

### 1. Tạo thanh toán đơn giản

```bash
curl -X POST http://localhost:3000/api/payments \
-H "Content-Type: application/json" \
-d '{
    "amount": "199000",
    "orderInfo": {
        "userId": "507f1f77bcf86cd799439011",
        "message": "Nâng cấp tài khoản Premium - 1 tháng",
        "type": "PREMIUM_SUBSCRIPTION"
    }
}'
```

### 2. Tạo thanh toán với tùy chọn đầy đủ

```bash
curl -X POST http://localhost:3000/api/payments \
-H "Content-Type: application/json" \
-d '{
    "amount": "199000",
    "orderInfo": {
        "userId": "507f1f77bcf86cd799439011",
        "message": "Nâng cấp tài khoản Premium - 1 tháng",
        "type": "PREMIUM_SUBSCRIPTION",
        "metadata": {
            "subscriptionTier": "premium",
            "durationMonths": 1,
            "features": ["unlimited_reading", "no_ads"]
        }
    },
    "paymentItems": [
        {
            "name": "Gói Premium",
            "price": 199000,
            "currency": "VND",
            "quantity": 1,
            "totalPrice": 199000
        }
    ],
    "options": {
        "lang": "vi",
        "paymentProvider": "MOMO"
    }
}'
```

### 3. Kiểm tra trạng thái thanh toán

```bash
curl http://localhost:3000/api/payments/507f1f77bcf86cd799439011
```

### 4. Xem lịch sử giao dịch

```bash
curl http://localhost:3000/api/users/507f1f77bcf86cd799439011/transactions
```

## Xử lý Lỗi

API trả về các mã lỗi HTTP tương ứng khi có lỗi xảy ra:

- 400: Bad Request - Dữ liệu gửi lên không hợp lệ
- 404: Not Found - Không tìm thấy resource
- 500: Internal Server Error - Lỗi server

Ví dụ response lỗi:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Số tiền thanh toán không hợp lệ"
  }
}
```
