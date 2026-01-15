# 🔧 Fix: Car Service Not Responding

## Problem
The frontend is trying to fetch cars from the car service but no calls are being made to the backend.

## ✅ Solution - Start Car Service Backend

### Step 1: Kill Any Existing Processes on Port 3003

```cmd
netstat -ano | findstr :3003
taskkill /F /PID <process_id>
```

### Step 2: Start Car Service

**Option A: Using the startup script (Easiest)**
```cmd
cd newBackend\car-rental-backend-v2\car_service
start-car-service.bat
```

**Option B: Using Docker Compose**
```cmd
cd newBackend\car-rental-backend-v2\car_service
docker-compose up
```

**Option C: Manual start (for debugging)**
```cmd
cd newBackend\car-rental-backend-v2\car_service
venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 3003 --reload --log-level debug
```

### Step 3: Verify Car Service is Running

1. **Open browser:** http://localhost:3003/health
   - Should return JSON: `{"status":"healthy",...}`

2. **Check API docs:** http://localhost:3003/docs

3. **Test vehicles endpoint:** http://localhost:3003/api/v1/vehicles

### Step 4: Test Frontend

1. Navigate to `/cars` in the frontend
2. Check browser console for `[API]` logs
3. Should see requests to `http://localhost:3003/api/v1/vehicles`

## 🔍 Configuration

### Frontend Configuration
The frontend is configured to use:
- `REACT_APP_VEHICLE_SERVICE_URL=http://localhost:3003` (default in `src/utils/api.js`)

### Backend Port
- Car service runs on port **3003** (matching frontend expectation)
- Docker maps: `3003:8000` (host:container)

### CORS Configuration
- Backend allows `http://localhost:3000` (React dev server)
- In DEBUG mode, allows all origins

## 🐛 Troubleshooting

### "Cannot connect to car service" error

1. **Verify car service is running:**
   - Open http://localhost:3003/health
   - Should return JSON response

2. **Check port 3003 is free:**
   ```cmd
   netstat -ano | findstr :3003
   ```

3. **Check browser console:**
   - Look for `[API]` logs showing the request
   - Check for CORS errors

### Database Connection Errors

The car service needs:
- PostgreSQL database running
- `.env` file with `DATABASE_URL`
- Database tables created (via Alembic migrations)

### S3/MinIO Errors

The car service may fail if S3/MinIO is not accessible, but it should still start and handle basic requests.

## 📝 Quick Test

Once car service is running:
```cmd
curl http://localhost:3003/health
curl http://localhost:3003/api/v1/vehicles
```

If these work, the frontend should now be able to fetch cars!

