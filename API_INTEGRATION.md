# API Integration Guide

This document describes how the frontend communicates with the backend microservices.

## Overview

The frontend uses a centralized API service (`src/utils/api.js`) to communicate with the backend. All API calls go through this service, which handles:
- Authentication tokens
- Error handling
- Request/response formatting
- Base URL configuration

## Configuration

The API base URL is configured via environment variable:

```env
REACT_APP_API_URL=http://localhost:3001
```

If not set, it defaults to `http://localhost:3001`.

## API Service Structure

The API service is organized into modules:

- `authAPI` - Authentication and user management
- `vehiclesAPI` - Vehicle/listing operations
- `bookingsAPI` - Booking operations
- `paymentsAPI` - Payment processing
- `uploadAPI` - File uploads
- `salesAPI` - Sales data (for owner dashboard)

## Endpoints

### Authentication (`authAPI`)

- `POST /api/v1/users` - Register new user
- `POST /api/login` - Login user
- `POST /api/register/google` - Register with Google OAuth
- `POST /api/login/google` - Login with Google OAuth
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/logout` - Logout (optional)

### Vehicles (`vehiclesAPI`)

- `GET /api/v1/vehicles` - Get all vehicles (supports query params for filtering)
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `POST /api/v1/vehicles` - Create new vehicle
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle
- `GET /api/v1/vehicles?owner_id=:ownerId` - Get vehicles by owner

### Bookings (`bookingsAPI`)

- `GET /api/v1/bookings` - Get all bookings (supports query params)
- `GET /api/v1/bookings/:id` - Get booking by ID
- `POST /api/v1/bookings` - Create new booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking
- `GET /api/v1/bookings?user_id=:userId` - Get bookings by user

### Payments (`paymentsAPI`)

- `POST /api/v1/payments` - Process payment
- `GET /api/v1/payments/:id` - Get payment by ID
- `GET /api/v1/payments?booking_id=:bookingId` - Get payments by booking

### File Uploads (`uploadAPI`)

- `POST /api/v1/upload` - Upload file (multipart/form-data)

### Sales (`salesAPI`)

- `GET /api/v1/sales` - Get all sales (supports query params)
- `GET /api/v1/sales?owner_id=:ownerId` - Get sales by owner

## Authentication

The API service automatically includes authentication tokens in requests when available. Tokens are stored in:
- `localStorage.getItem('carbnb_user')` - User object with token
- `localStorage.getItem('carbnb_token')` - Separate token storage (if needed)

The token is sent in the `Authorization` header as:
```
Authorization: Bearer <token>
```

## Error Handling

All API calls use try-catch blocks and display user-friendly error messages via toast notifications. The API service handles:
- Network errors
- HTTP error responses
- JSON parsing errors
- Authentication errors

## Response Format

The API service handles various response formats:
- Direct data: `{ id: 1, name: "..." }`
- Nested data: `{ data: { id: 1, name: "..." } }`
- Array responses: `[{ id: 1 }, { id: 2 }]`
- Object with array: `{ vehicles: [{ id: 1 }] }`

## Usage Examples

### In a React Component

```javascript
import { vehiclesAPI, authAPI } from '../utils/api';

// Fetch vehicles
const cars = await vehiclesAPI.getAll();

// Create vehicle
const newVehicle = await vehiclesAPI.create(vehicleData);

// Login
const response = await authAPI.login({ email, password });
if (response.user) {
  localStorage.setItem('carbnb_user', JSON.stringify(response.user));
}
```

## Fallback Behavior

If API calls fail, the frontend falls back to:
1. Mock data (for development/demo)
2. LocalStorage data (for user sessions)
3. Error messages via toast notifications

## Notes

- The frontend and backend remain separate projects
- All API endpoints use the `REACT_APP_API_URL` environment variable
- CORS must be configured on the backend to allow frontend requests
- Authentication tokens are automatically included in authenticated requests
- The API service is flexible and handles various response formats from the backend
