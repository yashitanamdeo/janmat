FROM node:18-alpine AS builder

WORKDIR /build

# Copy only package files first (these change less frequently)
COPY package*.json ./

# Install with npm ci (deterministic, cached by Docker)
RUN npm ci --include=dev --maxsockets=1

# Copy remaining source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage - much smaller
FROM node:18-alpine

WORKDIR /app

# Install dumb-init and openssl
RUN apk add --no-cache dumb-init openssl

# Copy only necessary files from builder
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package*.json ./
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma

EXPOSE 3000

# Use dumb-init to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
