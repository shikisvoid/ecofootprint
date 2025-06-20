#!/bin/bash

# Local Docker Setup Script for Eco Footprint App
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Setting up local Docker environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from example..."
    cp .env.production.example .env
    print_warning "Please edit .env file with your actual configuration values."
fi

# Build the Docker image
print_status "Building Docker image..."
docker build -t eco-footprint-app:local .

print_success "Docker image built successfully!"

# Run with docker-compose
print_status "Starting application with Docker Compose..."
docker-compose up -d

print_success "Application is running!"
print_status "Access your app at: http://localhost:8080"

# Show logs
print_status "Showing application logs (Ctrl+C to exit):"
docker-compose logs -f eco-footprint-app
