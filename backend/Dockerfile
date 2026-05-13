# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Final stage
FROM node:18-alpine

WORKDIR /app

# Install ffmpeg for video processing
RUN apk add --no-cache ffmpeg

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application
COPY . .

# Create necessary directories
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start command
CMD ["node", "src/server.js"]
