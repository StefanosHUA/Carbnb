import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { CarCardSkeleton } from '../components/LoadingSkeleton';
import { vehiclesAPI, bookingsAPI } from '../utils/api';

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Dates, 2: Review, 3: Payment
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    days: 0,
    subtotal: 0,
    serviceFee: 0,
    total: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate) {
      calculatePricing();
    }
  }, [bookingData.startDate, bookingData.endDate, car]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const carData = await vehiclesAPI.getById(id);
      // Handle both direct object and nested data property
      const car = carData.vehicle || carData.data || carData;
      
      // Normalize price from daily_rate if price doesn't exist
      if (!car.price && car.daily_rate !== undefined) {
        car.price = parseFloat(car.daily_rate) || 0;
      } else if (!car.price) {
        car.price = 0;
      } else {
        car.price = parseFloat(car.price) || 0;
      }
      
      setCar(car);
    } catch (error) {
      console.error('Error fetching car details:', error);
      if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
        toast.error(error.message || 'Failed to load car details.');
      } else if (error.status === 0) {
        toast.error('Cannot connect to car service. Please ensure the backend is running.');
      } else {
        toast.error('Failed to load car details.');
      }
      // Don't set mock data - let the component show error state
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!car || !bookingData.startDate || !bookingData.endDate) return;

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    
    if (end <= start) {
      setErrors({ dates: 'End date must be after start date' });
      return;
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const price = parseFloat(car.price || car.daily_rate || 0);
    const subtotal = days * price;
    const serviceFee = Math.round(subtotal * 0.12); // 12% service fee
    const total = subtotal + serviceFee;

    setBookingData(prev => ({
      ...prev,
      days,
      subtotal,
      serviceFee,
      total
    }));

    setErrors({});
  };

  const handleDateChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors({});
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    if (!bookingData.startDate) return getMinDate();
    const start = new Date(bookingData.startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!bookingData.startDate || !bookingData.endDate) {
        setErrors({ dates: 'Please select both start and end dates' });
        return;
      }
      if (bookingData.days <= 0) {
        setErrors({ dates: 'End date must be after start date' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get current user
      const savedUser = localStorage.getItem('carbnb_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      
      // Backend BookingCreate schema expects: vehicle_id, start_date, end_date, notes (optional)
      // Backend calculates total_amount, daily_rate, etc. from vehicle data
      // user_id is automatically extracted from X-User-Id header
      const bookingPayload = {
        vehicle_id: parseInt(id),
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        notes: bookingData.notes || null
      };
      
      const bookingResult = await bookingsAPI.create(bookingPayload);
      
      // Save to sessionStorage as backup
      sessionStorage.setItem(`booking_${id}`, JSON.stringify({ 
        bookingData: { ...bookingData, bookingId: bookingResult.id || bookingResult.booking_id },
        car 
      }));
      
      toast.success('Booking confirmed! Redirecting to payment...');
      
      setTimeout(() => {
        navigate(`/payment/${id}`, { 
          state: { 
            bookingData: { ...bookingData, bookingId: bookingResult.id || bookingResult.booking_id },
            car 
          } 
        });
      }, 1500);
    } catch (error) {
      toast.error(error.message || 'Failed to create booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <CarCardSkeleton />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="error-state">
            <h2>Car not found</h2>
            <Link to="/cars">Browse All Cars</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Progress Steps */}
        <div className="booking-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Select Dates</span>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Review</span>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Payment</span>
          </div>
        </div>

        <div className="booking-content">
          {/* Left Column - Booking Form */}
          <div className="booking-form-section">
            {currentStep === 1 && (
              <div className="booking-step">
                <h2>Select your dates</h2>
                <p>Choose your pickup and return dates</p>
                
                <div className="date-selection">
                  <div className="date-input-group">
                    <label>Pickup Date</label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      min={getMinDate()}
                      className={errors.dates ? 'error' : ''}
                    />
                  </div>
                  <div className="date-input-group">
                    <label>Return Date</label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      min={getMinEndDate()}
                      className={errors.dates ? 'error' : ''}
                    />
                  </div>
                </div>
                
                {errors.dates && (
                  <div className="error-message">{errors.dates}</div>
                )}

                {bookingData.days > 0 && (
                  <div className="booking-summary-preview">
                    <div className="summary-row">
                      <span>${(car.price || car.daily_rate || 0).toFixed(2)} x {bookingData.days} {bookingData.days === 1 ? 'day' : 'days'}</span>
                      <span>${bookingData.subtotal}</span>
                    </div>
                    <div className="summary-row">
                      <span>Service fee</span>
                      <span>${bookingData.serviceFee}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>${bookingData.total}</span>
                    </div>
                  </div>
                )}

                <button 
                  className="continue-btn"
                  onClick={handleContinue}
                  disabled={!bookingData.startDate || !bookingData.endDate || bookingData.days <= 0}
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="booking-step">
                <h2>Review your booking</h2>
                
                <div className="review-section">
                  <div className="review-car-card">
                    <img src={car.image} alt={car.name} />
                    <div className="review-car-info">
                      <h3>{car.name}</h3>
                      <p><i className="fas fa-map-marker-alt"></i> {(() => {
                        if (!car.location) return 'Location not available';
                        if (typeof car.location === 'string') return car.location;
                        const loc = car.location;
                        if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
                        if (loc.city) return loc.city;
                        if (loc.state) return loc.state;
                        if (loc.name) return loc.name;
                        if (loc.address) return loc.address;
                        return 'Location not available';
                      })()}</p>
                    </div>
                  </div>

                  <div className="review-dates">
                    <div className="review-date-item">
                      <label>Pickup</label>
                      <div>
                        <strong>{new Date(bookingData.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                        <span>Check-in: 10:00 AM</span>
                      </div>
                    </div>
                    <div className="review-date-item">
                      <label>Return</label>
                      <div>
                        <strong>{new Date(bookingData.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                        <span>Check-out: 10:00 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="review-pricing">
                    <h3>Price Breakdown</h3>
                    <div className="summary-row">
                      <span>${(car.price || car.daily_rate || 0).toFixed(2)} x {bookingData.days} {bookingData.days === 1 ? 'day' : 'days'}</span>
                      <span>${bookingData.subtotal}</span>
                    </div>
                    <div className="summary-row">
                      <span>Service fee</span>
                      <span>${bookingData.serviceFee}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>${bookingData.total}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button className="back-btn" onClick={() => setCurrentStep(1)}>
                    Back
                  </button>
                  <button className="continue-btn" onClick={handleContinue}>
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="booking-step">
                <h2>Complete your booking</h2>
                <p>Review your details and confirm your booking</p>
                
                <form onSubmit={handleBookingSubmit} className="booking-confirm-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" required />
                  </div>
                  <div className="form-group">
                    <label>Special Requests (Optional)</label>
                    <textarea rows="3" placeholder="Any special requests or notes..."></textarea>
                  </div>

                  <div className="booking-actions">
                    <button type="button" className="back-btn" onClick={() => setCurrentStep(2)}>
                      Back
                    </button>
                    <button type="submit" className="continue-btn">
                      Confirm & Pay
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary Card */}
          <div className="booking-summary-card">
            <div className="summary-car-info">
              <img src={car.image} alt={car.name} />
              <div>
                <h3>{car.name}</h3>
                <div className="car-rating">
                  <span className="star">★</span>
                  <span>{car.rating}</span>
                  <span>({car.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {bookingData.days > 0 && (
              <div className="summary-pricing">
                <div className="summary-row">
                  <span>${car.price} x {bookingData.days} {bookingData.days === 1 ? 'day' : 'days'}</span>
                  <span>${bookingData.subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Service fee</span>
                  <span>${bookingData.serviceFee}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${bookingData.total}</span>
                </div>
              </div>
            )}

            <div className="summary-note">
              <i className="fas fa-shield-alt"></i>
              <span>Free cancellation up to 24 hours before pickup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;

