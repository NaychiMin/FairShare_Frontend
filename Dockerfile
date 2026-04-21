# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install native Alpine Linux (musl) optional dependencies
RUN npm install @rollup/rollup-linux-x64-musl lightningcss-linux-x64-musl @tailwindcss/oxide-linux-x64-musl --no-save

# Copy the rest of the application
COPY . .

# Build Vite app
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM nginx:alpine3.20

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure that index.html is never cached and static assets are cached aggressively
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]