# Making postal_code Optional in Elasticsearch Search

## Changes Required

The following changes need to be made to make `postal_code` optional instead of required in the Elasticsearch search API.

### 1. Update Search Schema (`newBackend/car-rental-backend-v2/search_service/app/schemas/search.py`)

**Change the SearchQuery class** (around line 141):

**FROM:**
```python
class SearchQuery(BaseModel):

    postal_code: str = Field(
        ..., description="Filter by location postal code (REQUIRED)")
    availability_start_date: date = Field(
        ..., description="Start date for car availability (REQUIRED)")
    availability_end_date: date = Field(
        ..., description="End date for car availability (REQUIRED)")

    # Optional search fields (can be combined)
    query: Optional[str] = Field(
        None, description="Full-text search query for make and model")
```

**TO:**
```python
class SearchQuery(BaseModel):

    availability_start_date: date = Field(
        ..., description="Start date for car availability (REQUIRED)")
    availability_end_date: date = Field(
        ..., description="End date for car availability (REQUIRED)")

    # Optional search fields (can be combined)
    postal_code: Optional[str] = Field(
        None, description="Filter by location postal code")
    query: Optional[str] = Field(
        None, description="Full-text search query for make and model")
```

Also update the example (around line 207):

**FROM:**
```python
"example": {
    "postal_code": "94102",
    "availability_start_date": "2026-06-10",
    ...
}
```

**TO:**
```python
"example": {
    "city": "Athens",
    "availability_start_date": "2026-06-10",
    ...
}
```

### 2. Update Search API Endpoint (`newBackend/car-rental-backend-v2/search_service/app/api/v1/search.py`)

**Update the module docstring** (around line 1-6):

**FROM:**
```python
"""
Search API endpoints for the Search Service.

This module provides REST API endpoints for searching cars using Elasticsearch.
postal_code and availability dates are REQUIRED. All other fields are optional.
"""
```

**TO:**
```python
"""
Search API endpoints for the Search Service.

This module provides REST API endpoints for searching cars using Elasticsearch.
Only availability dates are REQUIRED. All other fields including postal_code are optional.
"""
```

**Update the search_cars function** (around line 37-44):

**FROM:**
```python
async def search_cars(
    # REQUIRED parameters
    postal_code: str = Query(
        ..., description="Filter by location postal code (REQUIRED)"),
    availability_start_date: date = Query(
        ..., description="Start date for car availability (REQUIRED)"),
    availability_end_date: date = Query(
        ..., description="End date for car availability (REQUIRED)"),
    # OPTIONAL parameters
    query: Optional[str] = Query(
        None, description="Full-text search query for make and model"),
```

**TO:**
```python
async def search_cars(
    # REQUIRED parameters
    availability_start_date: date = Query(
        ..., description="Start date for car availability (REQUIRED)"),
    availability_end_date: date = Query(
        ..., description="End date for car availability (REQUIRED)"),
    # OPTIONAL parameters
    postal_code: Optional[str] = Query(
        None, description="Filter by location postal code"),
    query: Optional[str] = Query(
        None, description="Full-text search query for make and model"),
```

## Benefits

After these changes:
✅ Users can search by city without providing postal code
✅ Only availability dates are required
✅ postal_code becomes an optional filter
✅ More flexible search options

## Apply Changes

To apply these changes:

```bash
# Navigate to backend directory
cd newBackend/car-rental-backend-v2

# Apply the changes manually to the files listed above

# Restart the search service
# (The exact command depends on how you're running the service)
python search_service/app/main.py
# or
docker-compose restart search_service
```

## Testing

After applying changes and restarting the service, test with:

```bash
# Search with city only (no postal_code)
curl "http://localhost:8004/api/v1/search/cars?city=Athens&availability_start_date=2026-01-26&availability_end_date=2026-01-29"

# Search with postal_code (still works)
curl "http://localhost:8004/api/v1/search/cars?postal_code=10431&availability_start_date=2026-01-26&availability_end_date=2026-01-29"
```

## Frontend Already Updated

The frontend has already been updated to send `city` instead of `postal_code` in search requests, so once you apply these backend changes, everything will work together!

