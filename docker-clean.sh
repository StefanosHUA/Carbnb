#!/bin/bash

echo "========================================"
echo "Cleaning Carbnb Docker Environment"
echo "========================================"
echo ""
echo "WARNING: This will remove all containers, volumes, and images!"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Stopping all services..."
docker-compose -f docker-compose.dev.yml down -v
docker-compose down -v

echo ""
echo "Removing Docker images..."
docker-compose -f docker-compose.dev.yml down --rmi all
docker-compose down --rmi all

echo ""
echo "Cleaning Docker system..."
docker system prune -f

echo ""
echo "========================================"
echo "Docker environment cleaned."
echo "========================================"

