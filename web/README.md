# ShopMule Web App

See the main [README.md](../README.md) in the repository root for full documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start database
docker compose up -d db

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Start dev server
npm run dev
```

Visit http://localhost:3000 and login with `admin@example.com` / `admin123`
