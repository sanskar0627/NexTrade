dev:
	npm run dev

build:
	npm run build

start:
	npm run start

install:
	npm install

db-setup:
	npm run db:generate && npm run db:push && npm run db:seed

db-migrate:
	npm run db:migrate

db-deploy:
	npm run db:deploy

clean:
	rm -rf .next node_modules dist build
	npm install

test:
	npm run test

lint:
	npm run lint

type-check:
	npm run type-check

deploy-dev: clean install db-setup build

deploy-prod: install db-deploy build

.PHONY: dev build start install db-setup db-migrate db-deploy clean test lint type-check deploy-dev deploy-prod