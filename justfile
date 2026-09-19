# Show available commands.
default:
    @just --list

# Check TypeScript types without writing files.
style:
    @./node_modules/.bin/tsc --noEmit

# Check types and build the static site in dist/.
build: style
    @rm -rf dist
    @mkdir -p dist
    @cp app/index.html dist/index.html
    @cp -R app/pages app/styles app/themes dist/
    @./node_modules/.bin/tsc
    @mkdir -p dist/src/views/tree
    @cp app/src/views/tree/exampleConfig.json dist/src/views/tree/exampleConfig.json
    @touch dist/.nojekyll

# Build and serve the site at http://localhost:8000/.
run: build
    @node scripts/serve.mjs
