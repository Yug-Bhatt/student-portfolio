# ==========================================
# Backend Dockerfile (Practical 11)
# Node.js 18 Alpine runtime
# ==========================================
FROM node:22-alpine

# Set container working directory
WORKDIR /app

# Optimize layer caching: copy package manifests first
COPY package*.json ./

# Install production dependencies only in final image
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set environment defaults (overridden by compose/env at runtime)
ENV PORT=5000 \
    NODE_ENV=production

# Expose backend API port
EXPOSE 5000

# Container healthcheck using /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 5000) + '/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start Express server
CMD ["node", "server.js"]
