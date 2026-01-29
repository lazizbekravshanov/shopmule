FROM node:20-alpine AS base

# Security: Add labels for container identification
LABEL org.opencontainers.image.title="ShopMule Web"
LABEL org.opencontainers.image.description="Shop management software"
LABEL org.opencontainers.image.vendor="ShopMule"
LABEL org.opencontainers.image.source="https://github.com/lazizbekravshanov/shopmule"

# Install dependencies only when needed
FROM base AS deps
# Security: Install only necessary packages
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Security: Use ci for reproducible builds
RUN npm ci --only=production=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Security: Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Security: Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Create non-root user with specific UID/GID
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Security: Create necessary directories with proper ownership
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: Switch to non-root user
USER nextjs

# Security: Expose only necessary port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
