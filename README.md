# ShopMule - Heavy-Duty Truck Repair Shop SaaS

## Overview

ShopMule is a multi-tenant SaaS application for managing heavy-duty truck repair shop operations, including repair orders, technician time tracking, parts inventory, billing, and performance dashboards.

---

## Quick Start

### Stack
- **Frontend/Backend**: Next.js 14+ (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with credentials (email/password)
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod
- **Forms**: React Hook Form

### Setup

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
   - Login with: `admin@shopmule.com` / `admin123`

### Default Users (from seed)
- **Owner**: `admin@shopmule.com` / `admin123` (Role: OWNER)
- **Service Advisor**: `sarah@shopmule.com` / `advisor123` (Role: SERVICE_ADVISOR)
- **Service Manager**: `lisa@shopmule.com` / `manager123` (Role: SERVICE_MANAGER)
- **Parts Manager**: `rick@shopmule.com` / `parts123` (Role: PARTS_MANAGER)
- **Mechanic**: `john@shopmule.com` / `mechanic123` (Role: MECHANIC)

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

- **Authentication & RBAC** — NextAuth with credentials provider. Roles: OWNER, ADMIN, MANAGER, SERVICE_ADVISOR, SERVICE_MANAGER, PARTS_MANAGER, MECHANIC, TECH, VIEWER. Protected routes with middleware.
- **Work Orders** — Create, view, and manage repair orders with status workflow, labor/parts lines, and time tracking.
- **Time Tracking** — Shift punches (clock in/out), time entries linked to repair orders, real-time duration tracking.
- **Invoices** — Invoice generation from repair orders, payment tracking (UNPAID, PARTIALLY_PAID, PAID).
- **Inventory** — Parts management with stock levels, vendor tracking, and low-stock alerts.
- **TV Dashboard** — Full-screen leaderboard with technician performance metrics and auto-refresh.
- **AI Assistant** — Chat-based AI assistant with tool access for searching data, managing work orders, and getting recommendations.

---

## Developer Portal

A developer portal is available at `/dev` in the app. The public REST API, SDKs, CLI, and webhooks documented there are **coming soon** — they are not yet live. The internal `/api/*` routes used by the ShopMule web app work as expected.

---

## Production Deployment

Before deploying to production, complete this security checklist:

- [ ] **`NEXTAUTH_SECRET`** — Generate a unique secret: `openssl rand -base64 32`
- [ ] **`ADMIN_PASSWORD`** — Set a strong password via env var (seed script will refuse to run in production with the default)
- [ ] **`ADMIN_EMAIL`** — Change from default `admin@shopmule.com` to your real email
- [ ] **`DATABASE_URL`** — Use a production PostgreSQL instance with a strong password
- [ ] **HTTPS** — Serve the app behind TLS (required for secure cookies)
- [ ] **`NEXTAUTH_URL`** — Set to your production domain (e.g. `https://app.yourshop.com`)
- [ ] **Rotate all seed passwords** — All default passwords (`advisor123`, `manager123`, etc.) must be changed
- [ ] **Stripe keys** — Switch from `sk_test_` to `sk_live_` keys
- [ ] **Review `.env.example`** — Ensure no secrets are committed to version control

---

## Development

### Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Create a new migration
npm run db:migrate

# Reset database (deletes all data)
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

## Project Structure

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

## Docker

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

## Notes

- All tenant-scoped models include `shopId` and are filtered by the user's shop
- Role-based access control (RBAC) is enforced via middleware and server-side helpers
- The TV dashboard uses token-based authentication (no login required)
- File attachments are stored locally (can be migrated to S3 later)

---

## Contributing

1. Follow the coding style in existing files
2. Use TypeScript strict mode
3. Validate all inputs with Zod
4. Test your changes locally before committing
5. Update this README if adding new features

---

## License

Proprietary. All rights reserved.
