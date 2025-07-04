FROM node:20-alpine
WORKDIR /app

COPY apps/admin/package*.json ./
RUN npm install

# Для доступа к shared файлам
COPY shared /shared
COPY apps/admin/. .

EXPOSE 3001
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]