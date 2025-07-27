include .env
export

.PHONY: prod dev down restart logs clean \
        migration-run migration-generate migration-create migration-revert migration-show

prod:
	@echo "Building and starting production environment..."
	docker-compose -f docker-compose/docker-compose.prod.yml build --no-cache --pull
	docker-compose -f docker-compose/docker-compose.prod.yml up -d
	@echo "Production environment is ready!"

dev:
	@echo "Starting development services..."
	docker-compose -f docker-compose/docker-compose.dev.yml -p market_place up --build

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
	docker-compose -f docker-compose/docker-compose.prod.yml down --rmi all --volumes --remove-orphans
	docker system prune -a --volumes --force
	sudo rm -rf /var/lib/docker/overlay2/*
	sudo systemctl restart docker

# Migration commands
migration-run:
	@echo "Running migrations..."
	docker-compose exec backend sh -c "cd /app && npm run migration:run"

migration-generate:
ifndef name
	$(error Please specify migration name with make migration-generate name=YourMigrationName)
endif
	@echo "Generating migration '$(name)'..."
	docker-compose exec backend sh -c "cd /app && npm run migration:generate --name=$(name)"

migration-create:
ifndef name
	$(error Please specify migration name with make migration-create name=YourMigrationName)
endif
	@echo "Creating empty migration '$(name)'..."
	docker-compose exec backend sh -c "cd /app && npm run migration:create --name=$(name)"

migration-revert:
	@echo "Reverting last migration..."
	docker-compose exec backend sh -c "cd /app && npm run migration:revert"

migration-show:
	@echo "Showing migrations status..."
	docker-compose exec backend sh -c "cd /app && npm run migration:show"

seed:
	@echo "Running seeders through Docker..."
	docker-compose -f docker-compose/docker-compose.dev.yml -p market_place exec backend sh -c "cd /app && npm run seed"