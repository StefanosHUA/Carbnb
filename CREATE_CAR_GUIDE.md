# 🚗 Step-by-Step Guide: Creating a Car in the Database

## Understanding the 422 Error

A **422 Unprocessable Entity** error means the backend received your request but the data format is invalid. This is usually because:
- Missing required fields
- Invalid field values (e.g., wrong enum values, invalid VIN format)
- Data type mismatches

**Note**: An empty database won't cause a 422 error - it would just return an empty list. The 422 means validation failed.

---

## Method 1: Create Car via API (Recommended - Easiest)

### Step 1: Make sure you're logged in
You need a JWT token. Register/login first to get a token.

### Step 2: Use the API endpoint

**Endpoint:** `POST http://localhost:3003/api/v1/vehicles`

**Required Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Required JSON Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "color": "Silver",
  "license_plate": "ABC123",
  "vin": "1HGBH41JXMN109186",
  "transmission": "automatic",
  "fuel_type": "gasoline",
  "category": "standard",
  "seats": 5,
  "doors": 4,
  "mileage": 15000,
  "daily_rate": 50.00,
  "deposit_amount": 200.00,
  "location": {
    "name": "Downtown LA",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "California",
    "country": "USA",
    "postal_code": "90001",
    "latitude": 34.0522,
    "longitude": -118.2437
  }
}
```

### Step 3: Test with cURL or Postman

**Using cURL:**
```bash
curl -X POST http://localhost:3003/api/v1/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "Silver",
    "license_plate": "ABC123",
    "vin": "1HGBH41JXMN109186",
    "transmission": "automatic",
    "fuel_type": "gasoline",
    "category": "standard",
    "seats": 5,
    "doors": 4,
    "mileage": 15000,
    "daily_rate": 50.00,
    "deposit_amount": 200.00,
    "location": {
      "name": "Downtown LA",
      "address": "123 Main St",
      "city": "Los Angeles",
      "state": "California",
      "country": "USA",
      "postal_code": "90001"
    }
  }'
```

---

## Method 2: Create Car Directly in pgAdmin (Advanced)

### Prerequisites
1. You need a user ID from the `users` table (from user_service database)
2. pgAdmin connected to your PostgreSQL database
3. Database name: `carrental` (or whatever you configured)

### Step-by-Step Instructions

#### Step 1: Find or Create a User ID

**Option A: Use existing user**
```sql
-- Connect to user_service database
SELECT id, email, username FROM users LIMIT 5;
```

**Option B: Create a test user ID**
If you don't have a user, you'll need to create one via the user_service API first, or insert directly:
```sql
-- In user_service database
INSERT INTO users (email, username, hashed_password, first_name, last_name, created_at)
VALUES ('test@example.com', 'testuser', '$2b$12$...', 'Test', 'User', NOW())
RETURNING id;
```

**Note the user ID** - you'll need it for `owner_id`.

#### Step 2: Create Location First

The vehicle requires a location. Create it first:

```sql
-- In car_service database (carrental)
INSERT INTO location (
    name, 
    address, 
    city, 
    state, 
    country, 
    postal_code,
    latitude,
    longitude,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Downtown LA',
    '123 Main Street',
    'Los Angeles',
    'California',
    'USA',
    '90001',
    34.0522,
    -118.2437,
    true,
    NOW(),
    NOW()
) RETURNING id;
```

**Note the location ID** - you'll need it for `location_id`.

#### Step 3: Create the Vehicle

```sql
-- In car_service database (carrental)
INSERT INTO vehicles (
    owner_id,           -- REQUIRED: User ID from user_service
    location_id,        -- REQUIRED: Location ID from step 2
    make,               -- REQUIRED: e.g., 'Toyota', 'Honda', 'BMW'
    model,              -- REQUIRED: e.g., 'Camry', 'Civic', '3 Series'
    year,               -- REQUIRED: 1900-2030
    color,              -- REQUIRED: e.g., 'Silver', 'Black', 'Red'
    license_plate,      -- REQUIRED: Must be unique, min 2 chars
    vin,                -- REQUIRED: Exactly 17 characters, no I/O/Q
    transmission,       -- REQUIRED: 'manual', 'automatic', 'semi_automatic'
    fuel_type,          -- REQUIRED: 'gasoline', 'diesel', 'electric', 'hybrid', 'plugin_hybrid'
    category,           -- REQUIRED: 'economy', 'compact', 'intermediate', 'standard', 'full_size', 'premium', 'luxury', 'suv', 'convertible', 'van'
    seats,              -- REQUIRED: 1-50
    doors,              -- REQUIRED: 2-6
    mileage,            -- REQUIRED: >= 0
    daily_rate,         -- REQUIRED: >= 0
    deposit_amount,     -- REQUIRED: >= 0
    is_active,          -- Default: false (admin must activate)
    created_at,
    updated_at
) VALUES (
    1,                  -- Replace with your user ID
    1,                  -- Replace with your location ID
    'Toyota',
    'Camry',
    2022,
    'Silver',
    'ABC123',           -- Must be unique
    '1HGBH41JXMN109186', -- Must be exactly 17 chars, no I/O/Q
    'automatic',
    'gasoline',
    'standard',
    5,
    4,
    15000,
    50.00,
    200.00,
    false,              -- Will be inactive until admin activates
    NOW(),
    NOW()
) RETURNING id;
```

#### Step 4: Create Availability Period (Optional but Recommended)

Vehicles need availability periods to be bookable:

```sql
INSERT INTO vehicle_availabilities (
    vehicle_id,
    start_date,
    end_date,
    is_available,
    created_at,
    updated_at
) VALUES (
    1,                  -- Replace with your vehicle ID
    CURRENT_DATE,       -- Start today
    CURRENT_DATE + INTERVAL '1 year',  -- Available for 1 year
    true,
    NOW(),
    NOW()
);
```

---

## Valid Values Reference

### Transmission Types
- `manual`
- `automatic`
- `semi_automatic`

### Fuel Types
- `gasoline`
- `diesel`
- `electric`
- `hybrid`
- `plugin_hybrid`

### Vehicle Categories
- `economy`
- `compact`
- `intermediate`
- `standard`
- `full_size`
- `premium`
- `luxury`
- `suv`
- `convertible`
- `van`

### Valid Makes (examples)
- Toyota, Honda, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, Tesla, etc.

### Valid Models (examples for Toyota)
- Camry, Corolla, Prius, RAV4, Highlander, Sienna, Tacoma, Tundra

---

## Common Validation Errors

### VIN Errors
- ❌ Wrong: `ABC123` (too short)
- ❌ Wrong: `1HGBH41JXMN109186I` (contains I)
- ✅ Correct: `1HGBH41JXMN109186` (17 chars, no I/O/Q)

### License Plate Errors
- ❌ Wrong: `A` (too short)
- ✅ Correct: `ABC123` (2+ characters)

### Make/Model Errors
- ❌ Wrong: `Toyota` + `Mustang` (Mustang is Ford, not Toyota)
- ✅ Correct: `Toyota` + `Camry`

### Enum Value Errors
- ❌ Wrong: `auto` (should be `automatic`)
- ❌ Wrong: `gas` (should be `gasoline`)
- ✅ Correct: Use exact enum values from the list above

---

## Quick Test Script

Here's a complete SQL script to create a test car:

```sql
-- Step 1: Create location
INSERT INTO location (name, address, city, state, country, postal_code, is_active, created_at, updated_at)
VALUES ('Test Location', '123 Test St', 'Test City', 'Test State', 'USA', '12345', true, NOW(), NOW())
RETURNING id AS location_id;

-- Step 2: Create vehicle (replace owner_id with your actual user ID)
INSERT INTO vehicles (
    owner_id, location_id, make, model, year, color, license_plate, vin,
    transmission, fuel_type, category, seats, doors, mileage,
    daily_rate, deposit_amount, is_active, created_at, updated_at
) VALUES (
    1,  -- Replace with your user ID
    1,  -- Replace with location_id from step 1
    'Toyota', 'Camry', 2022, 'Silver', 'TEST001', '1HGBH41JXMN109186',
    'automatic', 'gasoline', 'standard', 5, 4, 15000,
    50.00, 200.00, false, NOW(), NOW()
) RETURNING id AS vehicle_id;

-- Step 3: Create availability
INSERT INTO vehicle_availabilities (vehicle_id, start_date, end_date, is_available, created_at, updated_at)
VALUES (
    1,  -- Replace with vehicle_id from step 2
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    true,
    NOW(),
    NOW()
);
```

---

## Troubleshooting

### "Foreign key constraint" error
- Make sure `owner_id` exists in the user_service database
- Make sure `location_id` exists in the location table

### "Unique constraint" error
- `license_plate` must be unique
- `vin` must be unique
- Change these values if they already exist

### "Check constraint" error
- Check that enum values match exactly (case-sensitive)
- Check that numeric values are within valid ranges

### "NOT NULL constraint" error
- Make sure all required fields are provided
- Check that foreign keys (owner_id, location_id) are not NULL

---

## Activating the Vehicle

After creating the vehicle, an admin needs to activate it:

```sql
UPDATE vehicles 
SET is_active = true 
WHERE id = YOUR_VEHICLE_ID;
```

Or use the API endpoint:
```
PATCH /api/v1/vehicles/{vehicle_id}/activate
```

---

## Next Steps

1. **Add images**: Upload vehicle images via the media API
2. **Add documents**: Upload license and insurance documents
3. **Set availability**: Create availability periods for when the car can be rented
4. **Activate**: Admin activates the vehicle to make it visible

