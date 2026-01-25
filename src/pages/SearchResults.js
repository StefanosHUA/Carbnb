import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { searchAPI, vehiclesAPI, getUserData } from '../utils/api';
import { useToastContext } from '../context/ToastContext';
import { getAllCarImages } from '../utils/carImages';
import { CarCardSkeleton } from '../components/LoadingSkeleton';

function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastContext();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Get search parameters from location state or URL params
    const paramsFromState = location.state?.searchParams;
    const paramsFromUrl = new URLSearchParams(location.search);

    if (paramsFromState) {
      // Use search params from navigation state
      setSearchParams(paramsFromState);
      performSearch(paramsFromState);
    } else if (paramsFromUrl.has('city')) {
      // Build params from URL query string (city-based search)
      const params = {
        city: paramsFromUrl.get('city'),
        availability_start_date: paramsFromUrl.get('availability_start_date'),
        availability_end_date: paramsFromUrl.get('availability_end_date'),
        query: paramsFromUrl.get('query') || null,
        make: paramsFromUrl.get('make') || null,
        model: paramsFromUrl.get('model') || null,
        fuel_type: paramsFromUrl.get('fuel_type') || null,
        transmission: paramsFromUrl.get('transmission') || null,
        min_daily_rate: paramsFromUrl.get('min_daily_rate') ? parseFloat(paramsFromUrl.get('min_daily_rate')) : null,
        max_daily_rate: paramsFromUrl.get('max_daily_rate') ? parseFloat(paramsFromUrl.get('max_daily_rate')) : null,
        min_seats: paramsFromUrl.get('min_seats') ? parseInt(paramsFromUrl.get('min_seats')) : null,
        state: paramsFromUrl.get('state') || null,
        country: paramsFromUrl.get('country') || null,
        page: paramsFromUrl.get('page') ? parseInt(paramsFromUrl.get('page')) : 1,
        page_size: paramsFromUrl.get('page_size') ? parseInt(paramsFromUrl.get('page_size')) : 20,
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      setSearchParams(params);
      setCurrentPage(params.page || 1);
      performSearch(params);
    } else {
      // No search parameters, redirect to home
      toast.error('No search parameters found. Please search again.');
      navigate('/');
    }
  }, [location]);

  const performSearch = async (params) => {
    try {
      setLoading(true);
      console.log('[SearchResults] Performing search with params:', params);

      const results = await searchAPI.searchCars(params);
      console.log('[SearchResults] Search results received:', results);

      // Handle response structure
      const resultsArray = results.results || (Array.isArray(results) ? results : []);
      const total = results.total || resultsArray.length;
      const page = results.page || params.page || 1;
      const pageSize = results.page_size || params.page_size || 20;
      const pages = results.total_pages || Math.ceil(total / pageSize);

      // Normalize search results to match car format
      const normalizedCars = resultsArray.map(car => {
        // Use utility function to get all car images
        let images = getAllCarImages(car);

        // Normalize location
        let locationStr = car.location;
        if (car.location && typeof car.location === 'object') {
          const loc = car.location;
          if (loc.city && loc.state) {
            locationStr = `${loc.city}, ${loc.state}`;
          } else if (loc.city) {
            locationStr = loc.city;
          } else if (loc.state) {
            locationStr = loc.state;
          } else if (loc.name) {
            locationStr = loc.name;
          } else if (loc.address) {
            locationStr = loc.address;
          } else {
            locationStr = 'Location not available';
          }
        }

        // Normalize car name from make/model if name doesn't exist
        const carName = car.name || `${car.make || ''} ${car.model || ''}`.trim() || 'Car';

        // Normalize price from daily_rate if price doesn't exist
        const carPrice = car.price || car.daily_rate || 0;

        return {
          ...car,
          id: car.id, // Ensure id is preserved
          name: carName,
          brand: car.make || car.brand || '',
          price: carPrice,
          image: images[0], // Primary image for display
          images: images, // All images array
          location: locationStr, // Normalized location string
        };
      });

      setSearchResults(normalizedCars);
      setTotalResults(total);
      setCurrentPage(page);
      setTotalPages(pages);

    } catch (error) {
      console.error('[SearchResults] Search error:', error);
      toast.error(`Search failed: ${error.message || 'Please try again later'}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    const updatedParams = {
      ...searchParams,
      page: newPage,
    };

    setCurrentPage(newPage);
    performSearch(updatedParams);

    // Update URL without navigation
    const queryParams = new URLSearchParams();
    Object.keys(updatedParams).forEach(key => {
      if (updatedParams[key] !== null && updatedParams[key] !== undefined && updatedParams[key] !== '') {
        queryParams.append(key, updatedParams[key]);
      }
    });
    navigate(`/search?${queryParams.toString()}`, { replace: true });
  };

  const formatSearchSummary = () => {
    if (!searchParams) return '';

    const parts = [];
    if (searchParams.make || searchParams.model) {
      parts.push(`${searchParams.make || ''} ${searchParams.model || ''}`.trim());
    }
    if (searchParams.city) {
      parts.push(`in ${searchParams.city}`);
    }
    if (searchParams.availability_start_date && searchParams.availability_end_date) {
      const startDate = new Date(searchParams.availability_start_date).toLocaleDateString();
      const endDate = new Date(searchParams.availability_end_date).toLocaleDateString();
      parts.push(`from ${startDate} to ${endDate}`);
    }

    return parts.join(' • ') || 'Search Results';
  };

  if (loading) {
    return (
      <div className="search-results-page" style={{ padding: '40px 20px', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1>Searching...</h1>
            <p>Please wait while we find available cars for you.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Search Summary Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0 }}>
              {totalResults > 0 ? `${totalResults} ${totalResults === 1 ? 'car found' : 'cars found'}` : 'No cars found'}
            </h1>
            <Link 
              to="/" 
              style={{ 
                color: '#FF385C', 
                textDecoration: 'none', 
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              ← Modify Search
            </Link>
          </div>
          <p style={{ color: '#717171', fontSize: '16px', margin: 0 }}>
            {formatSearchSummary()}
          </p>
        </div>

        {/* Results */}
        {searchResults.length > 0 ? (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}>
              {searchResults.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '10px',
                marginTop: '40px'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Previous
                </button>
                
                <span style={{ fontSize: '16px', padding: '0 20px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: currentPage === totalPages ? '#f5f5f5' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: '#f8f8f8',
            borderRadius: '12px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#484848' }}>
              No cars found
            </h2>
            <p style={{ color: '#717171', fontSize: '16px', marginBottom: '30px' }}>
              Try adjusting your search criteria or search in a different location.
            </p>
            <Link 
              to="/" 
              style={{ 
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#FF385C',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              Modify Search
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;

