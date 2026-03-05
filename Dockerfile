# ============================================================
# Dockerfile: Custom Playwright Test Runner
# ============================================================
# Build a self-contained Docker image for running Playwright tests.
# Usage:
#   docker build -t playwright-session08 .
#   docker run --rm --init --ipc=host playwright-session08
# ============================================================

FROM node:20-bookworm

# Install Playwright browsers and OS dependencies
RUN npx -y playwright@1.49.0 install --with-deps

# Set working directory
WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy all project files
COPY . .

# Default command: run all tests
CMD ["npx", "playwright", "test"]
