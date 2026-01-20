.PHONY: help build serve clean deploy check

# Default target
help:
	@echo "Available targets:"
	@echo "  make build     - Build the site for production"
	@echo "  make serve     - Start Hugo development server"
	@echo "  make clean     - Clean generated files"
	@echo "  make check     - Check for Hugo/template issues"
	@echo "  make deploy    - Build and prepare for deployment"

# Build the site
build:
	@echo "Building site..."
	hugo --minify

# Start development server
serve:
	@echo "Starting Hugo server on http://localhost:1313"
	hugo server --bind 0.0.0.0 --port 1313 --noHTTPCache -D

# Clean generated files
clean:
	@echo "Cleaning generated files..."
	rm -rf public resources

# Check for errors
check:
	@echo "Checking for errors..."
	hugo --templateMetrics --templateMetricsHints

# Build for deployment
deploy: clean build
	@echo "Site built and ready for deployment"
	@echo "Output directory: public/"

