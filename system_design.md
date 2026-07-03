# System Design

## Overview

The Last-Mile Delivery Tracker is built around a Node.js/Express API, MongoDB, and a React frontend. The backend owns the delivery domain logic: pricing, zone detection, assignment, status transitions, tracking history, and notifications. The frontend consumes this API through role-specific dashboards for customers, agents, and admins.

## Rate Calculation Engine

The rate calculation engine is implemented as a data-driven service instead of hardcoding prices in application logic. A quote or order creation request sends pickup/drop pincodes, parcel dimensions, actual weight, order type, and payment type. The service first resolves zones, then selects an active `RateCard` using three attributes: `orderType`, `zoneRelation`, and `isActive: true`.

The engine calculates volumetric weight with:

```text
volumetricWeight = (length * breadth * height) / 5000
```

The billed weight is the greater of actual weight and volumetric weight:

```text
billedWeight = max(actualWeight, volumetricWeight)
```

The final charge is composed of base rate, weight charge, and optional COD surcharge:

```text
baseCharge = rateCard.baseRate
weightCharge = billedWeight * rateCard.perKgRate
totalCharge = baseCharge + weightCharge + codSurcharge
```

For COD orders, the surcharge is flat when `codSurchargeFlat` is configured. If no flat value exists, the engine applies `codSurchargePercent` to `baseCharge + weightCharge`. Prepaid orders have no COD surcharge. The calculated charge breakdown is stored on the order so historical orders remain auditable even if rate cards change later.

## Zone Detection Approach

Zones are modeled as MongoDB documents containing a zone name and an array of pincodes. During quote and order creation, the backend looks up both pickup and drop zones by checking whether the submitted pincode exists in `Zone.pincodes`.

If either pincode is unmapped, the request is rejected because pricing and assignment both depend on known service zones. Once both zones are found, the backend derives `zoneRelation`:

```text
intra = pickupZone and dropZone are the same
inter = pickupZone and dropZone are different
```

This relation is a key input to the rate card lookup. The approach keeps zone management operationally simple: admins can add, remove, or move pincodes between zones without changing code. The tradeoff is that pincode membership must be kept clean and non-overlapping to avoid ambiguous pricing behavior.

## Auto-Assignment Logic

Auto-assignment is triggered by an admin for `CREATED` or `RESCHEDULED` orders and also runs automatically after a customer reschedules a failed delivery. The assignment service searches for agents with:

- `role: "agent"`
- `availabilityStatus: "available"`
- matching pickup zone
- `activeOrderCount` below the maximum concurrency limit of 5

The first search uses MongoDB geospatial querying against the agent's `currentLocation` with a 15 km maximum distance from the pickup coordinates. Results are sorted by `activeOrderCount`, so less busy nearby agents are preferred. If no nearby agent is found, the service falls back to any available agent in the pickup zone, still preferring the lowest active order count.

After assignment, the order moves to `ASSIGNED`, the assigned agent is saved, `reassignmentCount` is incremented, and the agent's `activeOrderCount` increases. If the agent reaches 5 active orders, their status becomes `busy`. A `StatusHistory` entry records that the system assigned the order, and a notification is sent.

## Failed Delivery Handling

Order movement is controlled by a state machine. Normal delivery follows:

```text
CREATED -> ASSIGNED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
```

Failure is only valid from `OUT_FOR_DELIVERY`:

```text
OUT_FOR_DELIVERY -> FAILED -> RESCHEDULED -> ASSIGNED
```

When an agent marks an order as `FAILED`, they must provide a failure reason. The order stores that reason, a status history record is appended, the customer is notified, and the assigned agent's active order count is reduced. If the agent was marked `busy` and now has fewer than 5 active orders, they become `available` again.

Only the customer who owns the failed order can reschedule it. Rescheduling stores the requested date, changes the status to `RESCHEDULED`, appends tracking history, sends a notification, and attempts auto-assignment again. If no eligible agent is available during this attempt, the rescheduled state remains recorded so an admin can retry assignment later.
