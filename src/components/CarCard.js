import React, { useState, memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageGallery from './ImageGallery';
import { getPrimaryCarImage, getAllCarImages } from '../utils/carImages';

const CarCard = memo(function CarCard({ car }) {
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Get all car images (prioritizes uploaded media)
  const carImages = getAllCarImages(car);
  const primaryImage = getPrimaryCarImage(car);

  // Load favorite status from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('carbnb_favorites') || '[]');
    setIsFavorite(favorites.includes(car.id));
  }, [car.id]);

  const handleGalleryOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (carImages.length > 0) {
      setShowGallery(true);
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem('carbnb_favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      // Remove from favorites
      newFavorites = favorites.filter(id => id !== car.id);
    } else {
      // Add to favorites
      newFavorites = [...favorites, car.id];
    }
    
    localStorage.setItem('carbnb_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  // Validate car.id before creating link
  if (!car.id) {
    console.error('CarCard: car.id is missing', car);
    return null; // Don't render card if id is missing
  }

  return (
    <>
      <Link to={`/car/${car.id}`} className="car-card">
        <div className="car-image-container">
          <img 
            src={primaryImage} 
            alt={car.name} 
            className="car-image"
          />
          <button 
            className="favorite-btn"
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>
          {carImages.length > 1 && (
            <div className="image-count-badge" onClick={handleGalleryOpen} title="View all images">
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