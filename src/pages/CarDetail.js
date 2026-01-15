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

  useEffect(() => {
    fetchCarDetails();
    checkFavoriteStatus();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const carData = await vehiclesAPI.getById(id);
      // Handle both direct object and nested data property
      const car = carData.vehicle || carData.data || carData;
      // Ensure car has required structure
      if (car) {
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
        // Normalize location - convert object to string if needed
        if (car.location && typeof car.location === 'object') {
          const loc = car.location;
          if (loc.city && loc.state) {
            car.location = `${loc.city}, ${loc.state}`;
          } else if (loc.city) {
            car.location = loc.city;
          } else if (loc.state) {
            car.location = loc.state;
          } else if (loc.name) {
            car.location = loc.name;
          } else if (loc.address) {
            car.location = loc.address;
          } else {
            car.location = 'Location not available';
          }
        } else if (!car.location) {
          car.location = 'Location not available';
        }
        
        // Normalize car name from make/model if name doesn't exist
        if (!car.name) {
          car.name = `${car.make || ''} ${car.model || ''}`.trim() || 'Car';
        }
        
        // Normalize price from daily_rate if price doesn't exist
        if (!car.price) {
          car.price = car.daily_rate || 0;
        }
        
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
                    <Link to={`/cars?location=${(() => {
                      if (!car.location) return '';
                      if (typeof car.location === 'string') return car.location;
                      const loc = car.location;
                      if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
                      if (loc.city) return loc.city;
                      if (loc.name) return loc.name;
                      return '';
                    })()}`} className="car-location-link">
                      <i className="fas fa-map-marker-alt"></i>
                      {(() => {
                        if (!car.location) return 'Location not available';
                        if (typeof car.location === 'string') return car.location;
                        const loc = car.location;
                        if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
                        if (loc.city) return loc.city;
                        if (loc.state) return loc.state;
                        if (loc.name) return loc.name;
                        if (loc.address) return loc.address;
                        return 'Location not available';
                      })()}
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
                    <span className="spec-value">{car.brand}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Model</span>
                    <span className="spec-value">{car.model}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Year</span>
                    <span className="spec-value">{car.year}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Fuel Type</span>
                    <span className="spec-value">{car.fuel_type}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">{car.transmission}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Seats</span>
                    <span className="spec-value">{car.seats}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Doors</span>
                    <span className="spec-value">{car.doors}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Mileage</span>
                    <span className="spec-value">{car.mileage?.toLocaleString()} miles</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Color</span>
                    <span className="spec-value">{car.color}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Type</span>
                    <span className="spec-value">{car.vehicle_type}</span>
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
                  <span className="price-amount-new">{typeof car.price === 'number' ? car.price.toFixed(2) : parseFloat(car.price || 0).toFixed(2)}</span>
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
                      {(() => {
                        if (!car.location) return 'Location not available';
                        if (typeof car.location === 'string') return car.location;
                        const loc = car.location;
                        if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
                        if (loc.city) return loc.city;
                        if (loc.state) return loc.state;
                        if (loc.name) return loc.name;
                        if (loc.address) return loc.address;
                        return 'Location not available';
                      })()}
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

