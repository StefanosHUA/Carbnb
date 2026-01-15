import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import ImageGallery from './ImageGallery';
import { getPrimaryCarImage, getAllCarImages } from '../utils/carImages';

const CarCard = memo(function CarCard({ car }) {
  const [showGallery, setShowGallery] = useState(false);
  
  // Get all car images (prioritizes uploaded media)
  const carImages = getAllCarImages(car);
  const primaryImage = getPrimaryCarImage(car);

  const handleImageClick = (e) => {
    e.preventDefault();
    if (carImages.length > 0) {
      setShowGallery(true);
    }
  };

  return (
    <>
      <Link to={`/car/${car.id}`} className="car-card">
        <div className="car-image-container">
          <img 
            src={primaryImage} 
            alt={car.name} 
            className="car-image"
            onClick={handleImageClick}
            style={{ cursor: carImages.length > 0 ? 'pointer' : 'default' }}
          />
          <button 
            className="favorite-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <i className="far fa-heart"></i>
          </button>
          {carImages.length > 1 && (
            <div className="image-count-badge">
              <i className="fas fa-images"></i>
              <span>{carImages.length}</span>
            </div>
          )}
        </div>
      <div className="car-info">
        <div className="car-header">
          <h3 className="car-name">{car.name}</h3>
          <div className="car-rating">
            <span className="star">★</span>
            <span className="rating-number">{car.rating}</span>
            <span className="review-count">({car.reviews})</span>
          </div>
        </div>
        <p className="car-location">
          {(() => {
            if (!car.location) return 'Location not available';
            if (typeof car.location === 'string') return car.location;
            // Handle location object
            const loc = car.location;
            if (loc.city && loc.state) {
              return `${loc.city}, ${loc.state}`;
            } else if (loc.city) {
              return loc.city;
            } else if (loc.state) {
              return loc.state;
            } else if (loc.name) {
              return loc.name;
            } else if (loc.address) {
              return loc.address;
            }
            return 'Location not available';
          })()}
        </p>
        <p className="car-desc">{car.description}</p>
        <div className="car-price-container">
          <span className="car-price">${car.price}</span>
          <span className="price-period"> night</span>
        </div>
      </div>
    </Link>
    {showGallery && (
      <ImageGallery
        images={carImages}
        currentIndex={0}
        onClose={() => setShowGallery(false)}
      />
    )}
    </>
  );
});

export default CarCard; 