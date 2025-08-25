# Stage 1: Builder
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

# 6. Собираем проект
WORKDIR /usr/src/app/apps/backend
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# 1. Копируем собранный проект
COPY --from=builder /usr/src/app/apps/backend/dist ./dist

# 2. Копируем production зависимости
COPY --from=builder /usr/src/app/apps/backend/package*.json ./
RUN npm install --production

# 3. Копируем shared модуль (уже с установленными зависимостями)
COPY --from=builder /usr/src/app/shared ./shared

EXPOSE 8000
CMD ["node", "dist/main.js"]