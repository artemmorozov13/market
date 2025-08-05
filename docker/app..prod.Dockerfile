# Этап сборки
FROM node:20-alpine as builder
WORKDIR /usr/src/app

# 1. Копируем package.json и package-lock.json
COPY package*.json ./
COPY apps/app/package*.json ./apps/app/
COPY apps/app/package-lock.json ./apps/app/
COPY shared/package*.json ./shared/

# 2. Устанавливаем зависимости
WORKDIR /usr/src/app/apps/app
RUN npm install

# 3. Копируем все остальные файлы
WORKDIR /usr/src/app
COPY . .

# 4. Собираем приложение
WORKDIR /usr/src/app/apps/app
RUN npm run build

# Финальный образ
FROM nginx:alpine
COPY --from=builder /usr/src/app/apps/app/dist /usr/share/nginx/html
COPY apps/app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]