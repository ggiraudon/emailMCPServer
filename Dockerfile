# Stage 1: Builder
FROM node:22.19-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Production
FROM node:22.19-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose the port your application listens on
EXPOSE 8080

# Define the command to run your application
CMD [ "node", "dist/index.js" ]