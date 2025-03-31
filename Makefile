include .env
export

.PHONY: prod dev down restart logs clean

prod:
	@echo "Building production images..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
	@echo "Starting production services..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "Production environment is ready!"
	@echo "Admin:    http://localhost/admin"
	@echo "App:      http://localhost/app"
	@echo "API:      http://localhost/api"

dev:
	@echo "Building development images..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
	@echo "Starting development services..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

down:
	@echo "Stopping services..."
	docker-compose down

restart:
	@echo "Restarting services..."
	docker-compose restart
	@echo "Services restarted"

logs:
	docker-compose logs -f

clean:
	@echo "Cleaning up..."
	docker-compose down -v --rmi all --remove-orphans