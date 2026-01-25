# Search Location Update - City-Based Search

## Overview

Updated the search functionality to use **city-based location** instead of postal code, inspired by car.gr's simple and intuitive approach.

## Changes Made

### 1. Home Page (`src/pages/Home.js`)

**Changed:**
- Search form now uses `city` instead of `location`/`postal_code`
- Simplified validation - only requires city name
- Removed postal code extraction logic
- Updated placeholder text to show example cities

**Before:**
```javascript
location: '39209', // Postal code required
placeholder: "e.g., 39209 or Athens"
```

**After:**
```javascript
city: '', // City name only
placeholder: "e.g., Athens, Thessaloniki"
```

### 2. Search Results Page (`src/pages/SearchResults.js`)

**Changed:**
- URL parameter changed from `postal_code` to `city`
- Search summary displays city name
- Removed postal code fallback logic

**Before:**
```javascript
if (paramsFromUrl.has('postal_code')) {
  postal_code: paramsFromUrl.get('postal_code'),
  // ...
}
```

**After:**
```javascript
if (paramsFromUrl.has('city')) {
  city: paramsFromUrl.get('city'),
  // ...
}
```

### 3. API Service (`src/utils/api.js`)

**Changed:**
- Updated search API documentation
- Changed required parameter from `postal_code` to `city`

**Before:**
```javascript
/**
 * Required: postal_code, availability_start_date, availability_end_date
 */
if (searchParams.postal_code) {
  queryParams.append('postal_code', searchParams.postal_code);
}
```

**After:**
```javascript
/**
 * Required: city, availability_start_date, availability_end_date
 */
if (searchParams.city) {
  queryParams.append('city', searchParams.city);
}
```

## User Experience Improvements

### Simplified Search Flow

**Before:**
1. User enters "Athens" or "11853"
2. System tries to extract postal code
3. Complex validation logic
4. Confusing error messages

**After:**
1. User enters "Athens"
2. System uses city directly
3. Simple validation
4. Clear user feedback

### Cleaner UI

**Before:**
```
Label: "Location"
Placeholder: "e.g., 39209 or Athens"
Help text: "Enter postal code (e.g., 39209) or city name"
```

**After:**
```
Label: "City"
Placeholder: "e.g., Athens, Thessaloniki"
Help text: "Enter city name"
```

## Backend Compatibility

The backend search endpoint should accept `city` as a parameter:

```
GET /api/v1/search/cars?city=Athens&availability_start_date=2026-01-26&availability_end_date=2026-01-29
```

### Required Parameters:
- `city` - City name (e.g., "Athens", "Thessaloniki")
- `availability_start_date` - Start date (ISO format)
- `availability_end_date` - End date (ISO format)

### Optional Parameters:
- `make` - Car brand
- `model` - Car model
- `query` - Full-text search
- `fuel_type` - Fuel type filter
- `transmission` - Transmission filter
- `min_daily_rate` / `max_daily_rate` - Price range
- `min_seats` - Minimum seats
- `page` / `page_size` - Pagination

## Testing

### Test Cases:

1. **Search with city only:**
   ```
   City: "Athens"
   Dates: 2026-01-26 to 2026-01-29
   Result: Shows cars in Athens
   ```

2. **Search with city and brand:**
   ```
   City: "Thessaloniki"
   Brand: "BMW"
   Dates: 2026-01-26 to 2026-01-29
   Result: Shows BMW cars in Thessaloniki
   ```

3. **Search with city, brand, and model:**
   ```
   City: "Athens"
   Brand: "Mercedes"
   Model: "C-Class"
   Dates: 2026-01-26 to 2026-01-29
   Result: Shows Mercedes C-Class in Athens
   ```

4. **Validation:**
   - Empty city: Shows error "Please enter a city"
   - Invalid dates: Shows error "Return date must be after pick-up date"
   - Missing dates: Shows error "Please select both pick-up and return dates"

## Example URLs

**Before:**
```
/search?postal_code=39209&availability_start_date=2026-01-26&availability_end_date=2026-01-29
```

**After:**
```
/search?city=Athens&availability_start_date=2026-01-26&availability_end_date=2026-01-29
```

## Benefits

### 1. **User-Friendly**
- ✅ Simple: Users only need to enter city name
- ✅ Clear: No confusion about postal codes
- ✅ Intuitive: Matches car.gr's approach

### 2. **Cleaner Code**
- ✅ Removed postal code extraction logic
- ✅ Simplified validation
- ✅ Less code to maintain

### 3. **Better UX**
- ✅ Faster search input
- ✅ Clearer error messages
- ✅ More intuitive interface

### 4. **International Support**
- ✅ Works with any city name
- ✅ No postal code format restrictions
- ✅ Better for international users

## Migration Notes

### For Existing Searches

If you have existing bookmarked searches with `postal_code`, they will redirect to the home page. Users will need to search again using the new city-based interface.

### For Backend

The backend needs to:
1. Accept `city` parameter instead of `postal_code`
2. Search cars by city location
3. Handle city name variations (case-insensitive, etc.)
4. Provide relevant results based on city

### For Frontend

No breaking changes for existing functionality:
- All other search parameters remain the same
- Search results display unchanged
- Filtering and pagination unchanged

## Inspiration from car.gr

car.gr's search focuses on simplicity:
- **Single location field**: Just city/region
- **No complex validation**: Simple text input
- **Clear labeling**: Obvious what to enter
- **Fast input**: Users can start searching immediately

Our implementation follows this philosophy while maintaining our existing features like brand/model selection and date ranges.

## Summary

✅ **Changed location search from postal code to city**
- Simpler and more intuitive
- Cleaner code and validation
- Better user experience
- Inspired by car.gr's approach

The search is now more user-friendly and aligns with common car rental search patterns!

