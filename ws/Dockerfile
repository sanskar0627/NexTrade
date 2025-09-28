# WebSocket Service for NexTrade
# This directory contains the WebSocket service for real-time trading data

FROM node:18-alpine

WORKDIR /app

# Copy package files (will be created in future iterations)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Expose WebSocket port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start WebSocket server
CMD ["npm", "start"]