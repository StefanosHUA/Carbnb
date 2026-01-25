# ⚡ Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Step 1: Install Docker
- **Windows/Mac**: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Run `curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh`

### Step 2: Start Everything

**Windows:**
```cmd
docker-start-dev.bat
```

**Mac/Linux:**
```bash
chmod +x docker-start-dev.sh
./docker-start-dev.sh
```

### Step 3: Access Your App

Wait 1-2 minutes for all services to start, then open:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

That's it! 🎉

## 🛠️ Common Commands

### Stop Everything
```bash
# Windows
docker-stop.bat

# Mac/Linux
./docker-stop.sh
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Restart a Service
```bash
docker-compose -f docker-compose.dev.yml restart frontend
docker-compose -f docker-compose.dev.yml restart gateway
```

### Clean Everything (Fresh Start)
```bash
# Windows
docker-clean.bat

# Mac/Linux
./docker-clean.sh
```

## 💡 Hot-Reload is Enabled!

Make changes to your code and they'll automatically reload:
- **Frontend (React)**: Edit files in `src/` → Browser auto-refreshes
- **Backend (Python)**: Edit service files → Service auto-restarts

No need to restart containers! 🔥

## 🐛 Troubleshooting

### Port Already in Use?
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux - Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Services Won't Start?
1. Ensure Docker Desktop is running
2. Check you have 8GB RAM allocated to Docker
3. Try cleaning: `docker-clean.bat` or `./docker-clean.sh`

### Changes Not Appearing?
```bash
# Restart the specific service
docker-compose -f docker-compose.dev.yml restart frontend
```

## 📚 More Details

For comprehensive documentation, see:
- [DOCKER.md](DOCKER.md) - Complete Docker guide
- [README.md](README.md) - Project overview

---

**Need Help?** Check the logs: `docker-compose -f docker-compose.dev.yml logs`

