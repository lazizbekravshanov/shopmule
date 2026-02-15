# ShopMule - Heavy-Duty Truck Repair Shop SaaS

## Overview

ShopMule is a multi-tenant SaaS application for managing heavy-duty truck repair shop operations, including repair orders, technician time tracking, parts inventory, billing, and performance dashboards.

## ⚠️ Migration Status

This repository contains:
- **Legacy Django app** (root directory) - Original implementation
- **New Next.js app** (`/web` directory) - Modernized implementation

See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for detailed migration information.

---

## 🚀 New Next.js App (Recommended)

### Stack
- **Frontend/Backend**: Next.js 14+ (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with credentials (email/password)
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod
- **Forms**: React Hook Form

### Quick Start

1. **Navigate to web directory:**
   ```bash
   cd web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed (DATABASE_URL, NEXTAUTH_SECRET)
   ```

4. **Start PostgreSQL with Docker:**
   ```bash
   docker compose up -d db
   ```
   Or use the full stack:
   ```bash
   docker compose up -d
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database:**
   ```bash
   npm run db:seed
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

8. **Access the application:**
   - Web app: http://localhost:3000
   - Login with: `admin@example.com` / `admin123`

### Default Users (from seed)
- **Admin**: `admin@example.com` / `admin123` (Role: ADMIN)
- **Service Writer**: `writer@example.com` / `writer123` (Role: MANAGER)
- **Technician**: `tech@example.com` / `tech123` (Role: TECH)

### Available Routes

- `/login` - Login page
- `/dashboard` - Main dashboard with stats
- `/repair-orders` - List all repair orders
- `/repair-orders/new` - Create new repair order
- `/repair-orders/[id]` - View repair order details
- `/technicians` - View technicians and their status
- `/time-clock` - Clock in/out and track time on repair orders
- `/invoices` - View invoices and payment status
- `/tv?token=<TOKEN>` - TV dashboard/leaderboard (full-screen mode)

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma client

### Features

✅ **Authentication & RBAC**
- NextAuth with credentials provider
- Roles: ADMIN, MANAGER, TECH, VIEWER
- Protected routes with middleware

✅ **Repair Orders**
- Create, view, and manage repair orders
- Status workflow: DRAFT → AWAITING_APPROVAL → APPROVED → IN_PROGRESS → READY_TO_INVOICE → INVOICED → CLOSED
- Labor lines and parts lines
- Time tracking per repair order

✅ **Time Tracking**
- Shift punches (clock in/out)
- Time entries linked to repair orders
- Real-time duration tracking
- Today's summary view

✅ **Technicians**
- View all technicians
- See who's clocked in
- Track active time entries

✅ **Invoices**
- Invoice generation from repair orders
- Payment tracking
- Status: UNPAID, PARTIALLY_PAID, PAID

✅ **TV Dashboard**
- Full-screen leaderboard
- Technician performance metrics
- Active orders
- Real-time auto-refresh

### Database Schema

The Prisma schema is located at `web/prisma/schema.prisma`. Key models:
- `Shop` - Multi-tenant shop/tenant
- `User` - Users with roles
- `Customer` - Customers
- `Vehicle` - Customer vehicles
- `RepairOrder` - Repair/service orders
- `LaborLine`, `PartLine` - Order line items
- `TimeEntry`, `ShiftPunch` - Time tracking
- `Invoice`, `Payment` - Billing
- `Part` - Parts inventory

---

## 🐍 Legacy Django App (Deprecated)

> **Note**: The Django app is preserved for reference but the Next.js app is the active development target.

### Stack
- Python 3.12, Django 5.x, DRF
- PostgreSQL
- Redis + Celery
- JWT auth (SimpleJWT)
- Django Admin + Django templates

### Quick Start (Legacy)

```bash
cp .env.example .env
docker compose up --build
```

In another terminal:
```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py seed_demo
```

Admin: http://localhost:8000/admin/ (admin/admin123)

---

## 📋 Migration Guide

See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for:
- Model mappings (Django → Prisma)
- Route mappings
- Data migration strategy
- Testing plan

---

## 🛠️ Development

### Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Create a new migration
npm run db:migrate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database in browser
npm run db:studio
```

### Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - App URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with: `openssl rand -base64 32`)

---

## 📁 Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Route Handlers)
│   ├── dashboard/         # Dashboard pages
│   ├── repair-orders/     # Repair order pages
│   ├── technicians/       # Technician pages
│   ├── time-clock/        # Time clock page
│   ├── invoices/          # Invoice pages
│   └── tv/                # TV dashboard
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── rbac.ts           # RBAC helpers
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── types/                 # TypeScript types
```

---

## 🐳 Docker

### Development
```bash
cd web
docker compose up
```

### Production
Update `docker-compose.yml` with production environment variables and use:
```bash
docker compose -f docker-compose.yml up --build
```

---

## 📝 Notes

- All tenant-scoped models include `shopId` and are filtered by the user's shop
- Role-based access control (RBAC) is enforced via middleware and server-side helpers
- The TV dashboard uses token-based authentication (no login required)
- File attachments are stored locally (can be migrated to S3 later)

---

## 🔌 Developer Portal & API Integration

ShopMule exposes a REST API for third-party integrations. If you want to build on top of ShopMule or connect your service, start here.

**Full docs:** Visit `/dev` in the app or see [web/app/dev/page.tsx](web/app/dev/page.tsx).

### API Base URL

```
https://api.shopmule.com/v2
```

### Authentication

All API requests require a Bearer token:

```bash
curl https://api.shopmule.com/v2/work-orders \
  -H "Authorization: Bearer sk_live_your_api_key"
```

Get your API key from **Settings > API Keys** in the dashboard.

### SDKs

```bash
# Node.js / TypeScript
npm install @shopmule/sdk

# Python
pip install shopmule

# CLI
npm install -g @shopmule/cli
```

### Quick Example

```typescript
import ShopMule from '@shopmule/sdk';

const client = new ShopMule({
  apiKey: process.env.SHOPMULE_API_KEY,
});

// Create a work order
const wo = await client.workOrders.create({
  customerId: 'cus_abc123',
  vehicleId: 'veh_xyz789',
  description: 'Oil change + tire rotation',
});

// Listen for webhook events
client.webhooks.on('work_order.completed', async (event) => {
  console.log(`Work order ${event.data.id} completed`);
});
```

### API Resources

| Resource | Endpoints |
|----------|-----------|
| **Work Orders** | CRUD + status transitions |
| **Customers** | CRUD + vehicle management |
| **Invoices** | Create, send, record payments |
| **Inventory** | Parts CRUD + stock history |
| **AI Agents** | Diagnose, estimate, summarize (Beta) |

### Webhooks

Subscribe to real-time events in **Settings > Webhooks**:

| Event | Description |
|-------|-------------|
| `work_order.created` | New work order created |
| `work_order.status_changed` | Work order transitions status |
| `work_order.completed` | Work order marked complete |
| `invoice.created` | Invoice generated |
| `invoice.paid` | Payment recorded |
| `customer.created` | New customer added |
| `inventory.low_stock` | Part stock below threshold |
| `ai.job_completed` | Async AI job finished |

All payloads are signed — verify using your webhook secret.

### Sandbox

Use `sk_test_*` keys for development. Sandbox data resets daily at midnight UTC. No billing impact.

### Rate Limits

| Plan | Rate | Burst | Daily |
|------|------|-------|-------|
| Free | 60 req/min | 10 req/sec | 1,000 |
| Pro | 600 req/min | 50 req/sec | 50,000 |
| Enterprise | Custom | Custom | Unlimited |

---

## 🤝 Contributing

1. Follow the coding style in existing files
2. Use TypeScript strict mode
3. Validate all inputs with Zod
4. Test your changes locally before committing
5. Update this README if adding new features

---

## 📄 License

Proprietary. All rights reserved.
