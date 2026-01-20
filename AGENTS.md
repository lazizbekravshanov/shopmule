# Repository Guidelines

## Project Structure & Module Organization
- `apps/` contains Django apps (e.g., `service_orders`, `customers`, `tenants`, `tv`, `portal`). Each app follows the standard layout with `models.py`, `views.py`, and optional `tests.py`.
- `config/` holds Django project settings, ASGI/WSGI, URLs, and Celery configuration.
- `templates/` stores Django templates for the admin/portal/TV dashboard UI.
- Root files include `manage.py`, `Dockerfile`, `docker-compose.yml`, and `requirements.txt`.

## Build, Test, and Development Commands
- `cp .env.example .env` sets local environment defaults (edit secrets like `OPENAI_API_KEY`).
- `docker compose up --build` builds images and starts the web, DB, and Redis services.
- `docker compose exec web python manage.py migrate` applies schema migrations.
- `docker compose exec web python manage.py seed_demo` loads demo data for the UI and APIs.
- `docker compose exec web python manage.py test` runs the Django test suite.

## Coding Style & Naming Conventions
- Python uses 4-space indentation and standard PEP 8 formatting; keep lines and imports consistent with existing files.
- Django app names are lowercase with underscores (e.g., `service_orders`), model classes use `CamelCase`, constants use `UPPER_SNAKE_CASE`.
- Keep multi-tenant logic explicit: tenant-scoped models include a `tenant` field and should respect tenant filtering.

## Testing Guidelines
- Tests live in `apps/<app>/tests.py` and use `django.test.TestCase`.
- Name test methods `test_*` and prefer small, focused assertions (see `apps/service_orders/tests.py`).
- No explicit coverage target is defined; add tests for new behavior, especially status transitions and tenant scoping.

## Commit & Pull Request Guidelines
- Recent commit messages are short, sentence-case summaries (e.g., “Initial commit”, “Build multi-tenant shop management MVP”). Follow this style and keep messages imperative.
- PRs should include: a concise description, testing notes (commands + results), and any required migrations or `.env` changes.
- Include screenshots for UI changes in the portal or TV dashboard, and link related issues when available.

## Security & Configuration Tips
- Do not commit secrets; keep them in `.env` and document new settings in `.env.example`.
- AI endpoints require `OPENAI_API_KEY`; ensure demo data and seeded users remain non-production-only.
