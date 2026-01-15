import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { paymentsAPI } from '../utils/api';

function PaymentForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToastContext();
  const { bookingData, car } = location.state || {};
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'USA'
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [rememberCard, setRememberCard] = useState(false);

  useEffect(() => {
    if (!bookingData || !car) {
      // Try to get from sessionStorage as fallback
      const savedBooking = sessionStorage.getItem(`booking_${id}`);
      if (savedBooking) {
        try {
          const parsed = JSON.parse(savedBooking);
          // Note: In a real app, you'd set state here or use a state management solution
          console.log('Found saved booking data:', parsed);
        } catch (e) {
          console.error('Error parsing saved booking:', e);
        }
      } else {
        toast.error('Booking information missing. Please start over.');
        navigate(`/book/${id}`);
      }
    }
  }, [bookingData, car, navigate, toast, id]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [month, year] = paymentData.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiry < now) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!paymentData.cardholderName || paymentData.cardholderName.length < 3) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    if (!paymentData.billingAddress) {
      newErrors.billingAddress = 'Please enter billing address';
    }

    if (!paymentData.city) {
      newErrors.city = 'Please enter city';
    }

    if (!paymentData.zipCode || !/^\d{5}(-\d{4})?$/.test(paymentData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsProcessing(true);

    try {
      // Get current user
      const savedUser = localStorage.getItem('carbnb_user');
      const user = savedUser ? JSON.parse(savedUser) : null;

      // Prepare payment payload
      const paymentPayload = {
        vehicle_id: parseInt(id),
        booking_id: bookingData.bookingId,
        user_id: user?.id || null,
        amount: bookingData.total,
        payment_method: {
          card_number: paymentData.cardNumber.replace(/\s/g, ''),
          expiry_date: paymentData.expiryDate,
          cvv: paymentData.cvv,
          cardholder_name: paymentData.cardholderName
        },
        billing_address: {
          address: paymentData.billingAddress,
          city: paymentData.city,
          zip_code: paymentData.zipCode,
          country: paymentData.country
        }
      };

      // Process payment through API
      const paymentResult = await paymentsAPI.process(paymentPayload);

      toast.success('Payment processed successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/bookings', {
          state: { bookingConfirmed: true, paymentId: paymentResult.id || paymentResult.payment_id }
        });
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData || !car) {
    return null;
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Payment</h1>
          <p>Secure payment powered by Stripe</p>
        </div>

        <div className="payment-content">
          {/* Left Column - Payment Form */}
          <div className="payment-form-section">
            <div className="payment-method-card">
              <h2>Payment Method</h2>
              
              <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <div className="input-with-icon">
                    <i className="fas fa-credit-card"></i>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                  </div>
                  {errors.cardNumber && (
                    <span className="error-text">{errors.cardNumber}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={errors.expiryDate ? 'error' : ''}
                    />
                    {errors.expiryDate && (
                      <span className="error-text">{errors.expiryDate}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength="4"
                        className={errors.cvv ? 'error' : ''}
                      />
                      <i className="fas fa-lock" title="Security code"></i>
                    </div>
                    {errors.cvv && (
                      <span className="error-text">{errors.cvv}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={paymentData.cardholderName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={errors.cardholderName ? 'error' : ''}
                  />
                  {errors.cardholderName && (
                    <span className="error-text">{errors.cardholderName}</span>
                  )}
                </div>

                <div className="divider-line"></div>

                <h3>Billing Address</h3>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={paymentData.billingAddress}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className={errors.billingAddress ? 'error' : ''}
                  />
                  {errors.billingAddress && (
                    <span className="error-text">{errors.billingAddress}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={paymentData.city}
                      onChange={handleChange}
                      placeholder="San Francisco"
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && (
                      <span className="error-text">{errors.city}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={paymentData.zipCode}
                      onChange={handleChange}
                      placeholder="94102"
                      maxLength="10"
                      className={errors.zipCode ? 'error' : ''}
                    />
                    {errors.zipCode && (
                      <span className="error-text">{errors.zipCode}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <select
                    name="country"
                    value={paymentData.country}
                    onChange={handleChange}
                  >
                    <option value="USA">United States</option>
                    <option value="CAN">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AUS">Australia</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberCard}
                      onChange={(e) => setRememberCard(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Save card for future bookings
                  </label>
                </div>

                <button
                  type="submit"
                  className="pay-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock"></i>
                      Pay ${bookingData.total}
                    </>
                  )}
                </button>

                <div className="payment-security">
                  <i className="fas fa-shield-alt"></i>
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="payment-summary-card">
            <div className="summary-header">
              <h3>Booking Summary</h3>
            </div>
            
            <div className="summary-car-info">
              <img src={car.image} alt={car.name} />
              <div>
                <h4>{car.name}</h4>
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

            <div className="summary-dates">
              <div className="summary-date-item">
                <label>Pickup</label>
                <strong>{new Date(bookingData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div className="summary-date-item">
                <label>Return</label>
                <strong>{new Date(bookingData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;

