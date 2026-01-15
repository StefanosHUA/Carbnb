# 🔧 Fix: Backend Not Responding

## Problem
The backend is listening on port 8002 but immediately closes connections. This means the backend process is crashing when handling requests.

## ✅ Solution - Restart Backend Properly

### Step 1: Kill All Backend Processes

Run this from the project root:
```cmd
kill-backend-processes.bat
```

Or manually:
```cmd
netstat -ano | findstr :8002
taskkill /F /PID <each_process_id>
```

### Step 2: Verify Port is Free

```cmd
netstat -ano | findstr :8002
```

Should show nothing (or only TIME_WAIT connections that will clear).

### Step 3: Start Backend Fresh

**Option A: Using the startup script (Easiest)**
```cmd
cd newBackend\car-rental-backend-v2\user_service
start-user-service.bat
```

**Option B: Using Docker Compose**
```cmd
cd newBackend\car-rental-backend-v2\user_service
docker-compose up
```

**Option C: Manual start (for debugging)**
```cmd
cd newBackend\car-rental-backend-v2\user_service
venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload --log-level debug
```

### Step 4: Test Backend

1. **Open browser:** http://localhost:8002/health
   - Should return JSON: `{"status":"healthy",...}`

2. **Check console output** for any errors

3. **Try frontend again** - login/register should work now

## 🔍 If Still Not Working

### Check Database Connection

The backend might be crashing because it can't connect to the database:

```cmd
cd newBackend\car-rental-backend-v2\user_service
python -c "from app.core.database import engine; engine.connect(); print('Database OK')"
```

If this fails, check:
- PostgreSQL is running
- `.env` file has correct `DATABASE_URL`
- Database credentials are correct

### Check .env File

Make sure `newBackend/car-rental-backend-v2/user_service/.env` exists with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/carrental
SECRET_KEY=your-32-character-secret-key-minimum-length-required
DEBUG=true
```

### View Backend Logs

When starting manually, watch the console for errors. Common issues:
- Database connection errors
- Missing environment variables
- Import errors

## 🎯 Quick Test

Once backend is running, test with:
```cmd
curl http://localhost:8002/health
```

Or open in browser: http://localhost:8002/health

If this works, the frontend should now be able to connect!

