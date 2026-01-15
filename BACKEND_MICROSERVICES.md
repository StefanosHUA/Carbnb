# Backend Microservices Documentation

## Overview

The backend is organized as microservices. This document identifies the microservices structure and how the frontend connects to them.

## Microservices Identification

Based on the backend repository structure, the microservices are likely organized as follows:

### Expected Microservices:

1. **User Service** (`/api/v1/users`)
   - User registration and authentication
   - User profile management
   - Google OAuth integration

2. **Vehicle Service** (`/api/v1/vehicles`)
   - Vehicle/listing management
   - Vehicle CRUD operations
   - Vehicle search and filtering

3. **Booking Service** (`/api/v1/bookings`)
   - Booking creation and management
   - Booking status updates
   - Booking history

4. **Payment Service** (`/api/v1/payments`)
   - Payment processing
   - Payment history
   - Transaction management

5. **Media/Upload Service** (`/api/v1/upload`)
   - File uploads
   - Image processing
   - Media storage

6. **Sales Service** (`/api/v1/sales`)
   - Sales data for owners
   - Revenue tracking
   - Sales history

## API Gateway

The microservices are likely accessed through:
- **Base URL**: `http://localhost:3001` (or configured via `REACT_APP_API_URL`)
- **API Gateway**: Routes requests to appropriate microservices

## Frontend Integration

The frontend uses a centralized API service (`src/utils/api.js`) that handles:
- Authentication tokens
- Request/response formatting
- Error handling
- Automatic routing to correct microservices

## Verifying Backend Connection

To verify which microservices are running:

1. Check backend logs in the "BACKEND - API Server" window
2. Test individual endpoints:
   ```bash
   curl http://localhost:3001/api/v1/vehicles
   curl http://localhost:3001/api/v1/users
   curl http://localhost:3001/api/v1/bookings
   ```

## Next Steps

1. Identify exact microservice ports (if different from 3001)
2. Update API service if microservices use different base URLs
3. Configure CORS for each microservice
4. Set up API gateway if needed
