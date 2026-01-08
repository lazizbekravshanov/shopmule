# BodyShopper - Heavy-Duty Truck Repair Shop SaaS (MVP)

## Stack
- Python 3.12, Django 5.x, DRF
- PostgreSQL
- Redis + Celery
- JWT auth (SimpleJWT)
- Django Admin + Django templates (Portal + TV Dashboard)

## Quick Start
```bash
cd /path/to/bodyshopper
cp .env.example .env
# Optional: set OPENAI_API_KEY in .env

docker compose up --build
```

In another terminal:
```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py seed_demo
```

> Troubleshooting:
> - If you see `cp: .env.example: No such file or directory`, make sure you're in the repo root first (`cd /path/to/bodyshopper`).
> - If you see `no configuration file provided: not found`, run `docker compose -f docker-compose.yml up --build` from the repo root.

Admin:
- URL: http://localhost:8000/admin/
- Username: admin
- Password: admin123

## API Auth
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"service_writer","password":"writer123"}'
```

## Sample API Calls
```bash
# List customers
curl -H "Authorization: Bearer <ACCESS>" http://localhost:8000/api/customers/

# Clock in
curl -X POST -H "Authorization: Bearer <ACCESS>" http://localhost:8000/api/attendance/clock-in

# Start time entry
curl -X POST -H "Authorization: Bearer <ACCESS>" \
  -H "Content-Type: application/json" \
  -d '{"service_order": 1, "notes":"Diagnosing"}' \
  http://localhost:8000/api/time-entries/start

# AI cleanup notes
curl -X POST -H "Authorization: Bearer <ACCESS>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Customer says truck pulls right. Loud grinding."}' \
  http://localhost:8000/api/ai/artifacts/service-orders/1/cleanup-notes/

# TV dashboard
curl "http://localhost:8000/api/tv/dashboard?token=<TOKEN>&range=today"
```

## Customer Portal
Estimate approval link is printed to the console when you use the Django Admin action "Send estimate link" on an Estimate.

## TV Dashboard
Create a `TenantDisplayToken` in Django Admin and run the "Rotate tokens" action to generate a token.
Visit:
```
http://localhost:8000/tv/dashboard/?token=<TOKEN>
```

## Multi-tenancy
All tenant-scoped models include `tenant` and are filtered via `TenantScopedViewSet`.

## Dev Notes
- OpenAI API key is required for AI endpoints.
- Media uploads stored in `MEDIA_ROOT` (local filesystem).
