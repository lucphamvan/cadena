# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (ci for reproducible builds)
RUN npm ci

# Copy source code
COPY . .

# Build args for environment variables at build time
# Override these when running `docker build`
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="Employee Portal"

# Set env vars for Vite build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Build production bundle
RUN npm run build

# ============================================
# Stage 2: Production (Nginx)
# ============================================
FROM nginx:1.27-alpine AS production

# Add labels for container metadata
LABEL maintainer="cadena-team"
LABEL description="Cadena Employee Portal - Production"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
