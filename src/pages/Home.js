import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';

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
    seats: 5
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
    seats: 5
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
    seats: 5
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
    seats: 4
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
    seats: 5
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
    seats: 5
  }
];

const popularBrands = [
  { name: 'BMW', logo: '🚗' },
  { name: 'Mercedes', logo: '🚗' },
  { name: 'Audi', logo: '🚗' },
  { name: 'Tesla', logo: '⚡' },
  { name: 'Toyota', logo: '🚗' },
  { name: 'Honda', logo: '🚗' },
  { name: 'Ford', logo: '🚗' },
  { name: 'Volkswagen', logo: '🚗' }
];

const popularModels = [
  { brand: 'BMW', model: '3 Series' },
  { brand: 'BMW', model: '5 Series' },
  { brand: 'Mercedes', model: 'C-Class' },
  { brand: 'Mercedes', model: 'E-Class' },
  { brand: 'Audi', model: 'A4' },
  { brand: 'Audi', model: 'A6' },
  { brand: 'Tesla', model: 'Model 3' },
  { brand: 'Tesla', model: 'Model S' },
  { brand: 'Toyota', model: 'Camry' },
  { brand: 'Toyota', model: 'Prius' },
  { brand: 'Honda', model: 'Civic' },
  { brand: 'Honda', model: 'Accord' }
];

function Home() {
  const [searchData, setSearchData] = useState({
    brand: '',
    model: '',
    location: '',
    startDate: '',
    endDate: '',
    priceRange: '',
    fuelType: '',
    transmission: '',
    seats: ''
  });

  const handleSearchChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search criteria:', searchData);
    // TODO: Implement search functionality with backend
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Car</h1>
          <p>Search thousands of cars from trusted owners worldwide</p>
          
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-box">
              <div className="search-input-group">
                <label>Brand</label>
                <select 
                  name="brand"
                  value={searchData.brand}
                  onChange={handleSearchChange}
                  className="search-select"
                >
                  <option value="">Select Brand</option>
                  {popularBrands.map(brand => (
                    <option key={brand.name} value={brand.name}>{brand.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="search-input-group">
                <label>Model</label>
                <select 
                  name="model"
                  value={searchData.model}
                  onChange={handleSearchChange}
                  className="search-select"
                >
                  <option value="">Select Model</option>
                  {searchData.brand && popularModels
                    .filter(item => item.brand === searchData.brand)
                    .map(item => (
                      <option key={item.model} value={item.model}>{item.model}</option>
                    ))}
                </select>
              </div>
              
              <div className="search-input-group">
                <label>Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={searchData.location}
                  onChange={handleSearchChange}
                  placeholder="Where do you want to pick up?"
                  className="search-input"
                />
              </div>
              
              <div className="search-input-group">
                <label>Pick-up Date</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={searchData.startDate}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
              
              <div className="search-input-group">
                <label>Return Date</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={searchData.endDate}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
              
              <button type="submit" className="search-submit-btn">
                <i className="fas fa-search"></i>
                Search Cars
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="popular-brands">
        <h2>Popular Car Brands</h2>
        <div className="brands-grid">
          {popularBrands.map(brand => (
            <div key={brand.name} className="brand-card">
              <div className="brand-logo">{brand.logo}</div>
              <h3>{brand.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Models */}
      <section className="popular-models">
        <h2>Most Popular Models</h2>
        <div className="models-grid">
          {popularModels.slice(0, 8).map((item, index) => (
            <div key={index} className="model-card">
              <h3>{item.brand} {item.model}</h3>
              <p>Starting from $50/day</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="featured-cars">
        <div className="section-header">
          <h2>Featured Cars</h2>
          <Link to="/cars" className="view-all-btn">View All Cars</Link>
        </div>
        <div className="car-grid">
          {mockCars.map(car => (
            <CarCard car={car} key={car.id} />
          ))}
        </div>
      </section>

      {/* Host Section */}
      <section className="host-section">
        <div className="host-content">
          <div className="host-text">
            <h2>List Your Car</h2>
            <p>Earn money by sharing your car. Join thousands of hosts who are making extra income by renting out their vehicles.</p>
            <Link to="/register-car" className="host-btn">
              Start Hosting
            </Link>
          </div>
          <div className="host-image">
            <img src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80" alt="Host your car" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 