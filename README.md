# ShopMule - Heavy-Duty Truck Repair Shop SaaS

## Overview

ShopMule is a multi-tenant SaaS application for managing heavy-duty truck repair shop operations, including work orders, technician time tracking, parts inventory, invoicing, payroll, and performance dashboards.

---

## Quick Start

### Stack
- **Frontend/Backend**: Next.js 16 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with credentials (email/password)
- **AI**: Groq (Llama 3.3) with Vercel AI SDK
- **Payments**: Stripe
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod
- **Testing**: Vitest

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
- **Admin**: `admin@shopmule.com` / `admin123` (Role: ADMIN)
- **Service Manager**: `lisa@shopmule.com` / `manager123` (Role: SERVICE_MANAGER)
- **Technician**: `john@shopmule.com` / `mechanic123` (Role: TECHNICIAN)

### Available Routes

- `/login` - Login page
- `/register` - Self-service signup
- `/dashboard` - AI command center with shop pulse metrics
- `/work-orders` - Work orders (table, Kanban, timeline, AI actions views)
- `/work-orders/new` - Create new work order
- `/work-orders/[id]` - Work order detail (labor, parts, photos, AI panel)
- `/customers` - Customer management
- `/fleet-accounts` - B2B fleet account management
- `/inventory` - Parts inventory with low-stock alerts
- `/technicians` - Team management and real-time attendance
- `/time-clock` - Clock in/out, breaks, punch review, timesheets
- `/invoices` - Invoices with AR aging, Stripe payments, payment links
- `/payroll` - Payroll with deductions and loans
- `/efficiency` - Technician efficiency KPIs
- `/reports` - Revenue, efficiency, team, and payroll analytics
- `/schedule` - Calendar and appointment booking
- `/workflow` - Kanban pipeline for work order lifecycle
- `/settings` - Shop configuration, billing, audit logs, geofences
- `/integrations` - Connected services (Stripe, Twilio, SendGrid)
- `/help` - FAQ and support
- `/tv?token=<TOKEN>` - TV dashboard/leaderboard (full-screen mode)

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest test suite
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma client

### Features

- **Authentication & RBAC** — NextAuth with credentials provider. Roles: OWNER, ADMIN, SERVICE_MANAGER, TECHNICIAN, TIMESHEET_USER. Protected routes with middleware and granular permission system with overrides.
- **Work Orders** — Full lifecycle management with 4 view modes (AI actions, table, Kanban, timeline). Labor tracking, parts picker, photo uploads, AI status panel.
- **Time Tracking** — Clock in/out, break tracking, punch review dashboard, weekly timesheets, overtime calculations.
- **Invoices** — AR aging analysis, Stripe payment integration, payment link generation, email/SMS reminders, PDF export.
- **Inventory** — Parts CRUD with inline stock adjustment, low-stock alerts, vendor tracking, purchase orders.
- **Payroll** — Gross/net/deduction calculations, period selection, per-employee breakdown, CSV export.
- **Efficiency** — Technician KPI dashboard with utilization and efficiency metrics, color-coded performance bars.
- **Reports** — 5 report tabs: overview, revenue, efficiency, team, payroll. Date range filtering and CSV export.
- **Customers** — B2C individual and B2B fleet account management, vehicle tracking, customer portal with payment links.
- **Schedule** — Calendar-based appointment booking with technician assignment and status tracking.
- **TV Dashboard** — Full-screen leaderboard with technician performance metrics and auto-refresh.
- **AI Assistant** — Chat-based copilot with tools for searching data, managing work orders, diagnostics, estimates, and recommendations. Tenant-isolated.
- **Integrations** — Stripe (payments), Twilio (SMS), SendGrid (email). Extensible framework for future integrations.
- **Mobile App** — Companion mobile app for technicians with GPS clock-in, photo uploads, and work order access.

---

## Production Deployment

Before deploying to production, complete this security checklist:

- [ ] **`NEXTAUTH_SECRET`** — Generate a unique secret: `openssl rand -base64 32`
- [ ] **`ADMIN_PASSWORD`** — Set a strong password via env var (seed script will refuse to run in production with the default)
- [ ] **`ADMIN_EMAIL`** — Change from default `admin@shopmule.com` to your real email
- [ ] **`DATABASE_URL`** — Use a production PostgreSQL instance with a strong password
- [ ] **HTTPS** — Serve the app behind TLS (required for secure cookies, HSTS enforcement)
- [ ] **`NEXTAUTH_URL`** — Set to your production domain (e.g. `https://app.yourshop.com`)
- [ ] **Rotate all seed passwords** — All default passwords (`manager123`, `mechanic123`, etc.) must be changed
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

Optional:
- `STRIPE_SECRET_KEY` - Stripe API key for payments
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` - Twilio for SMS
- `RESEND_API_KEY` - Resend for email
- `GROQ_API_KEY` - Groq for AI assistant

---

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (100+ endpoints)
│   ├── (dashboard)/       # Dashboard pages (all features)
│   ├── login/             # Login page
│   ├── register/          # Self-service signup
│   └── tv/                # TV dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard widgets
│   ├── work-order/       # Work order components
│   ├── invoice/          # Invoice components
│   └── time-clock/       # Time clock components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── auth/             # RBAC, permissions, withAuth wrappers
│   ├── ai/               # AI tools and pipeline
│   ├── db.ts             # Prisma client
│   ├── security.ts       # Input sanitization, rate limiting
│   └── email/            # Email templates
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── types/                 # TypeScript types
mobile/                     # React Native mobile app
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

- All tenant-scoped models include `tenantId` and are filtered by the user's tenant
- Role-based access control (RBAC) is enforced via middleware and server-side `withAuth`/`withPermission` wrappers
- The TV dashboard uses token-based authentication (no login required)
- AI tools are tenant-isolated via a factory function pattern
- Security headers (CSP, HSTS, X-Frame-Options) are set in middleware for production
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
