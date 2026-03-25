# API Reference

Base URL: `http://localhost:8080`

## Standard Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Success with Pagination

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "user not found"
  }
}
```

---

## Auth

### POST `/api/v1/auth/register`

Đăng ký tài khoản mới.

**Request** `application/json`

```json
{
  "email": "alex@example.com",
  "password": "mypassword123",
  "first_name": "Alexander",
  "last_name": "Monolith"
}
```

| Field        | Type   | Required | Validation        |
| ------------ | ------ | -------- | ----------------- |
| `email`      | string | ✅       | valid email       |
| `password`   | string | ✅       | min 8 chars       |
| `first_name` | string | ✅       | 1–100 chars       |
| `last_name`  | string | ✅       | 1–100 chars       |

**Response** `201 Created`

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

**Errors:** `409 Conflict` — email already registered

---

### POST `/api/v1/auth/login`

Đăng nhập.

**Request** `application/json`

```json
{
  "email": "alex@example.com",
  "password": "mypassword123"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

**Errors:** `401 Unauthorized` — invalid credentials

---

### POST `/api/v1/auth/refresh`

Tạo cặp token mới từ refresh token.

**Request** `application/json`

```json
{
  "refresh_token": "eyJhbGciOi..."
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

**Errors:** `401 Unauthorized` — token expired hoặc bị revoke

---

### POST `/api/v1/auth/logout`

Đăng xuất (blacklist refresh token). Yêu cầu `Authorization: Bearer <access_token>`.

**Request** `application/json`

```json
{
  "refresh_token": "eyJhbGciOi..."
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "logged out successfully"
  }
}
```

---

## Profile

Tất cả endpoints yêu cầu `Authorization: Bearer <access_token>`.

### GET `/api/v1/profile`

Xem profile của chính mình.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alex.m@archmonolith.com",
    "first_name": "Alexander",
    "last_name": "Monolith",
    "phone": "+1 (555) 0123-4567",
    "address": "1248 Architecture Way, Suite 400",
    "profile_photo": "/uploads/abc123.jpg",
    "skills": ["React", "Go", "CI/CD"],
    "role": "user",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-03-24T08:00:00Z"
  }
}
```

---

### PUT `/api/v1/profile`

Cập nhật profile. Gửi qua **multipart/form-data**.

> `first_name` và `last_name` **không thể thay đổi** — chỉ set khi đăng ký.

**Request** `multipart/form-data`

| Field     | Type   | Required | Description                              |
| --------- | ------ | -------- | ---------------------------------------- |
| `phone`   | string | ❌       | Số điện thoại (max 20 chars)             |
| `email`   | string | ❌       | Email (phải hợp lệ)                     |
| `address` | string | ❌       | Địa chỉ                                 |
| `skills`  | string | ❌       | JSON array, e.g. `["Go","React"]`        |
| `photo`   | file   | ❌       | Ảnh profile (JPG, PNG, GIF)              |

**cURL Example**

```bash
curl -X PUT http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer <token>" \
  -F "phone=+84 123 456 789" \
  -F "email=alex@newmail.com" \
  -F "address=123 New Street" \
  -F 'skills=["Go","React","Flutter"]' \
  -F "photo=@/path/to/avatar.jpg"
```

**Response** `200 OK` — trả về user profile đã cập nhật (cùng format GET /profile)

**Errors:**
- `400 Bad Request` — invalid skills, invalid email format
- `404 Not Found` — user not found

**Side effects:** Mỗi field thay đổi sẽ tạo 1 record trong `profile_change_histories`.

---

### GET `/api/v1/profile/history`

Xem lịch sử thay đổi profile.

**Query Parameters**

| Param  | Type | Default | Description            |
| ------ | ---- | ------- | ---------------------- |
| `days` | int  | 7       | Số ngày lịch sử       |

**Request Example**

```
GET /api/v1/profile/history?days=7
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "ACT-98231-SC",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "action": "updated profile",
      "device": "PostmanRuntime/7.36.0",
      "ip_address": "127.0.0.1",
      "created_at": "2025-03-24T08:00:00Z",
      "changes": [
        {
          "activity_id": "ACT-98231-SC",
          "field": "phone",
          "old_value": "+1 (555) 000-0000",
          "new_value": "+1 (555) 0123-4567"
        },
        {
          "activity_id": "ACT-98231-SC",
          "field": "skills",
          "old_value": "[\"Go\"]",
          "new_value": "[\"Go\",\"React\",\"CI/CD\"]"
        }
      ]
    }
  ]
}
```

---

## Skills

### GET `/api/v1/skills`

Lấy danh sách skill options (public, không cần auth). Được cấu hình trong `config.yaml`.

**Response** `200 OK`

```json
{
  "success": true,
  "data": ["Go", "React", "Flutter", "CI/CD", "Python", "AWS", "Kubernetes"]
}
```

## Health

### GET `/health/live`

```json
{ "success": true, "data": { "status": "alive" } }
```

### GET `/health/ready`

```json
{ "success": true, "data": { "status": "ready", "dependencies": {} } }
```
