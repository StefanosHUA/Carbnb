import React from 'react';
import { Link } from 'react-router-dom';

function CarCard({ car }) {
  return (
    <Link to={`/car/${car.id}`} className="car-card">
      <div className="car-image-container">
        <img src={car.image} alt={car.name} className="car-image" />
        <button className="favorite-btn">
          <i className="far fa-heart"></i>
        </button>
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
        <p className="car-location">{car.location}</p>
        <p className="car-desc">{car.description}</p>
        <div className="car-price-container">
          <span className="car-price">${car.price}</span>
          <span className="price-period"> night</span>
        </div>
      </div>
    </Link>
  );
}

export default CarCard; 