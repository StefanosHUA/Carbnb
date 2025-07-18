import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';

// Mock data - in real app this would come from API
const mockCars = [
  {
    id: 1,
    name: 'Tesla Model 3',
    price: 120,
    description: 'Electric, 2022, Autopilot, 300mi range',
    image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
    location: 'San Francisco, CA',
    rating: 4.8,
    reviews: 127,
    brand: 'Tesla',
    model: 'Model 3',
    year: 2022,
    fuel_type: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    owner_id: 1
  },
  {
    id: 2,
    name: 'BMW 3 Series',
    price: 90,
    description: 'Luxury, 2021, Sport Package, 250hp',
    image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
    location: 'Los Angeles, CA',
    rating: 4.6,
    reviews: 89,
    brand: 'BMW',
    model: '3 Series',
    year: 2021,
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    seats: 5,
    owner_id: 2
  },
  {
    id: 3,
    name: 'Toyota Prius',
    price: 60,
    description: 'Hybrid, 2020, Great MPG, Spacious',
    image: 'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?auto=format&fit=crop&w=400&q=80',
    location: 'Seattle, WA',
    rating: 4.7,
    reviews: 156,
    brand: 'Toyota',
    model: 'Prius',
    year: 2020,
    fuel_type: 'Hybrid',
    transmission: 'CVT',
    seats: 5,
    owner_id: 3
  },
  {
    id: 4,
    name: 'Ford Mustang',
    price: 110,
    description: 'Convertible, 2019, V8 Engine, Red',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80',
    location: 'Miami, FL',
    rating: 4.5,
    reviews: 203,
    brand: 'Ford',
    model: 'Mustang',
    year: 2019,
    fuel_type: 'Gasoline',
    transmission: 'Manual',
    seats: 4,
    owner_id: 4
  },
  {
    id: 5,
    name: 'Audi A4',
    price: 95,
    description: 'Premium, 2021, Quattro AWD, Leather',
    image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
    location: 'New York, NY',
    rating: 4.9,
    reviews: 78,
    brand: 'Audi',
    model: 'A4',
    year: 2021,
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    seats: 5,
    owner_id: 5
  },
  {
    id: 6,
    name: 'Honda Civic',
    price: 45,
    description: 'Reliable, 2020, Great Fuel Economy',
    image: 'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?auto=format&fit=crop&w=400&q=80',
    location: 'Chicago, IL',
    rating: 4.4,
    reviews: 234,
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    seats: 5,
    owner_id: 6
  }
];

const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Cars() {
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
      // In real app, this would be: const response = await fetch(`${baseUrl}/api/v1/vehicles`);
      // For now, using mock data
      setTimeout(() => {
        setCars(mockCars);
        setFilteredCars(mockCars);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      // In real app, this would be: const response = await fetch(`${baseUrl}/api/v1/users/profile`);
      // For now, using mock user
      setCurrentUser({ id: 1, name: 'John Doe' });
    } catch (error) {
      console.error('Error fetching user:', error);
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
      // In real app, this would be: await fetch(`${baseUrl}/api/v1/vehicles/${carId}`, { method: 'DELETE' });
      console.log(`Deleting car with ID: ${carId}`);
      
      // Remove from local state
      setCars(cars.filter(car => car.id !== carId));
      setFilteredCars(filteredCars.filter(car => car.id !== carId));
      
      alert('Car deleted successfully!');
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Error deleting car. Please try again.');
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