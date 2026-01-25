#!/bin/bash

echo "========================================"
echo "Starting Carbnb Development Environment"
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
docker-compose -f docker-compose.dev.yml up --build

echo ""
echo "========================================"
echo "All services stopped."
echo "========================================"

