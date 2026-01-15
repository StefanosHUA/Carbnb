# Microservices Integration Guide

## Backend Microservices Structure

Based on the backend repository `https://github.com/Moirotsos/car-rental-backend-v2`, the backend is organized as microservices.

### How to Identify Microservices

1. **Check the backend repository structure:**
   ```bash
   cd e:\car-rental-backend-v2
   dir /b
   ```

2. **Look for:**
   - Separate directories for each service
   - `docker-compose.yml` file (if using Docker)
   - Individual `package.json` files in each service directory
   - Service-specific configuration files

3. **Common microservices in car rental systems:**
   - **User Service** - Authentication, user management
   - **Vehicle Service** - Car listings, vehicle management
   - **Booking Service** - Reservations, booking management
   - **Payment Service** - Payment processing
   - **Media Service** - File uploads, image storage
   - **Notification Service** - Email/SMS notifications

## Frontend API Service Configuration

The frontend API service (`src/utils/api.js`) is configured to work with a single API gateway that routes to microservices:

- **Base URL**: `http://localhost:3001` (configurable via `REACT_APP_API_URL`)
- **API Gateway**: Routes `/api/v1/*` requests to appropriate microservices

## Current API Endpoints

All endpoints are prefixed with `/api/v1/`:

- **Users**: `/api/v1/users`, `/api/v1/users/profile`
- **Vehicles**: `/api/v1/vehicles`
- **Bookings**: `/api/v1/bookings`
- **Payments**: `/api/v1/payments`
- **Uploads**: `/api/v1/upload`
- **Sales**: `/api/v1/sales`

## If Microservices Use Different Ports

If each microservice runs on a different port, update `src/utils/api.js`:

```javascript
const MICROSERVICES = {
  users: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001',
  vehicles: process.env.REACT_APP_VEHICLE_SERVICE_URL || 'http://localhost:3002',
  bookings: process.env.REACT_APP_BOOKING_SERVICE_URL || 'http://localhost:3003',
  payments: process.env.REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:3004',
  // ... etc
};
```

## Verifying Microservices

1. **Check if backend is running:**
   ```bash
   netstat -ano | findstr ":3001"
   ```

2. **Test API endpoints:**
   ```bash
   curl http://localhost:3001/api/v1/vehicles
   ```

3. **Check backend logs** in the "BACKEND - API Server" window

## Next Steps

1. Examine the backend repository structure to identify exact microservices
2. Update API service if microservices use different base URLs
3. Configure CORS for each microservice
4. Test each endpoint individually
