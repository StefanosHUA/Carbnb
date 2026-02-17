import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { vehiclesAPI, authAPI, getUserData, searchAPI } from '../utils/api';
import { useToastContext } from '../context/ToastContext';
import { getAllCarImages } from '../utils/carImages';

function Cars() {
  const toast = useToastContext();
  const location = useLocation();
  const carsGridRef = useRef(null);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    location: '',
    priceMin: '',
    priceMax: '',
    fuelType: '',
    transmission: '',
    seats: '',
    yearMin: '',
    yearMax: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Fetch cars from API or use search results
  useEffect(() => {
    // Check if we have search results from navigation
    if (location.state?.fromSearch && location.state?.searchResults) {
      console.log('[Cars] Using search results from Home page');
      const searchResults = location.state.searchResults;
      
      // Normalize search results to match car format
      const normalizedCars = Array.isArray(searchResults) ? searchResults.map(car => {
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
          location: locationStr // Normalized location string
        };
      }) : [];
      
      setCars(normalizedCars);
      setFilteredCars(normalizedCars);
      setLoading(false);
      
      // Clear location state to prevent reusing on refresh
      window.history.replaceState({}, document.title);
    } else {
      // Normal flow - fetch all cars
      fetchCars();
      fetchCurrentUser();
    }
  }, [location.state]);

  // Apply filters when filters change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    applyFilters();
  }, [filters, cars]);

  // Refetch cars when page changes
  useEffect(() => {
    // Only fetch if we don't have search results from navigation
    if (!location.state?.fromSearch) {
      fetchCars();
    }
  }, [currentPage]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      try {
        // Use Elasticsearch to get paginated cars
        // Use default dates for availability (today to 30 days from now)
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30);
        
        const startDate = today.toISOString().split('T')[0];
        const endDate = futureDate.toISOString().split('T')[0];
        
        // Fetch cars from Elasticsearch with pagination
        const searchParams = {
          availability_start_date: startDate,
          availability_end_date: endDate,
          page: currentPage,
          page_size: ITEMS_PER_PAGE
        };
        
        const searchResults = await searchAPI.searchCars(searchParams);
        
        // Extract cars and pagination info from search results - SearchResponse has 'results' field
        const carsData = searchResults?.results || searchResults?.cars || searchResults?.items || searchResults?.data || [];
        const total = searchResults?.total || searchResults?.total_results || carsData.length;
        
        console.log('[Cars] Elasticsearch results:', searchResults);
        console.log('[Cars] Cars data extracted:', carsData);
        
        // If no cars from Elasticsearch, try fallback
        if (!carsData || carsData.length === 0) {
          console.log('[Cars] No cars from Elasticsearch, trying fallback...');
          throw new Error('No cars found in Elasticsearch');
        }
        
        // Update pagination
        setTotalResults(total);
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
        
        // Normalize images - use all available images from database (could be any number)
        const normalizedCars = carsData.map(car => {
          // Use utility function to get all car images (prioritizes uploaded media)
          let images = getAllCarImages(car);
          
          // Normalize location - convert object to string if needed
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
            id: car.id || car.vehicle_id, // Ensure id is preserved
            name: carName,
            brand: car.make || car.brand || '', // Normalize brand from make
            price: carPrice,
            image: images[0] || car.primary_image_url || car.image, // Primary image for display
            images: images.length > 0 ? images : (car.primary_image_url ? [car.primary_image_url] : []), // All images array
            location: locationStr, // Normalized location string
            make: car.make,
            model: car.model,
            is_active: car.is_active !== undefined ? car.is_active : true
          };
        });
        
        console.log('[Cars] Normalized cars:', normalizedCars);
        setCars(normalizedCars);
        setFilteredCars(normalizedCars);
      } catch (apiError) {
        console.error('[Cars] Elasticsearch API Error:', apiError);
        // Fallback to vehicles API if Elasticsearch fails or returns no results
        try {
          console.log('[Cars] Attempting fallback to vehiclesAPI...');
          const userData = getUserData();
          const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
          
          const filters = {};
          if (!isAdmin) {
            filters.is_active = true;
          }
          
          const vehicles = await vehiclesAPI.getAll(filters);
          const carsData = Array.isArray(vehicles) ? vehicles : (vehicles.data || vehicles.vehicles || []);
          
          console.log('[Cars] Fallback vehicles data:', carsData);
          
          const normalizedCars = carsData.map(car => {
            let images = getAllCarImages(car);
            
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
            
            const carName = car.name || `${car.make || ''} ${car.model || ''}`.trim() || 'Car';
            const carPrice = car.price || car.daily_rate || 0;
            
            return {
              ...car,
              id: car.id,
              name: carName,
              brand: car.make || car.brand || '',
              price: carPrice,
              image: images[0],
              images: images,
              location: locationStr
            };
          });
          
          const activeCars = normalizedCars.filter(car => car.is_active === true);
          console.log('[Cars] Fallback active cars:', activeCars);
          
          // Apply pagination to fallback results
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedCars = activeCars.slice(startIndex, endIndex);
          
          setCars(activeCars);
          setFilteredCars(paginatedCars);
          setTotalResults(activeCars.length);
          setTotalPages(Math.ceil(activeCars.length / ITEMS_PER_PAGE));
        } catch (fallbackError) {
          console.error('[Cars] Fallback fetch also failed:', fallbackError);
          throw apiError; // Re-throw original error
        }
      }
    } catch (error) {
      console.error('[Cars] Error fetching cars:', error);
      
      // Show specific error messages
      let errorMessage = 'Failed to load cars.';
      if (error.status === 0) {
        // Network error - backend not reachable
        errorMessage = 'Cannot connect to car service. Please ensure the backend is running.';
        toast.error(errorMessage);
      } else if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
        // Other API errors - error.message is already extracted as string by handleResponse
        errorMessage = error.message || 'Failed to load cars.';
        toast.error(errorMessage);
      }
      
      // Set empty arrays instead of mock data
      setCars([]);
      setFilteredCars([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await authAPI.getProfile();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Try to get from localStorage as fallback
      const savedUser = localStorage.getItem('carbnb_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...cars];

    if (filters.brand) {
      filtered = filtered.filter(car => 
        car.brand && car.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.model) {
      filtered = filtered.filter(car => 
        car.model && car.model.toLowerCase().includes(filters.model.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(car => 
        car.location && car.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.priceMin) {
      filtered = filtered.filter(car => car.price >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      filtered = filtered.filter(car => car.price <= parseInt(filters.priceMax));
    }

    if (filters.fuelType) {
      filtered = filtered.filter(car => 
        car.fuel_type && car.fuel_type.toLowerCase() === filters.fuelType.toLowerCase()
      );
    }

    if (filters.transmission) {
      filtered = filtered.filter(car => 
        car.transmission && car.transmission.toLowerCase() === filters.transmission.toLowerCase()
      );
    }

    if (filters.seats) {
      filtered = filtered.filter(car => car.seats >= parseInt(filters.seats));
    }

    if (filters.yearMin) {
      filtered = filtered.filter(car => car.year >= parseInt(filters.yearMin));
    }

    if (filters.yearMax) {
      filtered = filtered.filter(car => car.year <= parseInt(filters.yearMax));
    }

    setFilteredCars(filtered);
    setTotalResults(filtered.length);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      model: '',
      location: '',
      priceMin: '',
      priceMax: '',
      fuelType: '',
      transmission: '',
      seats: '',
      yearMin: '',
      yearMax: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    // Scroll to cars grid to show new page results
    if (carsGridRef.current) {
      const headerOffset = 100; // Offset for fixed header if any
      const elementPosition = carsGridRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Get paginated cars for current page
  const getPaginatedCars = () => {
    // Since we're using Elasticsearch with server-side pagination,
    // filteredCars already contains the paginated results for the current page
    // Only do client-side pagination if we have search results from navigation
    if (location.state?.fromSearch) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return filteredCars.slice(startIndex, endIndex);
    }
    // For Elasticsearch results, return as-is (already paginated)
    return filteredCars;
  };

  const deleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      await vehiclesAPI.delete(carId);
      
      // Remove from local state
      const updatedCars = cars.filter(car => car.id !== carId);
      const updatedFilteredCars = filteredCars.filter(car => car.id !== carId);
      
      setCars(updatedCars);
      setFilteredCars(updatedFilteredCars);
      
      // Update pagination after deletion
      const newTotalResults = updatedFilteredCars.length;
      const newTotalPages = Math.ceil(newTotalResults / ITEMS_PER_PAGE);
      setTotalResults(newTotalResults);
      setTotalPages(newTotalPages);
      
      // If current page is now beyond total pages, go to last page
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      toast.success('Car deleted successfully!');
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error(error.message || 'Error deleting car. Please try again.');
    }
  };

  const canDeleteCar = (car) => {
    return currentUser && car.owner_id === currentUser.id;
  };

  if (loading) {
    return (
      <div className="cars-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cars-page">
      <div className="cars-container">
        {/* Header */}
        <div className="cars-header">
          <h1>All Cars</h1>
          <p>{totalResults} {totalResults === 1 ? 'car' : 'cars'} available</p>
          {totalPages > 1 && (
            <p style={{ color: '#717171', fontSize: '14px' }}>
              Showing page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                placeholder="e.g., BMW"
              />
            </div>

            <div className="filter-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                value={filters.model}
                onChange={handleFilterChange}
                placeholder="e.g., 3 Series"
              />
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., San Francisco"
              />
            </div>

            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                name="priceMin"
                value={filters.priceMin}
                onChange={handleFilterChange}
                placeholder="0"
              />
            </div>

            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                name="priceMax"
                value={filters.priceMax}
                onChange={handleFilterChange}
                placeholder="200"
              />
            </div>

            <div className="filter-group">
              <label>Fuel Type</label>
              <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Transmission</label>
              <select name="transmission" value={filters.transmission} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Seats</label>
              <input
                type="number"
                name="seats"
                value={filters.seats}
                onChange={handleFilterChange}
                placeholder="2"
                min="2"
                max="15"
              />
            </div>

            <div className="filter-group">
              <label>Min Year</label>
              <input
                type="number"
                name="yearMin"
                value={filters.yearMin}
                onChange={handleFilterChange}
                placeholder="2010"
                min="1900"
                max="2024"
              />
            </div>

            <div className="filter-group">
              <label>Max Year</label>
              <input
                type="number"
                name="yearMax"
                value={filters.yearMax}
                onChange={handleFilterChange}
                placeholder="2024"
                min="1900"
                max="2024"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Cars Grid */}
        <div ref={carsGridRef} className="cars-grid">
          {filteredCars.length === 0 ? (
            <div className="no-cars">
              <h3>No cars found</h3>
              <p>Try adjusting your filters or check back later for new listings.</p>
            </div>
          ) : (
            getPaginatedCars().map(car => (
              <div key={car.id} className="car-card-wrapper">
                <CarCard car={car} />
                {canDeleteCar(car) && (
                  <button
                    onClick={() => deleteCar(car.id)}
                    className="delete-car-btn"
                    title="Delete this car"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && filteredCars.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '10px',
            marginTop: '40px',
            paddingBottom: '40px'
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
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Previous
            </button>
            
            <span style={{ 
              fontSize: '16px', 
              padding: '0 20px',
              fontWeight: '500',
              color: '#484848'
            }}>
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
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cars; 