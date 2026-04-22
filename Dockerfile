# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN npm install @rollup/rollup-linux-x64-musl lightningcss-linux-x64-musl @tailwindcss/oxide-linux-x64-musl --no-save

COPY . .
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM nginx:alpine3.21

RUN apk update && apk upgrade --no-cache

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]