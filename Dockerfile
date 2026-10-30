# ==========================================
# Frontend Multi-Stage Dockerfile (Practical 11)
# ==========================================

# ------------------------------------------
# Stage 1: Build React + Vite Application
# ------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests for efficient layer caching
COPY package*.json ./

# Install dependencies needed for build
RUN npm install

# Copy frontend source files
COPY . .

# Build Vite application with production API URL configuration
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ------------------------------------------
# Stage 2: Serve with Nginx Alpine
# ------------------------------------------
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback and healthcheck
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Nginx container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
