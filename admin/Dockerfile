# Этап сборки
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Финальный образ
FROM nginx:alpine

# Копируем статику
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Проверяем что index.html на месте
RUN ls -la /usr/share/nginx/html

EXPOSE 80