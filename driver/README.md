<div align="center">

# 🚗 Driver Service

**Production-grade microservice for driver management in a distributed ride-booking platform**

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?style=flat-square&logo=bun&logoColor=black)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.x-3E67B1?style=flat-square)

</div>

---

## Overview

The **Driver Service** is a standalone REST microservice responsible for the complete driver lifecycle in a ride-booking platform similar to Uber. It manages driver onboarding, vehicle registration, document verification, real-time availability, and performance statistics.

It is part of a larger microservices architecture that also includes a **User Service**, with future integration planned for a **Trip Service**, **Location Service**, **Notification Service**, and **Matching Engine**.

---

## Tech Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| Runtime          | [Bun](https://bun.sh/)     |
| Language         | TypeScript 5 (strict mode) |
| Framework        | Express 5                  |
| ORM              | Prisma 7 (pg adapter)      |
| Database         | PostgreSQL 14              |
| Validation       | Zod 4                      |
| Auth             | JWT (HS256, RS256-ready)   |
| Containerisation | Docker / Docker Compose    |

---

## Architecture

```
HTTP Request
    │
    ▼
┌──────────────────────────────────────────────┐
│                  Express App                  │
│                                              │
│  verifyToken ──▶ asyncHandler ──▶ Controller │
│                                      │       │
│                                      ▼       │
│                                   Service    │
│                                      │       │
│                                      ▼       │
│                                 Repository   │
│                                      │       │
│                                      ▼       │
│                              Prisma + pg Pool │
│                                      │       │
└──────────────────────────────────────────────┘
                                       │
                                       ▼
                               PostgreSQL 14
```

**Layering rules:**

- **Controller** — parse input, call service, return response. Zero business logic.
- **Service** — all domain rules, validations, and orchestration live here.
- **Repository** — database access only. Returns raw Prisma types.

---

## Folder Structure

```
driver/
├── index.ts                    Entry point (dotenv → app.listen)
├── app.ts                      Express wiring
├── prisma.config.ts            Prisma 7 config for Bun
├── prisma/
│   └── schema.prisma           5 models · 6 enums
└── src/
    ├── config/
    │   └── env.ts              Fail-fast env validation
    ├── database/
    │   └── prisma.ts           Singleton pg pool + PrismaClient
    ├── errors/
    │   ├── base-error.ts       BaseError (isOperational flag)
    │   ├── app-error.ts        Generic AppError
    │   └── driver-errors.ts    9 typed domain errors
    ├── types/
    │   ├── types.d.ts          AuthRequest · JwtPayload
    │   └── driver.dto.ts       All request/response DTOs
    ├── validators/
    │   └── driver.schema.ts    6 Zod schemas (single source of truth)
    ├── repositories/
    │   ├── driver.repository.ts
    │   ├── vehicle.repository.ts
    │   ├── document.repository.ts
    │   └── availability.repository.ts
    ├── services/
    │   ├── driver.service.ts
    │   ├── vehicle.service.ts
    │   ├── document.service.ts
    │   ├── availability.service.ts
    │   └── stats.service.ts
    ├── controllers/
    │   ├── driver.controller.ts
    │   ├── vehicle.controller.ts
    │   ├── document.controller.ts
    │   ├── availability.controller.ts
    │   └── stats.controller.ts
    ├── routes/
    │   └── driver.routes.ts    All 11 routes
    ├── middlewares/
    │   ├── auth.middleware.ts   JWT verifyToken
    │   └── error.middleware.ts  Global error handler
    └── utils/
        └── asyncHandler.ts     Promise.catch → next()
```

---

## Database Schema

Five models with full relationships, cascade deletes, and optimised indexes.

```
Driver ──────┬──── DriverVehicle       (1:M)
             ├──── DriverDocument      (1:M)
             ├──── DriverAvailability  (1:1)
             └──── DriverStats         (1:1)
```

| Model                | Key Design Decision                                                 |
| -------------------- | ------------------------------------------------------------------- |
| `Driver`             | `userId` stored as plain `String` — no cross-service FK constraint  |
| `DriverVehicle`      | `registrationNumber` is globally unique                             |
| `DriverDocument`     | Stores URL only — blobs live in S3/GCS (stateless service)          |
| `DriverAvailability` | Separate table for high-frequency writes; mirrors to Redis          |
| `DriverStats`        | Separate table so Trip Service writes don't contend with Driver row |

### Enums

| Enum                         | Values                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `OnboardingStatus`           | `PENDING` · `DOCUMENTS_SUBMITTED` · `VERIFIED` · `REJECTED`                                                      |
| `AvailabilityStatus`         | `OFFLINE` · `ONLINE` · `BUSY`                                                                                    |
| `VehicleType`                | `SEDAN` · `SUV` · `HATCHBACK` · `AUTO_RICKSHAW` · `BIKE` · `LUXURY` · `MINIVAN`                                  |
| `VehicleStatus`              | `PENDING_VERIFICATION` · `ACTIVE` · `INACTIVE` · `REJECTED`                                                      |
| `DocumentType`               | `DRIVING_LICENSE` · `VEHICLE_REGISTRATION` · `VEHICLE_INSURANCE` · `PAN_CARD` · `AADHAAR_CARD` · `PROFILE_PHOTO` |
| `DocumentVerificationStatus` | `PENDING` · `VERIFIED` · `REJECTED`                                                                              |

---

## API Reference

> All endpoints require `Authorization: Bearer <token>` except `/health`.

| Method   | Path                                     | Auth | Description                |
| -------- | ---------------------------------------- | ---- | -------------------------- |
| `GET`    | `/api/v1/health`                         | ❌   | Health check               |
| `POST`   | `/api/v1/drivers`                        | ✅   | Register driver profile    |
| `GET`    | `/api/v1/drivers/me`                     | ✅   | Get own driver profile     |
| `PATCH`  | `/api/v1/drivers/me`                     | ✅   | Update driver profile      |
| `POST`   | `/api/v1/drivers/me/vehicles`            | ✅   | Add a vehicle              |
| `GET`    | `/api/v1/drivers/me/vehicles`            | ✅   | List all vehicles          |
| `PATCH`  | `/api/v1/drivers/me/vehicles/:vehicleId` | ✅   | Update a vehicle           |
| `DELETE` | `/api/v1/drivers/me/vehicles/:vehicleId` | ✅   | Delete a vehicle           |
| `POST`   | `/api/v1/drivers/me/documents`           | ✅   | Upload a document          |
| `GET`    | `/api/v1/drivers/me/documents`           | ✅   | List all documents         |
| `PATCH`  | `/api/v1/drivers/me/status`              | ✅   | Update availability status |
| `GET`    | `/api/v1/drivers/me/stats`               | ✅   | Get driver stats           |

---

## Driver Availability FSM

Status transitions are enforced by a Finite State Machine in the service layer. Invalid transitions return `422 INVALID_STATUS_TRANSITION`.

```
         ┌─────────────────────────────┐
         │                             │
         ▼          go online          │
     OFFLINE ──────────────────▶  ONLINE
         ▲                          │  │
         │◀─────── go offline ───────┘  │
         │                              │ assigned
         │ trip ends / cancelled        ▼
         │◀────────────────────────  BUSY
```

| Transition         | Allowed | Condition                             |
| ------------------ | ------- | ------------------------------------- |
| `OFFLINE → ONLINE` | ✅      | `onboardingStatus` must be `VERIFIED` |
| `ONLINE → BUSY`    | ✅      | Set by Trip Service on assignment     |
| `ONLINE → OFFLINE` | ✅      | Driver ends shift                     |
| `BUSY → OFFLINE`   | ✅      | Trip completed or cancelled           |
| `OFFLINE → BUSY`   | ❌      | Cannot be busy without being online   |
| `BUSY → ONLINE`    | ❌      | Must complete trip first              |

---

## Standard Response Format

All endpoints return a consistent JSON envelope.

```json
// Success
{
  "success": true,
  "message": "Driver profile created successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Status transition from OFFLINE to BUSY is not allowed",
  "error": { "code": "INVALID_STATUS_TRANSITION" }
}

// Validation error
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

---

## Error Codes

| Code                        | HTTP | Thrown When                                     |
| --------------------------- | ---- | ----------------------------------------------- |
| `DRIVER_NOT_FOUND`          | 404  | No driver profile for this user                 |
| `DRIVER_ALREADY_EXISTS`     | 409  | Duplicate userId or licenseNumber               |
| `VEHICLE_NOT_FOUND`         | 404  | Vehicle missing or belongs to another driver    |
| `VEHICLE_ALREADY_EXISTS`    | 409  | Registration number already registered globally |
| `DOCUMENT_NOT_FOUND`        | 404  | Document ID not found                           |
| `INVALID_STATUS_TRANSITION` | 422  | FSM violation                                   |
| `DRIVER_NOT_VERIFIED`       | 403  | Going ONLINE before admin verification          |
| `UNAUTHORIZED`              | 401  | Missing Authorization header                    |
| `INVALID_TOKEN`             | 401  | JWT is invalid or expired                       |
| `VALIDATION_ERROR`          | 400  | Zod schema failure (with field-level details)   |
| `DUPLICATE_RESOURCE`        | 409  | Prisma unique constraint violation              |
| `INTERNAL_SERVER_ERROR`     | 500  | Unhandled programming error                     |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Start the database

```bash
# From the monorepo root
docker compose up -d
```

### 2. Install dependencies

```bash
cd driver
bun install
```

### 3. Configure environment

```bash
# driver/.env is already created — update values as needed
PORT=3001
DATABASE_URL="postgresql://postgres:prisma@localhost:5432/driver_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
```

### 4. Run database migration

```bash
bunx prisma migrate dev --name init
```

### 5. Start the service

```bash
bun dev
# → Driver Service running on port 3001
```

### 6. Verify

```bash
curl http://localhost:3001/api/v1/health
# → {"success":true,"message":"Driver Service is healthy","timestamp":"..."}
```

---

## Environment Variables

| Variable       | Required | Default       | Description                             |
| -------------- | -------- | ------------- | --------------------------------------- |
| `PORT`         | No       | `3001`        | HTTP port                               |
| `DATABASE_URL` | **Yes**  | —             | PostgreSQL connection string            |
| `JWT_SECRET`   | **Yes**  | —             | Shared secret with User Service (HS256) |
| `NODE_ENV`     | No       | `development` | `development` or `production`           |

> Missing `DATABASE_URL` or `JWT_SECRET` will cause an immediate crash at startup with a clear error message.

---

## Authentication

The service expects JWTs issued by the **User Service**.

**Token payload:**

```json
{
  "sub": "<userId>",
  "email": "driver@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

After verification, `req.user = { id, email }` is attached for all downstream controllers.

**RS256 upgrade path:** Replace the shared `JWT_SECRET` with the User Service's public key. The User Service retains the private key — zero shared-secret distribution risk.

---

## Prisma Studio

Inspect and edit data directly in the browser:

```bash
bunx prisma studio
# → Opens at http://localhost:5555
```

Useful for manually setting `onboardingStatus = 'VERIFIED'` to test the go-ONLINE flow.

---

## Future Scalability

### Kafka Events

After every mutation, a domain event will be published:

| Event                      | Trigger              | Consumers                           |
| -------------------------- | -------------------- | ----------------------------------- |
| `driver.registered`        | `POST /drivers`      | Notification Service, Admin Service |
| `driver.status_changed`    | `PATCH /me/status`   | Matching Engine, Analytics          |
| `driver.document_uploaded` | `POST /me/documents` | Admin review queue                  |

### Redis Integration

`DriverAvailability` is the PostgreSQL source of truth. After each status change:

```
redis.set(`driver:{id}:status`, status, EX=300)
```

The Matching Engine reads Redis directly for O(1) driver lookup. A 300s TTL acts as a heartbeat — crashed driver apps become OFFLINE automatically.

### Location Service

`lastSeenAt` in `DriverAvailability` tracks the heartbeat today. A future **Location Service** with PostGIS will store real-time coordinates and power `ST_DWithin` queries to find drivers within a radius.

### Horizontal Scaling

- Stateless service — no in-process state
- pg pool configured per-instance (10 connections, tunable)
- JWT verification is stateless — no session store needed
- Redis pub/sub for real-time fan-out across multiple instances

---

## Testing

See **[TESTING.md](./TESTING.md)** for:

- How to generate a test JWT
- Raw request bodies for every route
- All error case examples
- FSM transition test matrix
- Full happy-path sequence (15 steps)

---

## Project Structure (Monorepo)

```
ride-booking-system/
├── docker-compose.yml   Shared PostgreSQL
├── user/                User Service (auth, profiles, devices)
└── driver/              Driver Service  ← you are here
```
