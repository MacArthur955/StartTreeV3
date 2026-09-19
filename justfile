# Show available commands.
default:
    @just --list

# Check TypeScript types without writing files.
style:
    ./node_modules/.bin/tsc --noEmit

# Check types and build the static site in dist/.
build: style
    rm -rf dist
    mkdir -p dist
    cp index.html dist/index.html
    cp -R html styles themes dist/
    ./node_modules/.bin/tsc
    mkdir -p dist/js/views/tree
    cp js/views/tree/exampleConfig.json dist/js/views/tree/exampleConfig.json
    touch dist/.nojekyll

# Build and serve the site at http://localhost:8000/.
run: build
    python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
