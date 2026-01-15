# Available Backend Features - Frontend Integration Opportunities

## Summary
After reviewing the backend `user_service` and `car_service`, here are the supported features that can be added to the frontend:

---

## 🔐 User Service Features

### ✅ Already Implemented
- User registration (email/password & Google OAuth)
- User login (email/password & Google OAuth)
- User logout
- Get current user profile (basic)
- Admin: Get all users, user stats, user by ID

### 🆕 Available to Add

#### 1. **Profile Management** (High Priority)
- **GET `/api/v1/users/me`** - Get complete profile with documents
- **PUT `/api/v1/users/me`** - Update profile (name, bio, address, etc.)
- **PUT `/api/v1/users/me/email`** - Update email address
- **PUT `/api/v1/users/me/username`** - Update username

**Use Case:** Allow users to edit their profile in the dashboard

#### 2. **Password Management** (High Priority)
- **POST `/api/v1/auth/change-password`** - Change password (requires current password)
- **POST `/api/v1/auth/forgot-password`** - Request password reset
- **POST `/api/v1/auth/reset-password`** - Reset password with token

**Use Case:** Password change in settings, forgot password flow

#### 3. **Document Management** (Medium Priority)
- **GET `/api/v1/users/me/documents`** - List user documents
- **POST `/api/v1/documents/upload`** - Upload ID/driver license documents
- **DELETE `/api/v1/users/me/documents/{id}`** - Delete document
- **GET `/api/v1/documents/{id}/download`** - Get download URL

**Use Case:** User verification, document upload in profile settings

#### 4. **Account Deactivation** (Low Priority)
- **GET `/api/v1/users/me/deactivation-methods`** - Get available deactivation methods
- **POST `/api/v1/users/me/deactivation/request`** - Request account deactivation
- **POST `/api/v1/users/me/deactivation/verify`** - Verify deactivation code

**Use Case:** Account settings, privacy controls

#### 5. **Token Management** (Medium Priority)
- **POST `/api/v1/auth/refresh-token`** - Refresh JWT token

**Use Case:** Automatic token refresh, extended sessions

---

## 🚗 Car Service Features

### ✅ Already Implemented
- List vehicles (with filters)
- Get vehicle by ID
- Create vehicle
- Update vehicle
- Delete vehicle
- Activate/deactivate vehicle (admin)

### 🆕 Available to Add

#### 1. **Vehicle Availability Management** (High Priority)
- **POST `/api/v1/vehicles/{id}/availability`** - Create availability period
- **GET `/api/v1/vehicles/{id}/availability`** - List all availability periods
- **PUT `/api/v1/vehicles/availability/{id}`** - Update availability period
- **DELETE `/api/v1/vehicles/availability/{id}`** - Delete availability period
- **POST `/api/v1/vehicles/{id}/check-availability`** - Check if vehicle is available for dates

**Use Case:** Owner dashboard - manage when their car is available for rent

#### 2. **Vehicle Status** (Medium Priority)
- **GET `/api/v1/vehicles/{id}/status`** - Get vehicle status (documents, activation, availability)

**Use Case:** Owner dashboard - see what's needed to activate vehicle

#### 3. **Locations** (Low Priority)
- **GET `/api/v1/locations`** - List all locations
- **GET `/api/v1/locations/{id}`** - Get location details
- **GET `/api/v1/locations/{id}/vehicles`** - Get vehicles at location

**Use Case:** Location-based search, location selection in car registration

---

## 🎯 Recommended Implementation Priority

### Phase 1: Essential User Features (High Impact)
1. **Profile Management** - Edit profile in dashboard
2. **Password Change** - Security settings
3. **Vehicle Availability Management** - Owner dashboard functionality

### Phase 2: Enhanced Features (Medium Impact)
4. **Document Upload** - User verification
5. **Token Refresh** - Better session management
6. **Vehicle Status** - Owner insights

### Phase 3: Nice-to-Have (Low Impact)
7. **Account Deactivation** - Privacy controls
8. **Location Management** - Enhanced search

---

## 💡 Quick Wins (Easy to Implement)

1. **Profile Update** - Simple form in UserDashboard
2. **Password Change** - Settings page
3. **Vehicle Availability Calendar** - Owner dashboard
4. **Document Upload** - Profile settings with file upload

---

## 📝 Notes

- All endpoints require authentication (Bearer token)
- Some endpoints require admin role
- Document upload uses FormData (multipart/form-data)
- Availability management is crucial for owners to manage their listings

