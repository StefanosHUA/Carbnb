import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import { useToastContext } from '../context/ToastContext';
import { CarCardSkeleton } from '../components/LoadingSkeleton';
import { vehiclesAPI, getUserData } from '../utils/api';
import { getAllCarImages } from '../utils/carImages';

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Debug: Log the id parameter
  useEffect(() => {
    console.log('[CarDetail] Route param id:', id);
    if (!id || id === 'undefined' || id === 'null') {
      console.error('[CarDetail] Invalid id from route params:', id);
      toast.error('Invalid car ID. Please select a car from the listings.');
      navigate('/cars');
      return;
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    // Validate id before making API call
    if (!id || id === 'undefined') {
      toast.error('Invalid car ID');
      navigate('/cars');
      return;
    }
    fetchCarDetails();
    checkFavoriteStatus();
  }, [id]);

  const fetchCarDetails = async () => {
    // Validate id before making API call
    if (!id || id === 'undefined') {
      console.error('Car ID is missing or invalid:', id);
      toast.error('Invalid car ID');
      setCar(null);
      setLoading(false);
      navigate('/cars');
      return;
    }

    try {
      setLoading(true);
      console.log('[CarDetail] Fetching car with ID:', id);
      const carData = await vehiclesAPI.getById(id);
      console.log('[CarDetail] Raw API response:', carData);
      
      // Handle response - it might be an array or a single object
      let car = null;
      if (Array.isArray(carData)) {
        // If response is an array, find the car with matching ID
        const carId = parseInt(id);
        car = carData.find(c => c.id === carId);
        if (!car) {
          // If not found, use first car as fallback
          car = carData[0];
          console.warn(`[CarDetail] Car with ID ${carId} not found in array, using first car with ID ${car.id}`);
        } else {
          console.log(`[CarDetail] Found car with ID ${carId} in array`);
        }
      } else {
        // Handle both direct object and nested data property
        car = carData.vehicle || carData.data || carData;
      }
      
      console.log('[CarDetail] Extracted car object:', car);
      
      // Ensure car has required structure
      if (car) {
        // Map backend vehicle fields to UI expectations
        // Brand in UI = make in backend (ALWAYS copy make to brand)
        car.brand = car.make || car.brand || '';
        // Vehicle type in UI = category in backend (ALWAYS copy category to vehicle_type)
        car.vehicle_type = car.category || car.vehicle_type || '';
        
        // Ensure all spec fields are properly extracted from backend response
        // These fields come directly from the database and should always exist
        car.make = car.make || '';
        car.model = car.model || '';
        car.year = car.year || null;
        car.fuel_type = car.fuel_type || '';
        car.transmission = car.transmission || '';
        car.seats = car.seats ?? null;
        car.doors = car.doors ?? null;
        car.mileage = car.mileage ?? null;
        car.color = car.color || '';
        car.category = car.category || '';
        
        console.log('[CarDetail] After field extraction:', {
          make: car.make,
          brand: car.brand,
          model: car.model,
          year: car.year,
          fuel_type: car.fuel_type,
          transmission: car.transmission,
          seats: car.seats,
          doors: car.doors,
          mileage: car.mileage,
          color: car.color
        });
        // Description fallback from condition notes if needed
        if (!car.description && car.condition_notes) {
          car.description = car.condition_notes;
        }
        // Features may come as JSON string; normalize to array
        if (car.features && typeof car.features === 'string') {
          try {
            const parsed = JSON.parse(car.features);
            if (Array.isArray(parsed)) {
              car.features = parsed;
            } else {
              car.features = String(car.features)
                .split(',')
                .map(f => f.trim())
                .filter(Boolean);
            }
          } catch (e) {
            car.features = String(car.features)
              .split(',')
              .map(f => f.trim())
              .filter(Boolean);
          }
        }
        // Check if car is active - normal users should only see active cars
        const userData = getUserData();
        const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
        
        if (!isAdmin && car.is_active === false) {
          // Car is inactive and user is not admin
          toast.error('This car is currently unavailable.');
          setCar(null);
          setLoading(false);
          setTimeout(() => navigate('/cars'), 2000);
          return;
        }
        // Set default values for optional properties
        if (!car.owner) {
          car.owner = {
            id: car.owner_id || null,
            name: 'Owner',
            avatar: '/default-avatar.png',
            rating: 0,
            response_rate: 0,
            response_time: 'N/A'
          };
        }
        if (!car.features) {
          car.features = [];
        }
        // Use utility function to get all car images (prioritizes uploaded media)
        car.images = getAllCarImages(car);
        
        // Create locationString for display, but keep location object for detailed access
        car.locationString = 'Location not available';
        const locObj = car.location;
        if (locObj && typeof locObj === 'object') {
          if (locObj.city && locObj.state) {
            car.locationString = `${locObj.city}, ${locObj.state}`;
          } else if (locObj.city) {
            car.locationString = locObj.city;
          } else if (locObj.state) {
            car.locationString = locObj.state;
          } else if (locObj.name) {
            car.locationString = locObj.name;
          } else if (locObj.address) {
            car.locationString = locObj.address;
          }
        } else if (car.location && typeof car.location === 'string') {
          car.locationString = car.location;
        }
        
        // Normalize car name from make/model if name doesn't exist
        if (!car.name) {
          car.name = `${car.make || car.brand || ''} ${car.model || ''}`.trim() || 'Car';
        }
        
        // Normalize price from daily_rate if price doesn't exist
        if (car.price === undefined || car.price === null || car.price === 0) {
          car.price = parseFloat(car.daily_rate) || 0;
        } else {
          car.price = parseFloat(car.price) || 0;
        }
        
        console.log('[CarDetail] Processed car data:', {
          id: car.id,
          name: car.name,
          make: car.make,
          brand: car.brand,
          model: car.model,
          year: car.year,
          fuel_type: car.fuel_type,
          transmission: car.transmission,
          seats: car.seats,
          doors: car.doors,
          mileage: car.mileage,
          color: car.color,
          vehicle_type: car.vehicle_type,
          category: car.category,
          price: car.price,
          daily_rate: car.daily_rate,
          description: car.description,
          location: car.location,
          locationString: car.locationString
        });
        
        setCar(car);
      } else {
        setCar(null);
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
      // Show error message
      if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
        toast.error(error.message || 'Failed to load car details.');
      } else if (error.status === 0) {
        toast.error('Cannot connect to car service. Please ensure the backend is running.');
      }
      // Don't set mock data - let the component show error state
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('carbnb_favorites') || '[]');
    setIsFavorite(favorites.includes(parseInt(id)));
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    const favorites = JSON.parse(localStorage.getItem('carbnb_favorites') || '[]');
    const carId = parseInt(id);
    
    if (isFavorite) {
      const updated = favorites.filter(favId => favId !== carId);
      localStorage.setItem('carbnb_favorites', JSON.stringify(updated));
      setIsFavorite(false);
      toast.info('Removed from favorites');
    } else {
      favorites.push(carId);
      localStorage.setItem('carbnb_favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success('Added to favorites');
    }
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  if (loading) {
    return (
      <div className="car-detail-page">
        <div className="car-detail-container">
          <CarCardSkeleton />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="car-detail-page">
        <div className="car-detail-container">
          <div className="error-state">
            <h2>Car not found</h2>
            <p>The car you're looking for doesn't exist or has been removed.</p>
            <Link to="/cars" className="back-btn">Browse All Cars</Link>
          </div>
        </div>
      </div>
    );
  }

  // Use all available images from database (could be 1, 3, or more)
  const carImages = car.images && Array.isArray(car.images) && car.images.length > 0
    ? car.images  // Use all images from database
    : car.image 
      ? [car.image]  // Fallback to single image
      : ['https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="car-detail-page">
      <div className="car-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cars">Cars</Link>
          <span>/</span>
          <span>{car.name}</span>
        </nav>

        {/* Main Content */}
        <div className="car-detail-content">
          {/* Left Column - Images and Details */}
          <div className="car-detail-main">
            {/* Image Gallery */}
            <div className="car-images-section">
              <div className="main-image" onClick={() => handleImageClick(0)}>
                <img src={carImages[0]} alt={car.name} loading="lazy" />
                <button 
                  className="favorite-btn-detail" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(e);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
                {carImages.length > 1 && (
                  <button className="view-all-photos" onClick={() => handleImageClick(0)}>
                    <i className="fas fa-images"></i>
                    View all {carImages.length} photos
                  </button>
                )}
              </div>
              {carImages.length > 1 && (
                <div className="thumbnail-grid">
                  {carImages.slice(1, 5).map((img, index) => (
                    <div 
                      key={index} 
                      className="thumbnail"
                      onClick={() => handleImageClick(index + 1)}
                    >
                      <img src={img} alt={`${car.name} ${index + 2}`} loading="lazy" />
                    </div>
                  ))}
                  {carImages.length > 5 && (
                    <div 
                      className="thumbnail more-photos"
                      onClick={() => handleImageClick(0)}
                    >
                      <span>+{carImages.length - 5} more</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Car Information */}
            <div className="car-info-section">
              <div className="car-header-detail">
                <div>
                  <h1>{car.name}</h1>
                  <div className="car-meta">
                    <div className="car-rating">
                      <span className="star">★</span>
                      <span className="rating-number">{car.rating}</span>
                    </div>
                    <span className="divider">·</span>
                    <Link to={`/cars?location=${encodeURIComponent(car.locationString || '')}`} className="car-location-link">
                      <i className="fas fa-map-marker-alt"></i>
                      {car.locationString || 'Location not available'}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              {car.owner && (
                <div className="owner-section">
                  <div className="owner-info">
                    <img src={car.owner.avatar || '/default-avatar.png'} alt={car.owner.name || 'Owner'} className="owner-avatar" />
                    <div className="owner-details">
                      <h3>Hosted by {car.owner.name || 'Owner'}</h3>
                      <div className="owner-stats">
                        {car.owner.rating && <span><i className="fas fa-star"></i> {car.owner.rating}</span>}
                        {car.owner.response_rate && <span><i className="fas fa-comment"></i> {car.owner.response_rate}% response rate</span>}
                        {car.owner.response_time && <span><i className="fas fa-clock"></i> {car.owner.response_time}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="divider-line"></div>

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div className="features-section">
                  <h2>Features</h2>
                  <div className="features-grid">
                    {car.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <i className="fas fa-check"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="divider-line"></div>

              {/* Car Specifications */}
              <div className="specs-section">
                <h2>Car Specifications</h2>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">{car.brand || car.make || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Model</span>
                    <span className="spec-value">{car.model || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Year</span>
                    <span className="spec-value">{car.year ? String(car.year) : 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Fuel Type</span>
                    <span className="spec-value">{car.fuel_type ? String(car.fuel_type).charAt(0).toUpperCase() + String(car.fuel_type).slice(1) : 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">{car.transmission ? String(car.transmission).charAt(0).toUpperCase() + String(car.transmission).slice(1) : 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Seats</span>
                    <span className="spec-value">{car.seats !== undefined && car.seats !== null ? String(car.seats) : 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Doors</span>
                    <span className="spec-value">{car.doors !== undefined && car.doors !== null ? String(car.doors) : 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Mileage</span>
                    <span className="spec-value">
                      {car.mileage !== undefined && car.mileage !== null
                        ? `${Number(car.mileage).toLocaleString()} miles`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Color</span>
                    <span className="spec-value">{car.color ? String(car.color).charAt(0).toUpperCase() + String(car.color).slice(1) : 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Type</span>
                    <span className="spec-value">{car.vehicle_type || car.category ? String(car.vehicle_type || car.category).charAt(0).toUpperCase() + String(car.vehicle_type || car.category).slice(1) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="divider-line"></div>

              {/* Description */}
              <div className="description-section">
                <h2>About this car</h2>
                <p>{car.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="booking-card-sticky">
            <div className="booking-card-new">
              {/* Price Section */}
              <div className="booking-price-section">
                <div className="price-main">
                  <span className="price-currency">$</span>
                  <span className="price-amount-new">
                    {(() => {
                      const rawPrice =
                        typeof car.price === 'number'
                          ? car.price
                          : parseFloat(car.price || car.daily_rate || 0);
                      return rawPrice.toFixed(2);
                    })()}
                  </span>
                </div>
                <div className="price-label">per day</div>
              </div>

              {/* Rating Section */}
              {car.rating && (
                <div className="booking-rating-section">
                  <div className="rating-display">
                    <i className="fas fa-star rating-star"></i>
                    <span className="rating-value-new">{car.rating || 'New'}</span>
                    {car.reviews !== undefined && car.reviews !== null && (
                      <span className="review-count-new">({car.reviews || 0} {car.reviews === 1 ? 'review' : 'reviews'})</span>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="booking-quick-info">
                <div className="quick-info-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Instant booking</span>
                </div>
                <div className="quick-info-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Free cancellation</span>
                </div>
              </div>

              {/* Action Button */}
              {car.is_active !== false ? (
                <>
                  <Link to={`/book/${car.id}`} className="book-btn-new">
                    <i className="fas fa-calendar-check"></i>
                    <span>Reserve Now</span>
                  </Link>
                  <div className="booking-security-note">
                    <i className="fas fa-lock"></i>
                    <span>Secure booking • No payment required now</span>
                  </div>
                </>
              ) : (
                <div className="unavailable-booking-wrapper">
                  <button className="unavailable-btn-new" disabled>
                    <i className="fas fa-ban"></i>
                    <span>Not Available</span>
                  </button>
                  <div className="unavailable-info-box">
                    <i className="fas fa-info-circle"></i>
                    <p>This car is currently not available for booking. Please check back later or browse other available cars.</p>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="booking-additional-info">
                <div className="info-divider"></div>
                <div className="additional-info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <div className="info-label">Pickup Location</div>
                    <div className="info-value">
                      {car.locationString || 'Location not available'}
                    </div>
                  </div>
                </div>
                {car.owner && (
                  <div className="additional-info-item">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="info-label">Hosted by</div>
                      <div className="info-value">{car.owner.name || 'Owner'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && (
        <ImageGallery
          images={carImages}
          currentIndex={currentImageIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}

export default CarDetail;

