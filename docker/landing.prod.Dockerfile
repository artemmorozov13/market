FROM nginx:alpine

# Удаляем дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем статические файлы лендинга
COPY apps/landing /usr/share/nginx/html

# Копируем наш конфиг для лендинга
COPY nginx/landing.conf /etc/nginx/conf.d/

EXPOSE 80