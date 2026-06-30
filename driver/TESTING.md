# Driver Service — API Testing Guide

Base URL: `http://localhost:3001`

---

## Setup

### 1. Generate a Test JWT

The service reads the JWT secret from `driver/.env` (`JWT_SECRET`).
Use the script below in Node/Bun to mint a token for testing:

```js
// run: bun generate-token.js
import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    sub: "550e8400-e29b-41d4-a716-446655440000", // userId (UUID)
    email: "driver@example.com",
  },
  "your-super-secret-jwt-key-change-in-production", // must match JWT_SECRET in .env
  { expiresIn: "7d" }
);

console.log(token);
```

Copy the printed token — you'll use it as the `Bearer` value in every request below.

### 2. Postman Environment Variables

| Variable     | Value                           |
| ------------ | ------------------------------- |
| `BASE_URL`   | `http://localhost:3001`         |
| `TOKEN`      | `<paste token from above>`      |
| `DRIVER_ID`  | _(filled after POST /drivers)_  |
| `VEHICLE_ID` | _(filled after POST /vehicles)_ |

---

## Auth Header (add to every request)

```
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

---

## Health Check

### GET /api/v1/health

**No auth required.**

```
GET http://localhost:3001/api/v1/health
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Driver Service is healthy",
  "timestamp": "2026-06-25T07:00:00.000Z"
}
```

---

## Driver Profile

---

### POST /api/v1/drivers — Register Driver

```
POST http://localhost:3001/api/v1/drivers
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "licenseNumber": "MH12AB1234",
  "licenseExpiry": "2028-09-15"
}
```

**Expected 201:**

```json
{
  "success": true,
  "message": "Driver profile created successfully",
  "data": {
    "id": "f3180dde-d1c0-472c-8b98-22ad4a085b7f",
    "userId": "659793d1-1c83-4554-8318-e270aef0c397",
    "licenseNumber": "MH12AB1234",
    "licenseExpiry": "2028-09-15T00:00:00.000Z",
    "onboardingStatus": "PENDING",
    "isOnline": false,
    "createdAt": "2026-06-25T07:20:41.162Z",
    "updatedAt": "2026-06-25T07:20:41.162Z",
    "deletedAt": null,
    "stats": {
      "id": "e13cb4ff-1b01-41b2-badb-a852f9f44a08",
      "driverId": "f3180dde-d1c0-472c-8b98-22ad4a085b7f",
      "totalTrips": 0,
      "completedTrips": 0,
      "cancelledTrips": 0,
      "averageRating": "0",
      "updatedAt": "2026-06-25T07:20:41.162Z"
    },
    "availability": {
      "id": "b75e3099-c170-4fc7-8333-3279d55127e3",
      "driverId": "f3180dde-d1c0-472c-8b98-22ad4a085b7f",
      "status": "OFFLINE",
      "lastSeenAt": "2026-06-25T07:20:41.162Z",
      "createdAt": "2026-06-25T07:20:41.162Z",
      "updatedAt": "2026-06-25T07:20:41.162Z"
    }
  }
}
```

**Error — 409 (already registered):**

```json
{
  "success": false,
  "message": "A driver profile already exists for this user",
  "error": { "code": "DRIVER_ALREADY_EXISTS" }
}
```

**Error — 400 (expired license):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "licenseExpiry", "message": "License must not be expired" }
    ]
  }
}
```

**Error — 400 (invalid license format):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": "licenseNumber",
        "message": "License number must contain only alphanumeric characters and hyphens"
      }
    ]
  }
}
```

---

### GET /api/v1/drivers/me — Get Driver Profile

```
GET http://localhost:3001/api/v1/drivers/me
Authorization: Bearer {{TOKEN}}
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Driver profile fetched successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "licenseNumber": "MH12AB1234",
    "licenseExpiry": "2028-09-15T00:00:00.000Z",
    "onboardingStatus": "PENDING",
    "isOnline": false,
    "createdAt": "2026-06-25T07:00:00.000Z",
    "updatedAt": "2026-06-25T07:00:00.000Z",
    "deletedAt": null
  }
}
```

**Error — 404:**

```json
{
  "success": false,
  "message": "Driver not found",
  "error": { "code": "DRIVER_NOT_FOUND" }
}
```

---

### PATCH /api/v1/drivers/me — Update Driver Profile

```
PATCH http://localhost:3001/api/v1/drivers/me
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

**Request Body (update license expiry):**

```json
{
  "licenseExpiry": "2030-12-31"
}
```

**Request Body (update license number):**

```json
{
  "licenseNumber": "DL01CD5678"
}
```

**Request Body (update both):**

```json
{
  "licenseNumber": "DL01CD5678",
  "licenseExpiry": "2031-06-30"
}
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Driver profile updated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "licenseNumber": "DL01CD5678",
    "licenseExpiry": "2031-06-30T00:00:00.000Z",
    "onboardingStatus": "PENDING",
    "isOnline": false,
    "createdAt": "2026-06-25T07:00:00.000Z",
    "updatedAt": "2026-06-25T07:30:00.000Z",
    "deletedAt": null
  }
}
```

**Error — 400 (empty body):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "", "message": "At least one field must be provided" }
    ]
  }
}
```

---

## Vehicles

---

### POST /api/v1/drivers/me/vehicles — Add Vehicle

```
POST http://localhost:3001/api/v1/drivers/me/vehicles
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "registrationNumber": "MH 12 AB 1234",
  "make": "Toyota",
  "model": "Innova Crysta",
  "color": "White",
  "year": 2022,
  "vehicleType": "SUV"
}
```

**All vehicleType options:**

```
SEDAN | SUV | HATCHBACK | AUTO_RICKSHAW | BIKE | LUXURY | MINIVAN
```

**Expected 201:**

```json
{
  "success": true,
  "message": "Vehicle added successfully",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "registrationNumber": "MH 12 AB 1234",
    "make": "Toyota",
    "model": "Innova Crysta",
    "color": "White",
    "year": 2022,
    "vehicleType": "SUV",
    "status": "PENDING_VERIFICATION",
    "createdAt": "2026-06-25T07:05:00.000Z",
    "updatedAt": "2026-06-25T07:05:00.000Z"
  }
}
```

**Error — 409 (registration number taken):**

```json
{
  "success": false,
  "message": "Vehicle with registration number \"MH 12 AB 1234\" already exists",
  "error": { "code": "VEHICLE_ALREADY_EXISTS" }
}
```

**Error — 400 (invalid year):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "year", "message": "Year must be 1990 or later" }]
  }
}
```

**Error — 400 (invalid vehicleType):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": "vehicleType",
        "message": "Invalid enum value. Expected 'SEDAN' | 'SUV' | 'HATCHBACK' | 'AUTO_RICKSHAW' | 'BIKE' | 'LUXURY' | 'MINIVAN'"
      }
    ]
  }
}
```

---

### GET /api/v1/drivers/me/vehicles — List Vehicles

```
GET http://localhost:3001/api/v1/drivers/me/vehicles
Authorization: Bearer {{TOKEN}}
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Vehicles fetched successfully",
  "data": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "registrationNumber": "MH 12 AB 1234",
      "make": "Toyota",
      "model": "Innova Crysta",
      "color": "White",
      "year": 2022,
      "vehicleType": "SUV",
      "status": "PENDING_VERIFICATION",
      "createdAt": "2026-06-25T07:05:00.000Z",
      "updatedAt": "2026-06-25T07:05:00.000Z"
    }
  ]
}
```

**Empty (no vehicles yet):**

```json
{
  "success": true,
  "message": "Vehicles fetched successfully",
  "data": []
}
```

---

### PATCH /api/v1/drivers/me/vehicles/:vehicleId — Update Vehicle

Replace `:vehicleId` with the `id` returned from POST /vehicles.

```
PATCH http://localhost:3001/api/v1/drivers/me/vehicles/b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

**Request Body (update color and model):**

```json
{
  "color": "Silver",
  "model": "Innova HyCross"
}
```

**Request Body (update status — e.g. after admin approval):**

```json
{
  "status": "ACTIVE"
}
```

**All status options:**

```
PENDING_VERIFICATION | ACTIVE | INACTIVE | REJECTED
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "registrationNumber": "MH 12 AB 1234",
    "make": "Toyota",
    "model": "Innova HyCross",
    "color": "Silver",
    "year": 2022,
    "vehicleType": "SUV",
    "status": "ACTIVE",
    "createdAt": "2026-06-25T07:05:00.000Z",
    "updatedAt": "2026-06-25T07:45:00.000Z"
  }
}
```

**Error — 404 (wrong vehicleId or other driver's vehicle):**

```json
{
  "success": false,
  "message": "Vehicle with id \"b2c3d4e5-f6a7-8901-bcde-f12345678901\" not found",
  "error": { "code": "VEHICLE_NOT_FOUND" }
}
```

**Error — 400 (invalid UUID):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "vehicleId", "message": "vehicleId must be a valid UUID" }
    ]
  }
}
```

---

### DELETE /api/v1/drivers/me/vehicles/:vehicleId — Delete Vehicle

```
DELETE http://localhost:3001/api/v1/drivers/me/vehicles/b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer {{TOKEN}}
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Vehicle deleted successfully",
  "data": null
}
```

**Error — 404:**

```json
{
  "success": false,
  "message": "Vehicle with id \"b2c3d4e5-f6a7-8901-bcde-f12345678901\" not found",
  "error": { "code": "VEHICLE_NOT_FOUND" }
}
```

---

## Documents

---

### POST /api/v1/drivers/me/documents — Upload Document

> **Note:** Upload the actual file to S3/GCS first and use the resulting URL here.
> For testing, any valid HTTPS URL works.

```
POST http://localhost:3001/api/v1/drivers/me/documents
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

**Request Body — Driving License:**

```json
{
  "documentType": "DRIVING_LICENSE",
  "documentUrl": "https://storage.example.com/drivers/550e8400/license.pdf"
}
```

**Request Body — Vehicle Registration:**

```json
{
  "documentType": "VEHICLE_REGISTRATION",
  "documentUrl": "https://storage.example.com/drivers/550e8400/rc.pdf"
}
```

**Request Body — Insurance:**

```json
{
  "documentType": "VEHICLE_INSURANCE",
  "documentUrl": "https://storage.example.com/drivers/550e8400/insurance.pdf"
}
```

**Request Body — Aadhaar:**

```json
{
  "documentType": "AADHAAR_CARD",
  "documentUrl": "https://storage.example.com/drivers/550e8400/aadhaar.jpg"
}
```

**Request Body — PAN:**

```json
{
  "documentType": "PAN_CARD",
  "documentUrl": "https://storage.example.com/drivers/550e8400/pan.jpg"
}
```

**Request Body — Profile Photo:**

```json
{
  "documentType": "PROFILE_PHOTO",
  "documentUrl": "https://storage.example.com/drivers/550e8400/photo.jpg"
}
```

**All documentType options:**

```
DRIVING_LICENSE | VEHICLE_REGISTRATION | VEHICLE_INSURANCE | PAN_CARD | AADHAAR_CARD | PROFILE_PHOTO
```

**Expected 201:**

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "documentType": "DRIVING_LICENSE",
    "documentUrl": "https://storage.example.com/drivers/550e8400/license.pdf",
    "verificationStatus": "PENDING",
    "rejectionReason": null,
    "createdAt": "2026-06-25T07:10:00.000Z",
    "updatedAt": "2026-06-25T07:10:00.000Z"
  }
}
```

**Error — 400 (invalid URL):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "documentUrl", "message": "Document URL must be a valid URL" }
    ]
  }
}
```

**Error — 400 (invalid documentType):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "documentType", "message": "Invalid enum value." }]
  }
}
```

---

### GET /api/v1/drivers/me/documents — List Documents

```
GET http://localhost:3001/api/v1/drivers/me/documents
Authorization: Bearer {{TOKEN}}
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Documents fetched successfully",
  "data": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "documentType": "DRIVING_LICENSE",
      "documentUrl": "https://storage.example.com/drivers/550e8400/license.pdf",
      "verificationStatus": "PENDING",
      "rejectionReason": null,
      "createdAt": "2026-06-25T07:10:00.000Z",
      "updatedAt": "2026-06-25T07:10:00.000Z"
    },
    {
      "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "documentType": "AADHAAR_CARD",
      "documentUrl": "https://storage.example.com/drivers/550e8400/aadhaar.jpg",
      "verificationStatus": "PENDING",
      "rejectionReason": null,
      "createdAt": "2026-06-25T07:11:00.000Z",
      "updatedAt": "2026-06-25T07:11:00.000Z"
    }
  ]
}
```

---

## Availability Status

---

### PATCH /api/v1/drivers/me/status — Update Status

> **Important:** The FSM only allows specific transitions.
> The driver's `onboardingStatus` must be `VERIFIED` to go `ONLINE`.

```
PATCH http://localhost:3001/api/v1/drivers/me/status
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

#### Test Case 1 — Go ONLINE (requires VERIFIED onboarding status)

```json
{ "status": "ONLINE" }
```

#### Test Case 2 — Go BUSY (from ONLINE — simulates trip assignment)

```json
{ "status": "BUSY" }
```

#### Test Case 3 — Go OFFLINE (from ONLINE or BUSY)

```json
{ "status": "OFFLINE" }
```

**Expected 200:**

```json
{
  "success": true,
  "message": "Driver status updated to ONLINE",
  "data": {
    "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "ONLINE",
    "lastSeenAt": "2026-06-25T07:15:00.000Z",
    "createdAt": "2026-06-25T07:00:00.000Z",
    "updatedAt": "2026-06-25T07:15:00.000Z"
  }
}
```

**Error — 403 (not verified yet, trying to go ONLINE):**

```json
{
  "success": false,
  "message": "Driver must be verified before going online",
  "error": { "code": "DRIVER_NOT_VERIFIED" }
}
```

**Error — 422 (invalid FSM transition, e.g. OFFLINE → BUSY):**

```json
{
  "success": false,
  "message": "Status transition from \"OFFLINE\" to \"BUSY\" is not allowed",
  "error": { "code": "INVALID_STATUS_TRANSITION" }
}
```

**Error — 422 (BUSY → ONLINE — not allowed):**

```json
{
  "success": false,
  "message": "Status transition from \"BUSY\" to \"ONLINE\" is not allowed",
  "error": { "code": "INVALID_STATUS_TRANSITION" }
}
```

**Error — 400 (invalid status value):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": "status",
        "message": "Invalid enum value. Expected 'OFFLINE' | 'ONLINE' | 'BUSY'"
      }
    ]
  }
}
```

---

## Stats

---

### GET /api/v1/drivers/me/stats — Get Driver Stats

```
GET http://localhost:3001/api/v1/drivers/me/stats
Authorization: Bearer {{TOKEN}}
```

**Expected 200 (fresh driver):**

```json
{
  "success": true,
  "message": "Driver stats fetched successfully",
  "data": {
    "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "totalTrips": 0,
    "completedTrips": 0,
    "cancelledTrips": 0,
    "averageRating": "0.00",
    "updatedAt": "2026-06-25T07:00:00.000Z"
  }
}
```

**Expected 200 (experienced driver):**

```json
{
  "success": true,
  "message": "Driver stats fetched successfully",
  "data": {
    "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "driverId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "totalTrips": 142,
    "completedTrips": 136,
    "cancelledTrips": 6,
    "averageRating": "4.87",
    "updatedAt": "2026-06-25T07:00:00.000Z"
  }
}
```

---

## Auth Error Cases (applies to every route)

### Missing Authorization header

```
GET http://localhost:3001/api/v1/drivers/me
(no Authorization header)
```

**401:**

```json
{
  "success": false,
  "message": "Missing or malformed Authorization header",
  "error": { "code": "UNAUTHORIZED" }
}
```

### Expired or invalid token

```
GET http://localhost:3001/api/v1/drivers/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid
```

**401:**

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": { "code": "INVALID_TOKEN" }
}
```

---

## 404 — Unknown Route

```
GET http://localhost:3001/api/v1/unknown
```

**404:**

```json
{
  "success": false,
  "message": "The requested resource was not found",
  "error": { "code": "NOT_FOUND" }
}
```

---

## Full Happy-Path Test Sequence

Run these in order to test the complete driver lifecycle:

```
1.  POST   /api/v1/drivers                              → register driver
2.  GET    /api/v1/drivers/me                           → verify profile
3.  PATCH  /api/v1/drivers/me                           → update license
4.  POST   /api/v1/drivers/me/vehicles                  → add first vehicle
5.  POST   /api/v1/drivers/me/vehicles                  → add second vehicle (bike)
6.  GET    /api/v1/drivers/me/vehicles                  → list both vehicles
7.  PATCH  /api/v1/drivers/me/vehicles/:vehicleId       → update vehicle color
8.  DELETE /api/v1/drivers/me/vehicles/:vehicleId       → delete second vehicle
9.  POST   /api/v1/drivers/me/documents                 → upload DRIVING_LICENSE
10. POST   /api/v1/drivers/me/documents                 → upload AADHAAR_CARD
11. GET    /api/v1/drivers/me/documents                 → list documents
12. PATCH  /api/v1/drivers/me/status {"status":"ONLINE"} → ⚠ needs VERIFIED status first
13. PATCH  /api/v1/drivers/me/status {"status":"BUSY"}  → simulate trip assignment
14. PATCH  /api/v1/drivers/me/status {"status":"OFFLINE"} → trip ends
15. GET    /api/v1/drivers/me/stats                     → view stats
```

---

## FSM Transition Test Matrix

| From \ To   | OFFLINE | ONLINE  | BUSY    |
| ----------- | ------- | ------- | ------- |
| **OFFLINE** | ❌ same | ✅ 200  | ❌ 422  |
| **ONLINE**  | ✅ 200  | ❌ same | ✅ 200  |
| **BUSY**    | ✅ 200  | ❌ 422  | ❌ same |

> ✅ = 200 OK &nbsp; ❌ = 422 INVALID_STATUS_TRANSITION

---

## Sample Bike Vehicle Body

```json
{
  "registrationNumber": "KA 05 EF 9999",
  "make": "Honda",
  "model": "Activa 6G",
  "color": "Matte Blue",
  "year": 2023,
  "vehicleType": "BIKE"
}
```

## Sample Auto-Rickshaw Body

```json
{
  "registrationNumber": "TN 22 GH 7777",
  "make": "Bajaj",
  "model": "RE Compact",
  "color": "Yellow",
  "year": 2021,
  "vehicleType": "AUTO_RICKSHAW"
}
```
