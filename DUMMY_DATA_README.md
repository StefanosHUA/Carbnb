# Dummy Cars Data - Database Seeding Guide

This file contains instructions for seeding your database with realistic dummy car data.

## File Location
- **File**: `dummy_cars_data.json`
- **Format**: JSON array of vehicle objects

## Data Structure

Each vehicle object contains:
- **Basic Information**: title, description, make, model, year
- **Vehicle Details**: vehicle_type, license_plate, use, color, seats, doors
- **Technical Specs**: transmission, fuel_type, mileage
- **Pricing**: price_per_day, dynamic_price_enabled
- **Location**: Full address with coordinates (latitude, longitude)
- **Media**: Array of image URLs
- **Availability**: Start and end dates for rental availability
- **Owner**: owner_id (references user in user_service)
- **Ratings**: rating and reviews count

## How to Use

### Option 1: Using a Database Script (Recommended)

If your backend has a seeding script, you can import this JSON:

```bash
# Example for PostgreSQL
psql -U your_user -d carbnb_vehicles -c "COPY vehicles FROM '/path/to/dummy_cars_data.json' FORMAT json;"
```

### Option 2: Using Backend API

You can use the frontend or a script to POST each vehicle:

```javascript
// Example Node.js script
const fs = require('fs');
const axios = require('axios');

const vehicles = JSON.parse(fs.readFileSync('dummy_cars_data.json', 'utf8'));

vehicles.forEach(async (vehicle) => {
  try {
    const response = await axios.post('http://localhost:3003/api/v1/vehicles', vehicle, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });
    console.log(`Created vehicle: ${vehicle.title}`);
  } catch (error) {
    console.error(`Error creating ${vehicle.title}:`, error.message);
  }
});
```

### Option 3: Direct Database Insert

If you have direct database access, you can write a migration script:

```sql
-- Example PostgreSQL insert (adjust based on your schema)
INSERT INTO vehicles (
  title, description, make, model, year, vehicle_type,
  license_plate, use, color, seats, doors, transmission,
  fuel_type, mileage, price_per_day, dynamic_price_enabled,
  owner_id, location, media, availabilities, rating, reviews
) VALUES (
  -- Use values from JSON file
);
```

## Data Included

The file contains **10 diverse vehicles**:
1. Tesla Model 3 (Electric Sedan)
2. BMW 3 Series (Luxury Sedan)
3. Toyota Prius (Hybrid Hatchback)
4. Ford Mustang (Convertible)
5. Audi A4 (Premium Sedan)
6. Honda Civic (Compact Sedan)
7. Mercedes-Benz C-Class (Luxury Sedan)
8. Jeep Wrangler (SUV)
9. Nissan Leaf (Electric Hatchback)
10. Chevrolet Corvette (Sports Car)

## Important Notes

1. **Owner IDs**: The `owner_id` field references users in the user_service. Make sure these users exist before seeding vehicles, or update the owner_ids to match your existing users.

2. **Image URLs**: All images use Unsplash placeholder URLs. In production, you should replace these with actual uploaded images.

3. **Location Coordinates**: All locations have valid latitude/longitude coordinates for major US cities.

4. **Dates**: Availability dates are set for 2024. Update these based on your current date.

5. **Price Format**: Prices are in USD per day.

## Customization

You can modify the JSON file to:
- Add more vehicles
- Change locations
- Update prices
- Modify availability dates
- Add more images per vehicle
- Change owner assignments

## Verification

After seeding, verify the data:

```bash
# Check if vehicles were created
curl http://localhost:3003/api/v1/vehicles

# Or use the frontend
# Navigate to http://localhost:3000/cars
```

## Troubleshooting

1. **Foreign Key Errors**: Ensure owner_ids exist in the user_service database
2. **Date Format**: Ensure your backend accepts the date format used (YYYY-MM-DD)
3. **Media URLs**: If images don't load, check if the URLs are accessible
4. **Location Format**: Verify your backend expects the nested location object structure

## Next Steps

After seeding:
1. Test the frontend car listing page
2. Verify car detail pages load correctly
3. Test filtering and search functionality
4. Check that images display properly
5. Verify location-based searches work
