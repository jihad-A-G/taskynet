# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S taskynet -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm ci --include=dev
COPY . .
RUN chown -R taskynet:nodejs /app
USER taskynet
EXPOSE 8080
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
ENV NODE_ENV=production
RUN npm ci --include=dev && npm cache clean --force
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S taskynet -u 1001

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Copy production node_modules from build stage
COPY --from=build --chown=taskynet:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=taskynet:nodejs /app/dist ./dist

# Copy package.json for metadata
COPY --from=build --chown=taskynet:nodejs /app/package.json ./

# Switch to non-root user
USER taskynet

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]
