# Last-Mile Delivery Tracker

A full-stack delivery management application with a Node.js/Express API, MongoDB persistence, JWT authentication, role-based dashboards, order tracking, agent assignment, and dynamic delivery rate calculation.

## Project Structure

```text
Last-Mile-Delivery-Tracker/
  backend/     Express API, MongoDB models, auth, rate engine, assignment logic
  frontend/    React + Vite client for customers, agents, and admins
```

## Tech Stack

Backend:
- Node.js, Express
- MongoDB, Mongoose
- JWT authentication, bcrypt password hashing
- Joi request validation
- Helmet, CORS, express-rate-limit
- Nodemailer for email notifications

Frontend:
- React 19, Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React icons

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string, local or Atlas
- SMTP credentials if email notifications should be sent

## Setup Guide

Install backend dependencies:

```bash
cd backend
npm install
```

Create `backend/.env` from the example below, then start the API:

```bash
npm run dev
```

The backend defaults to `http://localhost:5000`.

Install frontend dependencies in a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` only if you need to override the API base URL. Then start the Vite app:

```bash
npm run dev
```

The frontend defaults to `http://localhost:5173`.

## Environment Examples

Backend `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/delivery_tracker
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Delivery Tracker <no-reply@delivery.com>"
```

Frontend optional `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If `VITE_API_BASE_URL` is not set, the frontend uses `/api`. In development, setting it to `http://localhost:5000/api` is the most direct option unless a proxy is configured.

## Running The App

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Lint frontend:

```bash
cd frontend
npm run lint
```

The backend currently has no test suite configured; `npm test` exits with the placeholder package script.

## Authentication

The API uses JWT bearer tokens:

```http
Authorization: Bearer <token>
```

Roles:
- `customer`: creates and tracks their own orders.
- `agent`: views assigned orders, updates availability/location, and advances delivery status.
- `admin`: manages zones, rate cards, agents, customers, assignment, and status overrides.

Auth routes are rate-limited to 20 requests per 15 minutes per IP.

## API Docs

Base URL:

```text
http://localhost:5000/api
```

Common response shape:

```json
{
  "success": true,
  "data": {}
}
```

### Auth

`POST /auth/register`

Registers a customer.

```json
{
  "name": "Customer One",
  "email": "customer@example.com",
  "password": "secret123",
  "phone": "9999999999",
  "address": "Customer address"
}
```

`POST /auth/login`

Logs in a user and returns a token.

```json
{
  "email": "customer@example.com",
  "password": "secret123"
}
```

`GET /auth/me`

Returns the authenticated user profile. Requires JWT.

### Orders

All order routes require JWT.

`POST /orders/quote`

Calculates a charge without creating an order.

```json
{
  "pickupPincode": "110001",
  "dropPincode": "110002",
  "dimensions": { "l": 30, "b": 20, "h": 10 },
  "actualWeight": 2.5,
  "orderType": "B2C",
  "paymentType": "COD"
}
```

`POST /orders`

Creates an order. Admins may pass `customerId` to create on behalf of a customer.

```json
{
  "pickupAddress": {
    "line": "Pickup address",
    "pincode": "110001",
    "lat": 28.6139,
    "lng": 77.209
  },
  "dropAddress": {
    "line": "Drop address",
    "pincode": "110002",
    "lat": 28.62,
    "lng": 77.21
  },
  "dimensions": { "l": 30, "b": 20, "h": 10 },
  "actualWeight": 2.5,
  "orderType": "B2C",
  "paymentType": "Prepaid"
}
```

`GET /orders`

Lists orders visible to the authenticated user.

Admin query filters:
- `status`: filters by `currentStatus`
- `zone`: matches pickup or drop zone
- `agent`: filters by assigned agent id

`GET /orders/:id`

Returns one order with customer, agent, and zone details.

`GET /orders/:id/tracking`

Returns status history timeline for the order.

`PATCH /orders/:id/status`

Agent/admin route for normal status transitions.

```json
{
  "status": "PICKED_UP"
}
```

For failed delivery:

```json
{
  "status": "FAILED",
  "failureReason": "Customer unavailable"
}
```

Allowed normal flow:

```text
CREATED -> ASSIGNED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
```

Failed/reschedule flow:

```text
OUT_FOR_DELIVERY -> FAILED -> RESCHEDULED -> ASSIGNED
```

`POST /orders/:id/reschedule`

Customer-only route. Only failed orders can be rescheduled.

```json
{
  "rescheduledDate": "2026-07-10T10:00:00.000Z"
}
```

`PATCH /orders/:id/assign`

Admin-only manual assignment.

```json
{
  "agentId": "64f000000000000000000000"
}
```

`POST /orders/:id/auto-assign`

Admin-only route that triggers automatic assignment for `CREATED` or `RESCHEDULED` orders.

`PATCH /orders/:id/override-status`

Admin-only status override.

```json
{
  "status": "DELIVERED",
  "note": "Resolved by support"
}
```

### Admin

All admin routes require an admin JWT.

`POST /admin/zones`

```json
{
  "name": "North Delhi",
  "pincodes": ["110001", "110002"]
}
```

`GET /admin/zones`

Lists zones.

`PUT /admin/zones/:id`

Updates a zone.

`DELETE /admin/zones/:id`

Deletes a zone.

`POST /admin/zones/:id/pincodes`

Replaces zone pincodes.

```json
{
  "pincodes": ["110001", "110002", "110003"]
}
```

`POST /admin/rate-cards`

Creates a specific zone-pair rate card:

```json
{
  "orderType": "B2C",
  "fromZone": "64f000000000000000000001",
  "toZone": "64f000000000000000000002",
  "baseRate": 80,
  "perKgRate": 15,
  "codSurchargeFlat": 20,
  "isActive": true
}
```

To create a **default fallback** rate card used when no specific zone-pair match exists:

```json
{
  "orderType": "B2C",
  "isDefaultFallback": true,
  "baseRate": 100,
  "perKgRate": 20,
  "codSurchargeFlat": 25,
  "isActive": true
}
```

`GET /admin/rate-cards`

Lists all rate cards with populated `fromZone` and `toZone` names.

Supports an optional `?matrix=true&orderType=B2C` query to return all zones and a list of configured zone pairs (useful for building a coverage grid in the admin UI).

`PUT /admin/rate-cards/:id`

Updates a rate card.

`DELETE /admin/rate-cards/:id`

Deletes a rate card.

`POST /admin/agents`

Creates an agent.

```json
{
  "name": "Agent One",
  "email": "agent@example.com",
  "password": "secret123",
  "phone": "9999999999",
  "zone": "64f000000000000000000000"
}
```

`GET /admin/agents`

Lists agents.

`PATCH /admin/agents/:id/status`

Updates agent status.

```json
{
  "availabilityStatus": "available"
}
```

`POST /admin/customers`

Creates a customer.

```json
{
  "name": "Customer One",
  "email": "customer@example.com",
  "password": "secret123",
  "phone": "9999999999",
  "address": "Customer address"
}
```

`GET /admin/customers`

Lists customers.

### Agent

All agent routes require an agent JWT.

`GET /agent/orders`

Lists orders assigned to the current agent.

`PATCH /agent/location`

Updates the agent geospatial location.

```json
{
  "lat": 28.6139,
  "lng": 77.209
}
```

`PATCH /agent/availability`

```json
{
  "status": "available"
}
```

Valid statuses are `available`, `busy`, and `offline`.

## Database Schema

MongoDB collections are managed with Mongoose models.

### User

Used for customers, agents, and admins.

```text
name: String, required
email: String, required, unique
password: String, required, hashed before save
phone: String
role: "customer" | "agent" | "admin", default "customer"
address: String
zone: ObjectId -> Zone, agent-only
currentLocation: GeoJSON Point { coordinates: [lng, lat] }, agent-only
availabilityStatus: "available" | "busy" | "offline", default "offline"
activeOrderCount: Number, default 0
createdAt, updatedAt
```

Indexes:
- `currentLocation` has a `2dsphere` index.

### Zone

```text
name: String, required
pincodes: [String]
createdBy: ObjectId -> User
createdAt, updatedAt
```

### RateCard

Each rate card is keyed by a specific zone pair. A special "default fallback" entry is used when no exact pair is configured.

```text
orderType: "B2B" | "B2C", required
fromZone: ObjectId -> Zone, null when isDefaultFallback is true
toZone: ObjectId -> Zone, null when isDefaultFallback is true
isDefaultFallback: Boolean, default false
baseRate: Number, required
perKgRate: Number, required
codSurchargeFlat: Number
codSurchargePercent: Number
isActive: Boolean, default true
createdAt, updatedAt
```

Indexes:
- Unique compound index on `orderType`, `fromZone`, and `toZone` — prevents duplicate rate cards for the same zone pair.

### Order

```text
orderNumber: String, unique, generated as ORD-<timestamp>-<random>
customer: ObjectId -> User, required
createdByAdmin: Boolean, default false
pickupAddress: { line, pincode, lat, lng, coordinates: [lng, lat] }
dropAddress: { line, pincode, lat, lng }
dimensions: { l, b, h }, required
actualWeight: Number, required
volumetricWeight: Number
billedWeight: Number
orderType: "B2B" | "B2C", required
paymentType: "Prepaid" | "COD", required
pickupZone: ObjectId -> Zone
dropZone: ObjectId -> Zone
charge: { baseCharge, weightCharge, codSurcharge, totalCharge }
assignedAgent: ObjectId -> User
currentStatus: CREATED | ASSIGNED | PICKED_UP | IN_TRANSIT | OUT_FOR_DELIVERY | DELIVERED | FAILED | RESCHEDULED
failureReason: String
rescheduledDate: Date
reassignmentCount: Number, default 0
createdAt, updatedAt
```

### StatusHistory

Append-only tracking events for orders.

```text
order: ObjectId -> Order, required
status: String, required
changedBy: { userId: ObjectId -> User, role: String }
note: String
timestamp: Date, default now
```

## Rate Calculation Logic

The rate engine is implemented in `backend/src/services/rateCalculator.service.js` and is fully data-driven from `Zone` and `RateCard` records.

Input:

```text
pickupPincode
dropPincode
dimensions: { l, b, h }
actualWeight
orderType: B2B | B2C
paymentType: Prepaid | COD
```

Calculation steps:

1. Find the pickup and drop zones by matching `pickupPincode` and `dropPincode` against `Zone.pincodes`.
2. Reject the request with a 400 error if either pincode is not mapped to a zone.
3. Calculate volumetric weight:

```text
volumetricWeight = (length * breadth * height) / 5000
```

4. Calculate billed weight:

```text
billedWeight = max(actualWeight, volumetricWeight)
```

5. **Zone-pair rate lookup** — look up a `RateCard` matching exactly `{ orderType, fromZone: pickupZone._id, toZone: dropZone._id, isActive: true }`.

6. **Fallback** — if no exact match exists, look up a default fallback rate card matching `{ orderType, isDefaultFallback: true, isActive: true }`.

7. If neither an exact match nor a fallback is found, reject the request with a descriptive 400 error:

```text
"No active rate card configured for route from <Zone A> to <Zone B> for <orderType>"
```

8. Calculate base and weight charges:

```text
baseCharge = rateCard.baseRate
weightCharge = billedWeight * rateCard.perKgRate
```

9. Calculate COD surcharge only when `paymentType` is `COD`:

```text
codSurcharge = rateCard.codSurchargeFlat
```

If no flat surcharge is configured and a percentage surcharge exists:

```text
codSurcharge = (rateCard.codSurchargePercent / 100) * (baseCharge + weightCharge)
```

For prepaid orders:

```text
codSurcharge = 0
```

10. Calculate total:

```text
totalCharge = baseCharge + weightCharge + codSurcharge
```

The calculated values are stored on each order:

```text
volumetricWeight
billedWeight
charge.baseCharge
charge.weightCharge
charge.codSurcharge
charge.totalCharge
```

### Why zone-pair pricing?

The previous model used a binary `intra`/`inter` distinction, which charged the same flat rate for all inter-zone deliveries regardless of actual distance. For example, Kanpur→Prayagraj and Kanpur→Bengaluru were priced identically. The zone-pair matrix model allows admins to set independent rates for every `fromZone → toZone` combination, while a single "default fallback" rate card per `orderType` ensures orders never hard-fail on unconfigured routes.

## Agent Assignment Logic

Automatic assignment is implemented in `backend/src/services/autoAssign.service.js`.

Rules:
- Only agents with `role: "agent"` are considered.
- Agent must be `available`.
- Agent must belong to the pickup zone.
- Agent must have fewer than 5 active orders.
- The system first searches for the nearest available agent within 15 km of the pickup coordinates using MongoDB `$near`.
- If no nearby agent is found, it falls back to any available agent in the pickup zone.
- Agents are sorted by `activeOrderCount` so less busy agents are preferred.
- Once assigned, the order moves to `ASSIGNED`, `reassignmentCount` increases, and the agent's `activeOrderCount` increases.
- If an agent reaches 5 active orders, their status becomes `busy`.

## Frontend Notes

The frontend stores the JWT token in `localStorage` as `token`. The Axios client automatically attaches it to API requests as a bearer token.

Main screens:
- Landing page
- Login and signup
- Customer dashboard
- Admin dashboard
- Agent dashboard
- Order detail
- Order tracking

Frontend API wrappers live in:
- `frontend/src/api/auth.js`
- `frontend/src/api/orders.js`
- `frontend/src/api/admin.js`
- `frontend/src/api/agent.js`