# 🐳 Docker Commands Cheat Sheet

Quick reference for managing your Dockerized Carbnb application.

## 🚀 Starting Services

### Start All Services (Development)
```bash
# Windows
docker-start-dev.bat

# Mac/Linux
./docker-start-dev.sh

# Or manually
docker-compose -f docker-compose.dev.yml up
```

### Start All Services (Production)
```bash
# Windows
docker-start-prod.bat

# Mac/Linux
./docker-start-prod.sh

# Or manually
docker-compose up -d
```

### Start Specific Service
```bash
docker-compose -f docker-compose.dev.yml up frontend
docker-compose -f docker-compose.dev.yml up gateway
docker-compose -f docker-compose.dev.yml up user-service
```

## 🛑 Stopping Services

### Stop All Services
```bash
# Windows
docker-stop.bat

# Mac/Linux
./docker-stop.sh

# Or manually
docker-compose -f docker-compose.dev.yml down
```

### Stop Specific Service
```bash
docker-compose -f docker-compose.dev.yml stop frontend
docker-compose -f docker-compose.dev.yml stop gateway
```

## 🔄 Restarting Services

### Restart All Services
```bash
docker-compose -f docker-compose.dev.yml restart
```

### Restart Specific Service
```bash
docker-compose -f docker-compose.dev.yml restart frontend
docker-compose -f docker-compose.dev.yml restart gateway
docker-compose -f docker-compose.dev.yml restart user-service
docker-compose -f docker-compose.dev.yml restart car-service
docker-compose -f docker-compose.dev.yml restart booking-service
docker-compose -f docker-compose.dev.yml restart search-service
```

## 🔨 Building and Rebuilding

### Build All Services
```bash
docker-compose -f docker-compose.dev.yml build
```

### Build Specific Service
```bash
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml build gateway
```

### Rebuild and Start
```bash
# All services
docker-compose -f docker-compose.dev.yml up --build

# Specific service
docker-compose -f docker-compose.dev.yml up -d --build frontend
```

### Force Rebuild (No Cache)
```bash
docker-compose -f docker-compose.dev.yml build --no-cache frontend
docker-compose -f docker-compose.dev.yml up -d --build --force-recreate frontend
```

## 📊 Viewing Logs

### View All Logs (Follow Mode)
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### View Specific Service Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f gateway
docker-compose -f docker-compose.dev.yml logs -f user-service
```

### View Last N Lines
```bash
docker-compose -f docker-compose.dev.yml logs --tail=100 frontend
```

### View Logs Since Timestamp
```bash
docker-compose -f docker-compose.dev.yml logs --since="2024-01-01T00:00:00"
```

## 🔍 Inspecting Services

### List Running Containers
```bash
docker-compose -f docker-compose.dev.yml ps
```

### View Service Status
```bash
docker ps
docker ps -a  # Include stopped containers
```

### Inspect Container
```bash
docker inspect carbnb-frontend
docker inspect carbnb-gateway
```

### View Resource Usage
```bash
docker stats
docker stats carbnb-frontend
```

## 💻 Executing Commands in Containers

### Access Container Shell
```bash
# Frontend (Node.js/Alpine)
docker-compose -f docker-compose.dev.yml exec frontend sh

# Backend services (Python)
docker-compose -f docker-compose.dev.yml exec gateway sh
docker-compose -f docker-compose.dev.yml exec user-service sh
```

### Run Single Command
```bash
# Check Node version
docker-compose -f docker-compose.dev.yml exec frontend node --version

# Check Python version
docker-compose -f docker-compose.dev.yml exec gateway python --version

# Install npm package
docker-compose -f docker-compose.dev.yml exec frontend npm install <package-name>
```

## 🗄️ Database Commands

### Access PostgreSQL Shell
```bash
# User DB
docker-compose -f docker-compose.dev.yml exec user-db psql -U postgres -d user_service_db

# Car DB
docker-compose -f docker-compose.dev.yml exec car-db psql -U postgres -d car_service_db

# Booking DB
docker-compose -f docker-compose.dev.yml exec booking-db psql -U postgres -d booking_service_db
```

### Run Database Migrations
```bash
# User service
docker-compose -f docker-compose.dev.yml exec user-service alembic upgrade head

# Car service
docker-compose -f docker-compose.dev.yml exec car-service alembic upgrade head

# Booking service
docker-compose -f docker-compose.dev.yml exec booking-service alembic upgrade head
```

### Create Database Backup
```bash
# User DB
docker-compose -f docker-compose.dev.yml exec user-db pg_dump -U postgres user_service_db > user_db_backup.sql

# Car DB
docker-compose -f docker-compose.dev.yml exec car-db pg_dump -U postgres car_service_db > car_db_backup.sql
```

### Restore Database Backup
```bash
# User DB
docker-compose -f docker-compose.dev.yml exec -T user-db psql -U postgres user_service_db < user_db_backup.sql
```

## 🔍 Redis Commands

### Access Redis CLI
```bash
docker-compose -f docker-compose.dev.yml exec redis redis-cli
```

### Common Redis Commands (inside redis-cli)
```bash
# List all keys
KEYS *

# Get value
GET key_name

# Delete key
DEL key_name

# Flush all
FLUSHALL
```

## 🔎 Elasticsearch Commands

### Check Elasticsearch Health
```bash
curl http://localhost:9200/_cluster/health?pretty
```

### View Indices
```bash
curl http://localhost:9200/_cat/indices?v
```

### Access Elasticsearch Container
```bash
docker-compose -f docker-compose.dev.yml exec elasticsearch sh
```

## 🐰 RabbitMQ Commands

### Access Management UI
Open: http://localhost:15672
- Username: admin
- Password: admin

### Access RabbitMQ Container
```bash
docker-compose -f docker-compose.dev.yml exec rabbitmq sh
```

## 🧹 Cleaning Up

### Remove All Containers and Networks
```bash
docker-compose -f docker-compose.dev.yml down
```

### Remove Containers, Networks, and Volumes
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Remove Everything Including Images
```bash
# Windows
docker-clean.bat

# Mac/Linux
./docker-clean.sh

# Or manually
docker-compose -f docker-compose.dev.yml down -v --rmi all
docker system prune -a
```

### Remove Specific Volume
```bash
docker volume rm carbnb_user_db_data
docker volume rm carbnb_redis_data
```

### Remove All Unused Docker Resources
```bash
docker system prune -a --volumes
```

## 🔧 Debugging

### View Container Resource Usage
```bash
docker stats
```

### View Container Processes
```bash
docker-compose -f docker-compose.dev.yml top
```

### View Docker Events (Real-time)
```bash
docker events
```

### Export Container Filesystem
```bash
docker export carbnb-frontend > frontend.tar
```

### Copy Files from Container
```bash
# Copy from container to host
docker cp carbnb-frontend:/app/package.json ./package.json

# Copy from host to container
docker cp ./myfile.txt carbnb-frontend:/app/
```

## 📦 Image Management

### List Images
```bash
docker images
```

### Remove Image
```bash
docker rmi carbnb-frontend
docker rmi carbnb-gateway
```

### Pull Latest Base Images
```bash
docker pull node:18-alpine
docker pull python:3.10-slim
docker pull postgres:15-alpine
docker pull redis:7-alpine
```

### Save Image to File
```bash
docker save carbnb-frontend > frontend-image.tar
```

### Load Image from File
```bash
docker load < frontend-image.tar
```

## 🌐 Network Management

### List Networks
```bash
docker network ls
```

### Inspect Network
```bash
docker network inspect carbnb_carbnb-network
```

### Remove Network
```bash
docker network rm carbnb_carbnb-network
```

## 💾 Volume Management

### List Volumes
```bash
docker volume ls
```

### Inspect Volume
```bash
docker volume inspect carbnb_user_db_data
```

### Remove Volume
```bash
docker volume rm carbnb_user_db_data
```

### Backup Volume
```bash
docker run --rm -v carbnb_user_db_data:/data -v $(pwd):/backup alpine tar czf /backup/user_db_backup.tar.gz /data
```

## 🔐 Security

### Scan Image for Vulnerabilities
```bash
docker scan carbnb-frontend
docker scan carbnb-gateway
```

### View Image History
```bash
docker history carbnb-frontend
```

## 📈 Performance

### View Container Stats
```bash
docker stats --all --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Limit Container Resources
Add to docker-compose.yml:
```yaml
services:
  frontend:
    ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## 🆘 Quick Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs <service-name>

# Rebuild
docker-compose -f docker-compose.dev.yml up -d --build <service-name>
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :<port>
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:<port> | xargs kill -9
```

### Out of Disk Space
```bash
docker system df  # Check space usage
docker system prune -a --volumes  # Clean everything
```

### Service Health Check Failing
```bash
# Wait longer - services need time to start
# Check logs
docker-compose -f docker-compose.dev.yml logs <service-name>
```

---

**For more detailed information, see [DOCKER.md](DOCKER.md)**

