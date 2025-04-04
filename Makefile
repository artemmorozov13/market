include .env
export

.PHONY: prod dev down restart logs clean \
        migration-run migration-generate migration-create migration-revert migration-show

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
	@echo "Starting development services..."
	docker-compose -f docker-compose.dev.yml up --build

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

# Migration commands to run inside container
migration-run:
	@echo "Running migrations..."
	docker-compose exec backend npm run migration:run

migration-generate:
ifndef name
	$(error Please specify migration name with make migration-generate name=YourMigrationName)
endif
	@echo "Generating migration '$(name)'..."
	docker-compose exec backend npm run migration:generate --name=$(name)

migration-create:
ifndef name
	$(error Please specify migration name with make migration-create name=YourMigrationName)
endif
	@echo "Creating new migration '$(name)'..."
	docker-compose exec backend npm run migration:create --name=$(name)

migration-revert:
	@echo "Reverting last migration..."
	docker-compose exec backend npm run migration:revert

migration-show:
	@echo "Showing all migrations..."
	docker-compose exec backend npm run migration:show