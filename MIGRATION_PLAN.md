# Migration Plan: Django → Next.js

## Overview
Migration of BodyShopper Django/Python SaaS to Next.js 14+ (App Router), TypeScript, Prisma, and shadcn/ui.

## Django Apps Inventory

### Core Apps
1. **tenants** - Multi-tenancy foundation
2. **users** - User authentication and profiles
3. **customers** - Customer management
4. **units** - Vehicle/Unit management
5. **parts** - Parts/inventory management
6. **service_orders** - Repair orders (core business logic)
7. **attendance** - Clock in/out and time tracking
8. **billing** - Estimates, invoices, payments
9. **inventory** - Inventory adjustments
10. **portal** - Customer portal (estimates)
11. **tv** - TV dashboard/leaderboard
12. **ai** - AI artifacts (optional, can be deferred)
13. **audit** - Audit logging
14. **reports** - Reporting (minimal in current codebase)

## Model Mappings: Django → Prisma

### Tenant System
**Django:** `Tenant` (name, slug, created_at)
- **Prisma:** `Shop` (name, slug, createdAt)
- **Note:** Renamed for clarity - "Shop" better reflects the business domain

### User & Auth
**Django:** `User` (extends AbstractUser)
- Fields: tenant, phone, username, email, password, is_staff, is_superuser
- Groups: Owner/Admin, Service Writer, Technician, Parts Manager, Accounting, Customer
- **Prisma:** 
  - `User` (id, email, passwordHash, name, phone, shopId, role, createdAt, updatedAt)
  - `Role` enum: ADMIN, MANAGER, TECH, VIEWER
- **Mapping:** Django Groups → Role enum (simplified RBAC)
  - Owner/Admin → ADMIN
  - Service Writer → MANAGER
  - Technician → TECH
  - Parts Manager → MANAGER (or separate role if needed)
  - Accounting → MANAGER
  - Customer → VIEWER (or separate customer portal auth)

### Customers
**Django:** `Customer` (name, phone, email, billing_terms, tenant, created_at, updated_at)
- **Prisma:** `Customer` (id, shopId, name, phone, email, billingTerms, createdAt, updatedAt)

### Units/Vehicles
**Django:** `UnitVehicle` (customer, vin, make, model, year, plate, odometer, engine_hours, tenant, created_at, updated_at)
- **Prisma:** `Vehicle` (id, shopId, customerId, vin, make, model, year, plate, odometer, engineHours, createdAt, updatedAt)

**Django:** `PreventiveMaintenanceSchedule` (unit, mileage_interval, days_interval, engine_hours_interval, last_service_*)
- **Prisma:** `PMSchedule` (id, vehicleId, mileageInterval, daysInterval, engineHoursInterval, lastServiceDate, lastServiceMileage, lastServiceEngineHours)
- **Note:** Can be added in Phase 2 if needed

### Parts
**Django:** `Part` (sku, description, vendor, cost, price, qty_on_hand, reorder_point, bin_location, tenant, created_at, updated_at)
- **Prisma:** `Part` (id, shopId, sku, description, vendor, cost, price, qtyOnHand, reorderPoint, binLocation, createdAt, updatedAt)

**Django:** `InventoryAdjustment` (part, quantity_change, reason, adjusted_at, tenant, created_at, updated_at)
- **Prisma:** `InventoryAdjustment` (id, shopId, partId, quantityChange, reason, adjustedAt, createdAt, updatedAt)

### Service Orders (Repair Orders)
**Django:** `ServiceOrder` (customer, unit, status, internal_notes, customer_notes, opened_at, closed_at, in_progress_at, is_comeback, tenant, created_at, updated_at)
- **Status enum:** DRAFT, AWAITING_APPROVAL, APPROVED, IN_PROGRESS, READY_TO_INVOICE, INVOICED, CLOSED
- **Prisma:** `RepairOrder` (id, shopId, customerId, vehicleId, status, internalNotes, customerNotes, openedAt, closedAt, inProgressAt, isComeback, createdAt, updatedAt)
- **Status enum:** DRAFT, AWAITING_APPROVAL, APPROVED, IN_PROGRESS, READY_TO_INVOICE, INVOICED, CLOSED

**Django:** `ServiceOrderLaborLine` (service_order, tech, hours, rate, description, billed_hours, tenant, created_at, updated_at)
- **Prisma:** `LaborLine` (id, shopId, repairOrderId, techId, hours, rate, description, billedHours, createdAt, updatedAt)

**Django:** `ServiceOrderPartLine` (service_order, part, qty, unit_cost, unit_price, taxable, tenant, created_at, updated_at)
- **Prisma:** `PartLine` (id, shopId, repairOrderId, partId, qty, unitCost, unitPrice, taxable, createdAt, updatedAt)

**Django:** `Attachment` (service_order, file, uploaded_by, tenant, created_at, updated_at)
- **Prisma:** `Attachment` (id, shopId, repairOrderId, fileUrl, uploadedById, createdAt, updatedAt)
- **Note:** File storage migration - use local storage or S3-compatible

### Attendance & Time Tracking
**Django:** `ShiftPunch` (user, clock_in_at, clock_out_at, source, ip_address, user_agent, tenant, created_at, updated_at)
- **Constraint:** One open punch per user per tenant
- **Prisma:** `ShiftPunch` (id, shopId, userId, clockInAt, clockOutAt, source, ipAddress, userAgent, createdAt, updatedAt)
- **Index:** Unique constraint on (shopId, userId) where clockOutAt is null

**Django:** `TimeEntry` (tech, service_order, clock_in, clock_out, notes, tenant, created_at, updated_at)
- **Constraint:** One open time entry per tech per tenant
- **Prisma:** `TimeEntry` (id, shopId, techId, repairOrderId, clockIn, clockOut, notes, createdAt, updatedAt)
- **Index:** Unique constraint on (shopId, techId) where clockOut is null

### Billing
**Django:** `Estimate` (service_order, status, total, portal_token_hash, portal_token_expires_at, approved_at, approved_by_name, approved_ip, approved_user_agent, tenant, created_at, updated_at)
- **Status:** PENDING, APPROVED, DECLINED
- **Prisma:** `Estimate` (id, shopId, repairOrderId, status, total, portalTokenHash, portalTokenExpiresAt, approvedAt, approvedByName, approvedIp, approvedUserAgent, createdAt, updatedAt)
- **Status enum:** PENDING, APPROVED, DECLINED

**Django:** `Invoice` (service_order, status, total, issued_at, tenant, created_at, updated_at)
- **Status:** UNPAID, PARTIALLY_PAID, PAID
- **Prisma:** `Invoice` (id, shopId, repairOrderId, status, total, issuedAt, createdAt, updatedAt)
- **Status enum:** UNPAID, PARTIALLY_PAID, PAID

**Django:** `Payment` (invoice, method, amount, reference, paid_at, tenant, created_at, updated_at)
- **Method:** CARD, ACH, CASH, CHECK
- **Prisma:** `Payment` (id, shopId, invoiceId, method, amount, reference, paidAt, createdAt, updatedAt)
- **Method enum:** CARD, ACH, CASH, CHECK

### TV Dashboard
**Django:** `TenantDisplayToken` (token_hash, expires_at, tenant, created_at, updated_at)
- **Prisma:** `DisplayToken` (id, shopId, tokenHash, expiresAt, createdAt, updatedAt)

### Audit
**Django:** `AuditLog` (user, action, description, ip_address, user_agent, tenant, created_at, updated_at)
- **Prisma:** `AuditLog` (id, shopId, userId, action, description, ipAddress, userAgent, createdAt, updatedAt)

### AI Artifacts (Optional/Deferred)
**Django:** `ServiceOrderAIArtifact` (service_order, kind, input_text, output_json, tenant, created_at, updated_at)
- **Prisma:** Defer to Phase 2 or implement as simple JSON field on RepairOrder

## Route/Page Mapping

### Django Admin → Next.js Dashboard
- `/admin/` → `/dashboard` (role: ADMIN, MANAGER)

### Auth
- JWT `/api/token/` → `/api/auth/signin` (NextAuth credentials)
- `/login` → `/login`

### API Routes → Next.js Route Handlers
- `/api/customers` → `/api/customers`
- `/api/units` → `/api/vehicles`
- `/api/service-orders` → `/api/repair-orders`
- `/api/parts` → `/api/parts`
- `/api/attendance/clock-in` → `/api/attendance/clock-in` (POST)
- `/api/time-entries/start` → `/api/time-entries/start` (POST)
- `/api/invoices` → `/api/invoices`
- `/api/tv/dashboard` → `/api/tv/dashboard`

### Pages
- `/` (home) → `/dashboard`
- `/repair-orders` → List view
- `/repair-orders/new` → Create form
- `/repair-orders/[id]` → Detail view with labor/parts
- `/technicians` → List of technicians (users with TECH role)
- `/time-clock` → Clock in/out + active timer + today summary
- `/invoices` → Invoice list + detail
- `/tv` → Full-screen leaderboard (token-based auth)

### Customer Portal (Deferred or Separate)
- `/portal/estimate/[token]` → Customer-facing estimate approval
- **Note:** Can be implemented in Phase 2

## Auth & RBAC Plan

### NextAuth Configuration
- Provider: Credentials (email/password)
- Password hashing: bcrypt (12 rounds)
- Session: JWT stored in httpOnly cookie
- Callbacks: Attach shopId and role to session

### Roles
- **ADMIN**: Full access, user management
- **MANAGER**: Service writers, parts managers, accounting
- **TECH**: Technicians - clock in/out, time entries, view assigned ROs
- **VIEWER**: Read-only access (or customer portal)

### Middleware Protection
- `/middleware.ts`: Check auth, enforce shopId context
- Server helpers: `requireAuth()`, `requireRole(['ADMIN'])`
- Route-level protection via layout.tsx or route handlers

## Data Migration Strategy

### Option 1: SQL Dump/Restore (Recommended)
1. Export Django data: `python manage.py dumpdata --natural-foreign --natural-primary > data.json`
2. Create Prisma schema
3. Run `prisma migrate dev` to create tables
4. Write migration script to transform JSON → Prisma inserts
5. Or: Direct SQL transformation if schema is close

### Option 2: Incremental Migration
1. Keep Django running initially
2. Set up Next.js with Prisma on same DB
3. Sync data via API or direct DB reads during transition
4. Gradually move traffic to Next.js

### Multi-Tenancy Migration
- All tenant-scoped models have `shopId` foreign key
- Ensure tenant → shop mapping is preserved
- Update all queries to filter by `shopId` from session

## Key Business Logic to Preserve

### Service Order Status Transitions
```typescript
const ALLOWED_TRANSITIONS = {
  DRAFT: ['AWAITING_APPROVAL'],
  AWAITING_APPROVAL: ['APPROVED'],
  APPROVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['READY_TO_INVOICE'],
  READY_TO_INVOICE: ['INVOICED'],
  INVOICED: ['CLOSED'],
  CLOSED: []
};
```

### Clock-In Validation
- User must not have open ShiftPunch
- On clock-in, set `clockInAt = now()`
- On clock-out, set `clockOutAt = now()`

### Time Entry Validation
- User must be clocked in (open ShiftPunch exists)
- User must not have open TimeEntry
- TimeEntry links to RepairOrder

### Inventory Adjustments
- On adjustment, update `Part.qtyOnHand` atomically
- Log reason and quantity change

### Invoice Generation
- From RepairOrder in READY_TO_INVOICE status
- Calculate total from LaborLines + PartLines
- Update RepairOrder status to INVOICED

## Testing Strategy

### Unit Tests
- Status transition logic
- Time tracking validations
- RBAC helpers

### Integration Tests
- API route handlers
- Server actions
- Prisma queries

### E2E Tests (Optional)
- Login flow
- Create repair order
- Clock in/out
- Time entry start/stop

## Rollback Plan

1. Keep Django codebase in `/legacy` folder
2. Database: Use separate DB for Next.js initially, or use migrations
3. If rollback needed:
   - Stop Next.js app
   - Point traffic back to Django
   - Revert DB migrations if needed

## Phase 2 / Deferred Features

- Customer portal (estimate approval)
- AI artifacts (can use OpenAI API directly in Server Actions)
- Preventive maintenance schedules
- File attachments (simplified: use local storage or S3)
- Advanced reporting
- Email notifications

## Implementation Checklist

- [x] Create migration plan
- [ ] Scaffold Next.js app
- [ ] Set up Prisma schema
- [ ] Implement NextAuth
- [ ] Create RBAC middleware
- [ ] Build dashboard page
- [ ] Build repair orders pages
- [ ] Build time clock page
- [ ] Build invoices page
- [ ] Build TV dashboard
- [ ] Create seed script
- [ ] Set up Docker
- [ ] Update README
