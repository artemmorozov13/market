FROM node:20-alpine
WORKDIR /app

COPY apps/app/package*.json ./
RUN npm install

# Для доступа к shared файлам
COPY shared /shared
COPY apps/app/. .

EXPOSE 3002
CMD ["npm", "run", "dev"]