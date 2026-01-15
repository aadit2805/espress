.PHONY: dev dev-client dev-server install install-client install-server build clean

dev:
	@echo "Starting frontend and backend..."
	@trap 'kill 0' INT TERM; \
	cd client && npm run dev & \
	cd server && npm run dev & \
	wait

dev-client:
	cd client && npm run dev

dev-server:
	cd server && npm run dev

install:
	cd client && npm install
	cd server && npm install

install-client:
	cd client && npm install

install-server:
	cd server && npm install

build:
	cd client && npm run build
	cd server && npm run build

clean:
	rm -rf client/node_modules server/node_modules
	rm -rf client/.next server/dist
