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

# Run the editor with auto-restart on changes (http://localhost:${PORT:-4710}).
dev: setup
    npm run dev

# Run the editor (http://localhost:${PORT:-4710}).
start: setup
    npm start

# Run the tests.
test:
    npm test

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
