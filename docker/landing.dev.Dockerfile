FROM nginx:alpine

# Удаляем дефолтный конфиг и создаем наш
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/landing-dev.conf /etc/nginx/conf.d/

# Копируем статические файлы (в dev-mode они будут перезаписаны volume)
COPY apps/landing /usr/share/nginx/html

EXPOSE 80