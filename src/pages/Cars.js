import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { vehiclesAPI, authAPI, getUserData } from '../utils/api';
import { useToastContext } from '../context/ToastContext';
import { getAllCarImages } from '../utils/carImages';

function Cars() {
  const toast = useToastContext();
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

  // Fetch cars from API
  useEffect(() => {
    fetchCars();
    fetchCurrentUser();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, cars]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      try {
        // Check if user is admin - admins can see all cars, normal users only see active cars
        const userData = getUserData();
        const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
        
        // Build filters - normal users only see active cars
        const filters = {};
        if (!isAdmin) {
          filters.is_active = true;
        }
        
        const vehicles = await vehiclesAPI.getAll(filters);
        // Handle both array response and object with data property
        const carsData = Array.isArray(vehicles) ? vehicles : (vehicles.data || vehicles.vehicles || []);
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
            name: carName,
            price: carPrice,
            image: images[0], // Primary image for display
            images: images, // All images array
            location: locationStr // Normalized location string
          };
        });
        
        // Additional client-side filtering for active cars (backup)
        const activeCars = normalizedCars.filter(car => car.is_active === true);
        
        setCars(activeCars);
        setFilteredCars(activeCars);
      } catch (apiError) {
        console.error('[Cars] API Error:', apiError);
        // Re-throw to be handled below
        throw apiError;
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
      filtered = filtered.filter(car => car.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    }

    if (filters.model) {
      filtered = filtered.filter(car => car.model.toLowerCase().includes(filters.model.toLowerCase()));
    }

    if (filters.location) {
      filtered = filtered.filter(car => car.location.toLowerCase().includes(filters.location.toLowerCase()));
    }

    if (filters.priceMin) {
      filtered = filtered.filter(car => car.price >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      filtered = filtered.filter(car => car.price <= parseInt(filters.priceMax));
    }

    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuel_type === filters.fuelType);
    }

    if (filters.transmission) {
      filtered = filtered.filter(car => car.transmission === filters.transmission);
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
  };

  const deleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      await vehiclesAPI.delete(carId);
      
      // Remove from local state
      setCars(cars.filter(car => car.id !== carId));
      setFilteredCars(filteredCars.filter(car => car.id !== carId));
      
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
          <p>{filteredCars.length} cars available</p>
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
        <div className="cars-grid">
          {filteredCars.length === 0 ? (
            <div className="no-cars">
              <h3>No cars found</h3>
              <p>Try adjusting your filters or check back later for new listings.</p>
            </div>
          ) : (
            filteredCars.map(car => (
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
      </div>
    </div>
  );
}

export default Cars; 