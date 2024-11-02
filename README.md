# Payment API

Docs này mô tả chi tiết về các API endpoint phục vụ chức năng payment.

## Base URL

```
http://localhost:3000
```

## 1. Create Payment URL

Tạo một payment URL mới và chuyển user đến payment page của provider (ví dụ: MoMo).

### Endpoint

```
POST /payments
```

### Request Body

| Field              | Type   | Required | Description                                                    |
| ------------------ | ------ | -------- | -------------------------------------------------------------- |
| amount             | string | Yes      | Payment amount (VND)                                           |
| orderInfo          | object | Yes      | Order information                                              |
| orderInfo.userId   | string | Yes      | User ID (24 characters)                                        |
| orderInfo.message  | string | Yes      | Payment content                                                |
| orderInfo.type     | string | Yes      | Transaction type (`PREMIUM_SUBSCRIPTION` hoặc `AUTHOR_PAYOUT`) |
| orderInfo.metadata | object | No       | Additional order data                                          |
| paymentItems       | array  | No       | Payment item details                                           |
| options            | object | No       | Payment options                                                |

### Example Request Body

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

## 2. Check Payment Status

Kiểm tra status của một payment transaction.

### Endpoint

```
GET /payments/:orderId
```

### Parameters

| Parameter | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| orderId   | string | ID of the order (24 characters) |

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

## 3. Get Transaction History

Lấy danh sách transactions của một user.

### Endpoint

```
GET /users/:userId/transactions
```

### Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| userId    | string | ID of the user (24 characters) |

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

## Payment Status

| Code    | Description        |
| ------- | ------------------ |
| PENDING | Pending payment    |
| SUCCESS | Payment successful |
| FAILED  | Payment failed     |

## Transaction Types

| Code                 | Description             |
| -------------------- | ----------------------- |
| PREMIUM_SUBSCRIPTION | Premium account upgrade |
| AUTHOR_PAYOUT        | Author payment          |

## Usage Examples

### 1. Create Simple Payment

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

### 2. Create Payment with Full Options

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

### 3. Check Payment Status

```bash
curl http://localhost:3000/api/payments/507f1f77bcf86cd799439011
```

### 4. Get Transaction History

```bash
curl http://localhost:3000/api/users/507f1f77bcf86cd799439011/transactions
```

## Error Handling

API trả về các HTTP error codes tương ứng khi có lỗi xảy ra:

- 400: Bad Request - Invalid input data
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server error

Example error response:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Số tiền thanh toán không hợp lệ"
  }
}
```
