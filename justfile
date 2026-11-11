# keymap-editor task runner -- `just <recipe>` (run `just` for the list)

set dotenv-load

# show all recipes
default:
    @just --list

# Create .env if absent.
setup:
    test -e .env || cp .env.template .env

# Install the API and app dependencies.
install:
    npm install

# Development: the API plus the React dev server (open http://localhost:3000).
dev: setup
    npm run dev

# Build the React app into app/build.
[working-directory: 'app']
build:
    npm run build

# Run the API and the built app (http://localhost:8080) without Docker.
start: setup build
    npm start

# --- docker compose ---

# Build and start the container in the background.
up: setup
    docker compose up -d --build

# Stop the container.
down:
    docker compose down

# Follow logs.
logs:
    docker compose logs -f

ps:
    docker compose ps
