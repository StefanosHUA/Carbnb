import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { vehiclesAPI, getUserData } from '../utils/api';
import { getAllCarImages } from '../utils/carImages';

// Import brand logos
import bmwLogo from '../assets/images/bmw-logo.png';
import mercedesLogo from '../assets/images/mercedes-logo.png';
import audiLogo from '../assets/images/audi-logo.png';
import teslaLogo from '../assets/images/tesla-logo.png';
import hondaLogo from '../assets/images/honda-logo.png';
import fordLogo from '../assets/images/ford-logo.png';
import volkswagenLogo from '../assets/images/volkswagen-logo.png';
import opelLogo from '../assets/images/opel-logo.png';

// All available brands on the site
const allBrands = [
  { name: 'BMW', logoUrl: bmwLogo, fallbackUrl: bmwLogo },
  { name: 'Mercedes', logoUrl: mercedesLogo, fallbackUrl: mercedesLogo },
  { name: 'Audi', logoUrl: audiLogo, fallbackUrl: audiLogo },
  { name: 'Tesla', logoUrl: teslaLogo, fallbackUrl: teslaLogo },
  { name: 'Honda', logoUrl: hondaLogo, fallbackUrl: hondaLogo },
  { name: 'Ford', logoUrl: fordLogo, fallbackUrl: fordLogo },
  { name: 'Volkswagen', logoUrl: volkswagenLogo, fallbackUrl: volkswagenLogo },
  { name: 'Opel', logoUrl: opelLogo, fallbackUrl: opelLogo },
  { name: 'Toyota', logoUrl: null, fallbackUrl: null },
  { name: 'Nissan', logoUrl: null, fallbackUrl: null },
  { name: 'Hyundai', logoUrl: null, fallbackUrl: null },
  { name: 'Kia', logoUrl: null, fallbackUrl: null },
  { name: 'Mazda', logoUrl: null, fallbackUrl: null },
  { name: 'Subaru', logoUrl: null, fallbackUrl: null },
  { name: 'Volvo', logoUrl: null, fallbackUrl: null },
  { name: 'Peugeot', logoUrl: null, fallbackUrl: null },
  { name: 'Renault', logoUrl: null, fallbackUrl: null },
  { name: 'Citroen', logoUrl: null, fallbackUrl: null },
  { name: 'Fiat', logoUrl: null, fallbackUrl: null },
  { name: 'Seat', logoUrl: null, fallbackUrl: null },
  { name: 'Skoda', logoUrl: null, fallbackUrl: null },
  { name: 'Mini', logoUrl: null, fallbackUrl: null },
  { name: 'Jaguar', logoUrl: null, fallbackUrl: null },
  { name: 'Land Rover', logoUrl: null, fallbackUrl: null },
  { name: 'Porsche', logoUrl: null, fallbackUrl: null },
  { name: 'Lexus', logoUrl: null, fallbackUrl: null },
  { name: 'Infiniti', logoUrl: null, fallbackUrl: null },
  { name: 'Acura', logoUrl: null, fallbackUrl: null },
  { name: 'Genesis', logoUrl: null, fallbackUrl: null },
  { name: 'Alfa Romeo', logoUrl: null, fallbackUrl: null },
  { name: 'Maserati', logoUrl: null, fallbackUrl: null },
  { name: 'Ferrari', logoUrl: null, fallbackUrl: null },
  { name: 'Lamborghini', logoUrl: null, fallbackUrl: null },
  { name: 'McLaren', logoUrl: null, fallbackUrl: null },
  { name: 'Bentley', logoUrl: null, fallbackUrl: null },
  { name: 'Rolls-Royce', logoUrl: null, fallbackUrl: null },
  { name: 'Aston Martin', logoUrl: null, fallbackUrl: null },
  { name: 'Bugatti', logoUrl: null, fallbackUrl: null },
  { name: 'Lotus', logoUrl: null, fallbackUrl: null },
  { name: 'Chevrolet', logoUrl: null, fallbackUrl: null },
  { name: 'Cadillac', logoUrl: null, fallbackUrl: null },
  { name: 'Dodge', logoUrl: null, fallbackUrl: null },
  { name: 'Jeep', logoUrl: null, fallbackUrl: null },
  { name: 'Chrysler', logoUrl: null, fallbackUrl: null },
  { name: 'GMC', logoUrl: null, fallbackUrl: null },
  { name: 'Buick', logoUrl: null, fallbackUrl: null },
  { name: 'Lincoln', logoUrl: null, fallbackUrl: null },
  { name: 'Tesla', logoUrl: teslaLogo, fallbackUrl: teslaLogo }
];

// Popular brands for display (first 8)
const popularBrands = allBrands.slice(0, 8);

const popularModels = [
  { brand: 'Renault', model: 'Clio', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=renault&modelFamily=clio&zoomType=fullscreen&angle=01' },
  { brand: 'Ford', model: 'Fiesta', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=ford&modelFamily=fiesta&zoomType=fullscreen&angle=01' },
  { brand: 'Opel', model: 'Astra', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=opel&modelFamily=astra&zoomType=fullscreen&angle=01' },
  { brand: 'Honda', model: 'Civic', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=honda&modelFamily=civic&zoomType=fullscreen&angle=01' },
  { brand: 'Volkswagen', model: 'Polo', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=volkswagen&modelFamily=polo&zoomType=fullscreen&angle=01' },
  { brand: 'BMW', model: '3 Series', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=bmw&modelFamily=3-series&zoomType=fullscreen&angle=01' },
  { brand: 'Mercedes', model: 'C-Class', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=mercedes-benz&modelFamily=c-class&zoomType=fullscreen&angle=01' },
  { brand: 'Audi', model: 'A4', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=audi&modelFamily=a4&zoomType=fullscreen&angle=01' },
  { brand: 'Tesla', model: 'Model 3', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=tesla&modelFamily=model-3&zoomType=fullscreen&angle=01' },
  { brand: 'Ford', model: 'Focus', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=ford&modelFamily=focus&zoomType=fullscreen&angle=01' },
  { brand: 'Volkswagen', model: 'Golf', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=volkswagen&modelFamily=golf&zoomType=fullscreen&angle=01' },
  { brand: 'Opel', model: 'Corsa', image: 'https://cdn.imagin.studio/getImage?&customer=carwow&make=opel&modelFamily=corsa&zoomType=fullscreen&angle=01' }
];

function Home() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [brandImagesLoaded, setBrandImagesLoaded] = useState(false);
  const [currentModelPage, setCurrentModelPage] = useState(0);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [searchData, setSearchData] = useState({
    brand: allBrands[0].name,
    model: '',
    location: '',
    startDate: '',
    endDate: '',
    priceRange: '',
    fuelType: '',
    transmission: '',
    seats: ''
  });

  const modelsPerPage = 5;
  const totalModelPages = Math.ceil(popularModels.length / modelsPerPage);

  // Preload brand images
  useEffect(() => {
    const preloadBrandImages = () => {
      const imagePromises = popularBrands.map(brand => {
        return new Promise((resolve) => {
          // Try primary URL first
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => {
            // Try fallback URL if primary fails
            if (brand.fallbackUrl) {
              const fallbackImg = new Image();
              fallbackImg.onload = () => resolve();
              fallbackImg.onerror = () => resolve(); // Resolve anyway to not block page
              fallbackImg.src = brand.fallbackUrl;
            } else {
              resolve(); // Resolve anyway to not block page
            }
          };
          img.src = brand.logoUrl;
        });
      });

      Promise.all(imagePromises).then(() => {
        setBrandImagesLoaded(true);
      });
    };

    preloadBrandImages();
  }, []);

  useEffect(() => {
    // Fetch featured cars from API
    const fetchFeaturedCars = async () => {
      try {
        setLoadingCars(true);
        // Build filters - show only active cars to all users
        const filters = { limit: 6, is_active: true };
        
        const vehicles = await vehiclesAPI.getAll(filters);
        const carsData = Array.isArray(vehicles) ? vehicles : (vehicles.data || vehicles.vehicles || []);
        // Normalize images - use all available images from database (could be 1, 3, or more)
        const normalizedCars = carsData.map(car => {
          // Use utility function to get all car images (prioritizes uploaded media)
          const { getAllCarImages } = require('../utils/carImages');
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
        
        setFeaturedCars(activeCars);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
        setFeaturedCars([]);
      } finally {
        setLoadingCars(false);
      }
    };
    fetchFeaturedCars();
  }, []);

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

  const handleNextModels = () => {
    setCurrentModelPage((prev) => (prev + 1) % totalModelPages);
  };

  const handlePrevModels = () => {
    setCurrentModelPage((prev) => (prev - 1 + totalModelPages) % totalModelPages);
  };

  const getCurrentModels = () => {
    const start = currentModelPage * modelsPerPage;
    return popularModels.slice(start, start + modelsPerPage);
  };

  // Show loading state until brand images are ready
  if (!brandImagesLoaded) {
    return (
      <div className="home" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#717171' }}>Loading...</div>
        </div>
      </div>
    );
  }

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
                  {allBrands.map((brand) => (
                    <option key={brand.name} value={brand.name}>{brand.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="search-input-group">
                <label>Model</label>
                <input 
                  type="text" 
                  name="model"
                  value={searchData.model}
                  onChange={handleSearchChange}
                  placeholder="Enter model name"
                  className="search-input"
                />
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
              <div className="brand-logo">
                <img 
                  src={brand.logoUrl} 
                  alt={`${brand.name} logo`}
                  onError={(e) => {
                    // Try fallback URL if primary fails
                    if (brand.fallbackUrl && e.target.src !== brand.fallbackUrl && !e.target.dataset.triedFallback) {
                      e.target.dataset.triedFallback = 'true';
                      e.target.src = brand.fallbackUrl;
                      return;
                    }
                    // If fallback also fails, show emoji
                    console.error(`Failed to load logo for ${brand.name}:`, e.target.src);
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.brand-logo-fallback');
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                  onLoad={(e) => {
                    // Hide fallback when image loads successfully
                    const fallback = e.target.parentElement.querySelector('.brand-logo-fallback');
                    if (fallback) {
                      fallback.style.display = 'none';
                    }
                  }}
                />
                <span className="brand-logo-fallback" style={{ display: 'none' }}>
                  {brand.logo}
                </span>
              </div>
              <h3>{brand.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Models */}
      <section className="popular-models">
        <div className="models-section-header">
          <div className="models-header-left">
            <i className="fas fa-car" style={{ color: '#0066cc', marginRight: '8px' }}></i>
            <h2>Popular Car Models</h2>
          </div>
        </div>
        <div className="models-container-wrapper">
          <div className="models-container" style={{ transform: `translateX(-${currentModelPage * 100}%)` }}>
            {Array.from({ length: totalModelPages }).map((_, pageIndex) => (
              <div key={pageIndex} className="models-page">
                {popularModels.slice(pageIndex * modelsPerPage, (pageIndex + 1) * modelsPerPage).map((item, index) => (
                  <div key={`${item.brand}-${item.model}-${pageIndex}`} className="model-card-new">
                    <div className="model-image-container">
                      <img src={item.image} alt={`${item.brand} ${item.model}`} className="model-image" />
                    </div>
                    <div className="model-info-bar">
                      <span className="model-name">{item.brand} {item.model}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {totalModelPages > 1 && (
            <>
              <button 
                className="models-nav-arrow models-nav-arrow-left" 
                onClick={handlePrevModels}
                aria-label="Previous models"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                className="models-nav-arrow models-nav-arrow-right" 
                onClick={handleNextModels}
                aria-label="Next models"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="featured-cars">
        <div className="section-header">
          <h2>Featured Cars</h2>
          <Link to="/cars" className="view-all-btn">View All Cars</Link>
        </div>
        {loadingCars ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#717171' }}>Loading featured cars...</div>
          </div>
        ) : featuredCars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#717171', marginBottom: '16px' }}>
              No cars available at the moment
            </div>
            <Link to="/register-car" className="view-all-btn" style={{ display: 'inline-block' }}>
              Be the first to list a car
            </Link>
          </div>
        ) : (
          <div className="car-grid">
            {featuredCars.map(car => (
              <CarCard car={car} key={car.id} />
            ))}
          </div>
        )}
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
            <img src="https://www.lifo.gr/sites/default/files/styles/max_1920x1920/public/articles/2020-11-04/bmw-series1-new-1.jpg?itok=To55SXyG" alt="Host your car" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 