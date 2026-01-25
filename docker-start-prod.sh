#!/bin/bash

echo "========================================"
echo "Starting Carbnb Production Environment"
echo "========================================"
echo ""

echo "Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker first."
    exit 1
fi

echo "Docker is running. Starting services..."
echo ""

echo "Building and starting all services..."
docker-compose up --build -d

echo ""
echo "========================================"
echo "All services started in background."
echo "========================================"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost"
echo "  API Gateway: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop all services: docker-compose down"
echo ""

