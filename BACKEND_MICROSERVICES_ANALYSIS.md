# Backend Microservices Analysis

## Repository
https://github.com/Moirotsos/car-rental-backend-v2

## How to Identify Microservices

### Method 1: Check Directory Structure
```bash
cd e:\car-rental-backend-v2
dir /b
```

Look for directories like:
- `user-service` or `users`
- `vehicle-service` or `vehicles`
- `booking-service` or `bookings`
- `payment-service` or `payments`
- `media-service` or `upload`
- `api-gateway` or `gateway`

### Method 2: Check for Docker Compose
```bash
cd e:\car-rental-backend-v2
type docker-compose.yml
```

Docker Compose files typically list all microservices with their ports and configurations.

### Method 3: Check for Multiple package.json Files
```bash
cd e:\car-rental-backend-v2
dir /b /s package.json
```

Each microservice typically has its own `package.json` file.

### Method 4: Check README
```bash
cd e:\car-rental-backend-v2
type README.md
```

The README usually documents the microservices architecture.

## Expected Microservices

Based on the API endpoints used in the frontend:

1. **User Service** (`/api/v1/users`)
   - Port: Likely 3001 or separate port
   - Endpoints:
     - `POST /api/v1/users` - Register
     - `GET /api/v1/users/profile` - Get profile
     - `PUT /api/v1/users/profile` - Update profile

2. **Vehicle Service** (`/api/v1/vehicles`)
   - Port: Likely 3001 or separate port
   - Endpoints:
     - `GET /api/v1/vehicles` - List all vehicles
     - `GET /api/v1/vehicles/:id` - Get vehicle by ID
     - `POST /api/v1/vehicles` - Create vehicle
     - `PUT /api/v1/vehicles/:id` - Update vehicle
     - `DELETE /api/v1/vehicles/:id` - Delete vehicle

3. **Booking Service** (`/api/v1/bookings`)
   - Port: Likely 3001 or separate port
   - Endpoints:
     - `GET /api/v1/bookings` - List bookings
     - `GET /api/v1/bookings/:id` - Get booking by ID
     - `POST /api/v1/bookings` - Create booking
     - `DELETE /api/v1/bookings/:id` - Cancel booking

4. **Payment Service** (`/api/v1/payments`)
   - Port: Likely 3001 or separate port
   - Endpoints:
     - `POST /api/v1/payments` - Process payment
     - `GET /api/v1/payments/:id` - Get payment details

5. **Media/Upload Service** (`/api/v1/upload`)
   - Port: Likely 3001 or separate port
   - Endpoints:
     - `POST /api/v1/upload` - Upload file

6. **Sales Service** (`/api/v1/sales`)
   - Port: Likely 3001 or separate port
   - Endpoints:
     - `GET /api/v1/sales` - Get sales data

## API Gateway Pattern

If using an API Gateway:
- All requests go through: `http://localhost:3001`
- Gateway routes to appropriate microservice
- Frontend doesn't need to know individual service ports

## If Microservices Use Different Ports

If each microservice runs on a different port, update `src/utils/api.js`:

```javascript
const MICROSERVICES = {
  users: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001',
  vehicles: process.env.REACT_APP_VEHICLE_SERVICE_URL || 'http://localhost:3002',
  bookings: process.env.REACT_APP_BOOKING_SERVICE_URL || 'http://localhost:3003',
  payments: process.env.REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:3004',
  upload: process.env.REACT_APP_UPLOAD_SERVICE_URL || 'http://localhost:3005',
  sales: process.env.REACT_APP_SALES_SERVICE_URL || 'http://localhost:3006',
};
```

## Next Steps

1. **Examine the backend repository structure** to identify exact microservices
2. **Check docker-compose.yml** (if exists) for service definitions
3. **Update API service** if microservices use different base URLs
4. **Configure CORS** for each microservice
5. **Test each endpoint** individually
