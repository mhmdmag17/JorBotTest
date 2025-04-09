# Build stage
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript code
RUN yarn build

# Production stage
FROM node:20-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install production dependencies only
RUN yarn 

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Copy .env file
COPY .env ./

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port (adjust if needed based on your .env)
EXPOSE 5777

# Start the application
CMD ["node", "build/index.js"]
