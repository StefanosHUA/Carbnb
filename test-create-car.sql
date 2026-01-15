-- Test script to create a car in the database
-- Run this in pgAdmin after connecting to the car_service database

-- Step 1: Create a test location
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
    'Downtown Test Location',
    '123 Test Street',
    'Test City',
    'Test State',
    'USA',
    '12345',
    34.0522,
    -118.2437,
    true,
    NOW(),
    NOW()
) RETURNING id AS location_id;

-- Step 2: Create the vehicle
-- IMPORTANT: Replace owner_id with an actual user ID from your user_service database
-- You can find user IDs by running: SELECT id, email FROM users; (in user_service DB)
INSERT INTO vehicles (
    owner_id,           -- ⚠️ REPLACE THIS with your actual user ID
    location_id,       -- ⚠️ REPLACE THIS with location_id from step 1
    make,
    model,
    year,
    color,
    license_plate,
    vin,
    transmission,
    fuel_type,
    category,
    seats,
    doors,
    mileage,
    daily_rate,
    deposit_amount,
    is_active,
    created_at,
    updated_at
) VALUES (
    1,                  -- ⚠️ CHANGE THIS to your user ID
    1,                  -- ⚠️ CHANGE THIS to location_id from step 1
    'Toyota',
    'Camry',
    2022,
    'Silver',
    'TEST001',          -- Must be unique - change if exists
    '1HGBH41JXMN109186', -- Must be unique - change if exists
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
) RETURNING id AS vehicle_id;

-- Step 3: Create availability period
INSERT INTO vehicle_availabilities (
    vehicle_id,         -- ⚠️ REPLACE THIS with vehicle_id from step 2
    start_date,
    end_date,
    is_available,
    created_at,
    updated_at
) VALUES (
    1,                  -- ⚠️ CHANGE THIS to vehicle_id from step 2
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    true,
    NOW(),
    NOW()
);

-- Verify the car was created
SELECT 
    v.id,
    v.make,
    v.model,
    v.year,
    v.daily_rate,
    v.is_active,
    l.name AS location_name,
    l.city
FROM vehicles v
LEFT JOIN location l ON v.location_id = l.id
WHERE v.id = 1;  -- Replace with your vehicle_id

