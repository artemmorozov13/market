FROM node:20-alpine as dev
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Устанавливаем bash
RUN apk add --no-cache bash

COPY . .
COPY scripts/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

CMD ["/wait-for-it.sh", "postgres:5432", "--", "npm", "run", "start:dev"]
EXPOSE 3000

FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine as prod
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 80
CMD ["node", "dist/src/main.js"]