# 🐳 Docker Setup Guide for Carbnb

This guide will help you run the entire Carbnb application (frontend + backend microservices) using Docker.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (included with Docker Desktop)
- At least **8GB RAM** allocated to Docker
- At least **20GB** free disk space

### Install Docker

#### Windows
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Start Docker Desktop
4. Verify: `docker --version` and `docker-compose --version`

#### Mac
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Start Docker Desktop
4. Verify: `docker --version` and `docker-compose --version`

#### Linux
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
```

## 🚀 Quick Start

### Development Mode (with Hot-Reload)

**Windows:**
```cmd
docker-start-dev.bat
```

**Mac/Linux:**
```bash
chmod +x docker-start-dev.sh
./docker-start-dev.sh
```

That's it! All services will start with:
- **Frontend**: http://localhost:3000 (with hot-reload)
- **API Gateway**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Production Mode

**Windows:**
```cmd
docker-start-prod.bat
```

**Mac/Linux:**
```bash
chmod +x docker-start-prod.sh
./docker-start-prod.sh
```

Access the application:
- **Frontend**: http://localhost
- **API Gateway**: http://localhost:8000

## 🛠️ What's Included?

The Docker setup includes all necessary services:

### Frontend
- **React Application** on port 3000 (dev) or 80 (prod)
- Hot-reload enabled in development mode
- Nginx serving in production mode

### Backend Microservices
- **Gateway API** - Port 8000 (API aggregator)
- **User Service** - Port 8001 (authentication, user management)
- **Car Service** - Port 8002 (vehicle management)
- **Booking Service** - Port 8003 (reservation management)
- **Search Service** - Port 8004 (search functionality)

### Infrastructure
- **PostgreSQL** - 3 separate databases (ports 5432, 5433, 5434)
- **Redis** - Port 6379 (caching, sessions)
- **Elasticsearch** - Port 9200 (search indexing)
- **RabbitMQ** - Ports 5672, 15672 (message queue)

## 📝 Available Commands

### Start Services

```bash
# Development mode (with hot-reload)
docker-start-dev.bat        # Windows
./docker-start-dev.sh       # Mac/Linux

# Production mode
docker-start-prod.bat       # Windows
./docker-start-prod.sh      # Mac/Linux
```

### Stop Services

```bash
docker-stop.bat             # Windows
./docker-stop.sh            # Mac/Linux
```

Or use Ctrl+C if running in foreground, then:
```bash
docker-compose -f docker-compose.dev.yml down  # Development
docker-compose down                             # Production
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f gateway
docker-compose -f docker-compose.dev.yml logs -f user-service
```

### Restart a Specific Service

```bash
# Restart frontend
docker-compose -f docker-compose.dev.yml restart frontend

# Restart gateway
docker-compose -f docker-compose.dev.yml restart gateway

# Rebuild and restart a service
docker-compose -f docker-compose.dev.yml up -d --build frontend
```

### Clean Everything

```bash
# WARNING: Removes all containers, volumes, and images
docker-clean.bat            # Windows
./docker-clean.sh           # Mac/Linux
```

Or manually:
```bash
# Stop and remove containers + volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose down -v

# Remove images
docker-compose -f docker-compose.dev.yml down --rmi all

# Clean Docker system
docker system prune -a
```

## 🔧 Making Code Changes

### Development Mode - Hot Reload Enabled! 🔥

In development mode, your code changes are automatically reflected:

**Frontend (React):**
- Edit files in `src/` or `public/`
- Changes are detected automatically
- Browser refreshes automatically
- No need to restart the container!

**Backend (Python):**
- Edit files in any service directory
- Uvicorn's `--reload` flag detects changes
- Service restarts automatically
- No need to restart the container!

### If Hot-Reload Doesn't Work

Sometimes Docker file watching needs help on Windows:

1. The `docker-compose.dev.yml` already includes:
   ```yaml
   environment:
     - WATCHPACK_POLLING=true
     - CHOKIDAR_USEPOLLING=true
   ```

2. If still not working, restart the specific service:
   ```bash
   docker-compose -f docker-compose.dev.yml restart frontend
   ```

### Adding New Dependencies

**Frontend (npm packages):**
```bash
# Add package to package.json, then:
docker-compose -f docker-compose.dev.yml down frontend
docker-compose -f docker-compose.dev.yml up -d --build frontend
```

**Backend (pip packages):**
```bash
# Add package to requirements.txt, then:
docker-compose -f docker-compose.dev.yml down user-service
docker-compose -f docker-compose.dev.yml up -d --build user-service
```

## 🗄️ Database Access

### Using pgAdmin or DBeaver

Connect to the databases:

**User Service Database:**
- Host: `localhost`
- Port: `5432`
- Database: `user_service_db`
- Username: `postgres`
- Password: `postgres`

**Car Service Database:**
- Host: `localhost`
- Port: `5433`
- Database: `car_service_db`
- Username: `postgres`
- Password: `postgres`

**Booking Service Database:**
- Host: `localhost`
- Port: `5434`
- Database: `booking_service_db`
- Username: `postgres`
- Password: `postgres`

### Run Database Migrations

```bash
# User service
docker-compose -f docker-compose.dev.yml exec user-service alembic upgrade head

# Car service
docker-compose -f docker-compose.dev.yml exec car-service alembic upgrade head

# Booking service
docker-compose -f docker-compose.dev.yml exec booking-service alembic upgrade head
```

### Database Shell Access

```bash
# User DB
docker-compose -f docker-compose.dev.yml exec user-db psql -U postgres -d user_service_db

# Car DB
docker-compose -f docker-compose.dev.yml exec car-db psql -U postgres -d car_service_db

# Booking DB
docker-compose -f docker-compose.dev.yml exec booking-db psql -U postgres -d booking_service_db
```

## 🔍 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

**Windows:**
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Containers Won't Start

1. Check Docker Desktop is running
2. Check available disk space
3. Check Docker logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs
   ```
4. Try cleaning and rebuilding:
   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Service Health Check Failing

Wait a bit longer - services have dependencies:
1. Databases start first (10-15 seconds)
2. Redis, Elasticsearch, RabbitMQ (15-30 seconds)
3. Backend services (30-45 seconds)
4. Frontend (45-60 seconds)

### Out of Memory

Increase Docker memory:
- **Docker Desktop**: Settings → Resources → Memory → 8GB or more

### Frontend Not Updating

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart frontend container:
   ```bash
   docker-compose -f docker-compose.dev.yml restart frontend
   ```
3. Rebuild if needed:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d --build frontend
   ```

### Backend Not Updating

The backend uses `--reload` flag, but if changes aren't detected:
```bash
docker-compose -f docker-compose.dev.yml restart <service-name>
```

## 🔐 Environment Variables

### Development

Environment variables are set in `docker-compose.dev.yml`. To customize:

1. Create `.env` file in root:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET_KEY=your-secret-key
   RABBITMQ_USER=admin
   RABBITMQ_PASSWORD=admin
   ```

2. Docker Compose will automatically use it

### Production

For production, create `.env.prod`:
```env
DB_USER=your_user
DB_PASSWORD=your_strong_password
JWT_SECRET_KEY=your-production-secret
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_strong_password
```

Then use:
```bash
docker-compose --env-file .env.prod up -d
```

## 🚢 Deployment

### Production Build

```bash
# Build for production
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Cloud Deployment

The setup is ready for deployment to:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Heroku Container Registry**

Simply push your images to a container registry and deploy!

## 📦 Separating Frontend & Backend (Future)

When you're ready to separate frontend and backend into different repositories:

### Backend Repository
1. Copy `newBackend/car-rental-backend-v2/` to new repo
2. Copy backend-related files:
   - `docker-compose.yml` (backend services only)
   - All `Dockerfile`s in service directories
   - `.dockerignore`
3. Remove frontend service from docker-compose

### Frontend Repository
1. Copy all files EXCEPT `newBackend/` to new repo
2. Keep:
   - `src/`, `public/`, `package.json`
   - Root `Dockerfile`, `nginx.conf`, `.dockerignore`
   - Create simplified `docker-compose.yml` for frontend only
3. Update `REACT_APP_API_URL` to point to backend URL

### Communication
Update the frontend's `.env`:
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

Both can run independently and communicate via HTTP!

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI in Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [React in Docker](https://create-react-app.dev/docs/deployment/)

## 🆘 Need Help?

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.dev.yml logs`
2. Try cleaning: `docker-clean.bat` or `./docker-clean.sh`
3. Ensure Docker has enough resources (8GB RAM, 20GB disk)
4. Check if ports are already in use

---

**Happy Coding! 🚗✨**

