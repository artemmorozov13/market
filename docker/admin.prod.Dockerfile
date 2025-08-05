# Этап сборки
FROM node:20-alpine as builder
WORKDIR /usr/src/app

# 1. Копируем package.json и package-lock.json
COPY package*.json ./
COPY apps/admin/package*.json ./apps/admin/
COPY apps/admin/package-lock.json ./apps/admin/
COPY shared/package*.json ./shared/

# 2. Устанавливаем зависимости
WORKDIR /usr/src/app/apps/admin
RUN npm install

# 3. Копируем все остальные файлы
WORKDIR /usr/src/app
COPY . .

# 4. Собираем приложение
WORKDIR /usr/src/app/apps/admin
RUN npm run build

# Финальный образ
FROM nginx:alpine
COPY --from=builder /usr/src/app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]