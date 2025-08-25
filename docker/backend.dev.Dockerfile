# Stage 1: Builder for development
FROM node:20-alpine as builder
WORKDIR /usr/src/app

# 1. Установка Nest CLI
RUN npm install -g @nestjs/cli

# 2. Копируем package.json файлы для кэширования
COPY shared/package*.json ./shared/
COPY apps/backend/package*.json ./apps/backend/

# 3. Устанавливаем зависимости для shared модуля
WORKDIR /usr/src/app/shared
RUN npm install

# 4. Устанавливаем зависимости для backend
WORKDIR /usr/src/app/apps/backend
RUN npm install

# 5. Копируем все остальные файлы
WORKDIR /usr/src/app
COPY . .

# Stage 2: Development
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=development

# 1. Копируем зависимости backend
COPY --from=builder /usr/src/app/apps/backend/package*.json ./
COPY --from=builder /usr/src/app/apps/backend/node_modules ./node_modules

# 2. Копируем shared модуль в КОРЕНЬ (/shared) вместо /app/shared
COPY --from=builder /usr/src/app/shared /shared
COPY --from=builder /usr/src/app/shared/node_modules /shared/node_modules

# 3. Утилиты и скрипты
RUN apk add --no-cache bash
COPY docker/scripts/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# 4. Копируем исходный код backend
COPY --from=builder /usr/src/app/apps/backend .

# 5. Глобальные утилиты
RUN npm install -g @nestjs/cli

EXPOSE 9000
CMD ["/wait-for-it.sh", "postgres:5432", "--", "npm", "run", "start:dev"]