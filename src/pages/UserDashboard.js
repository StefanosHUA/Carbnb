import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { CarCardSkeleton } from '../components/LoadingSkeleton';
import { authAPI, bookingsAPI, vehiclesAPI } from '../utils/api';
import ProfileSettings from '../components/ProfileSettings';
import PasswordSettings from '../components/PasswordSettings';
import EmailUsernameSettings from '../components/EmailUsernameSettings';
import DocumentManagement from '../components/DocumentManagement';
import { getAllCarImages } from '../utils/carImages';

function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastContext();
  const [user, setUser] = useState(null);
  // Default to 'profile' tab, or use tab from location state
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('carbnb_user');
    if (!savedUser) {
      toast.warning('Please log in to access your dashboard');
      navigate('/login');
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchUserData();
  }, []);

  // Handle tab state from navigation
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile with documents
      try {
        const userProfile = await authAPI.getMyProfile();
        setUser(userProfile);
        // Update localStorage with latest user data
        if (userProfile) {
          const savedUser = localStorage.getItem('carbnb_user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            localStorage.setItem('carbnb_user', JSON.stringify({
              ...userData,
              ...userProfile
            }));
          }
        }
      } catch (error) {
        // Fallback to basic profile if getMyProfile fails
        const userProfile = await authAPI.getProfile();
        setUser(userProfile);
      }
      
      // Fetch user bookings
      const bookingsData = await bookingsAPI.getMyBookings();
      // Backend returns BookingListResponse with { bookings: [...], pagination: {...} }
      let bookings = bookingsData.bookings || (Array.isArray(bookingsData) ? bookingsData : []);
      
      // Fetch vehicle details for each booking if vehicle_id is present
      if (bookings.length > 0) {
        const bookingsWithCars = await Promise.all(bookings.map(async (booking) => {
          try {
            // If booking already has vehicle/car object, use it
            if (booking.vehicle || booking.car) {
              const vehicle = booking.vehicle || booking.car;
              
              // Normalize location
              let locationStr = vehicle.location;
              if (vehicle.location && typeof vehicle.location === 'object') {
                const loc = vehicle.location;
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
              
              // Normalize images
              let images = [];
              // Use utility function to get all car images (prioritizes uploaded media)
              images = getAllCarImages(vehicle);
              
              const vehicleName = vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Car';
              
              return {
                ...booking,
                car: {
                  id: vehicle.id || booking.vehicle_id,
                  name: vehicleName,
                  image: images[0],
                  location: locationStr
                },
                total: booking.total_cost || booking.total_amount || booking.total || 0
              };
            } else if (booking.vehicle_id) {
              // Fetch vehicle details
              const vehicleData = await vehiclesAPI.getById(booking.vehicle_id);
              const vehicle = vehicleData.vehicle || vehicleData.data || vehicleData;
              
              // Normalize location
              let locationStr = vehicle.location;
              if (vehicle.location && typeof vehicle.location === 'object') {
                const loc = vehicle.location;
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
              
              // Normalize images
              let images = [];
              // Use utility function to get all car images (prioritizes uploaded media)
              images = getAllCarImages(vehicle);
              
              const vehicleName = vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Car';
              
              return {
                ...booking,
                car: {
                  id: vehicle.id,
                  name: vehicleName,
                  image: images[0],
                  location: locationStr
                },
                total: booking.total_cost || booking.total_amount || booking.total || 0
              };
            } else {
              // Booking without vehicle info
              return {
                ...booking,
                car: {
                  id: booking.vehicle_id || null,
                  name: 'Vehicle',
                  image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
                  location: 'Location not available'
                },
                total: booking.total_cost || booking.total_amount || booking.total || 0
              };
            }
          } catch (error) {
            console.error(`Error fetching vehicle for booking ${booking.id}:`, error);
            return {
              ...booking,
              car: {
                id: booking.vehicle_id || null,
                name: 'Vehicle',
                image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
                location: 'Location not available'
              },
              total: booking.total_cost || booking.total_amount || booking.total || 0
            };
          }
        }));
        
        setBookings(bookingsWithCars);
      } else {
        setBookings([]);
      }
      
      // Fetch favorite cars from localStorage (favorites stored as IDs)
      // In a real app, this would come from a favorites API endpoint
      const favoriteIds = JSON.parse(localStorage.getItem('carbnb_favorites') || '[]');
      if (favoriteIds.length > 0) {
        // Fetch vehicle details for each favorite ID
        const favoriteCarsPromises = favoriteIds.map(async (carId) => {
          try {
            const carData = await vehiclesAPI.getById(carId);
            const car = carData.vehicle || carData.data || carData;
            
            // Normalize location
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
            
            // Normalize car name and price
            const carName = car.name || `${car.make || ''} ${car.model || ''}`.trim() || 'Car';
            const carPrice = car.price || car.daily_rate || 0;
            
            // Normalize images
            let images = [];
            if (car.images && Array.isArray(car.images) && car.images.length > 0) {
              images = car.images;
            } else if (car.media && Array.isArray(car.media) && car.media.length > 0) {
              images = car.media
                .filter(m => m.media_url || m.url || m.image)
                .map(m => m.media_url || m.url || m.image);
            } else if (car.image) {
              images = [car.image];
            } else {
              images = ['https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80'];
            }
            
            return {
              id: car.id,
              name: carName,
              price: carPrice,
              image: images[0],
              location: locationStr,
              rating: car.rating || 0
            };
          } catch (error) {
            console.error(`Error fetching favorite car ${carId}:`, error);
            return null;
          }
        });
        
        const favoriteCars = await Promise.all(favoriteCarsPromises);
        setFavorites(favoriteCars.filter(car => car !== null));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
        toast.error(error.message || 'Failed to load dashboard data.');
      } else if (error.status === 0) {
        toast.error('Cannot connect to backend services. Please ensure the backend is running.');
      } else {
        toast.error('Failed to load dashboard data.');
      }
      
      // Set empty arrays instead of mock data
      setBookings([]);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      // Backend expects POST /api/v1/bookings/:id/cancel with optional reason query param
      await bookingsAPI.cancel(bookingId, 'User requested cancellation');
      setBookings(bookings.filter(b => b.id !== bookingId));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: 'success', text: 'Confirmed' },
      pending: { class: 'warning', text: 'Pending' },
      upcoming: { class: 'info', text: 'Upcoming' },
      completed: { class: 'default', text: 'Completed' },
      cancelled: { class: 'error', text: 'Cancelled' }
    };
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const config = statusConfig[normalizedStatus] || { class: 'default', text: normalizedStatus || 'Pending' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <CarCardSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user.first_name}!</h1>
            <p>Manage your bookings, favorites, and account</p>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i>
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <i className="fas fa-heart"></i>
            Favorites
            {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-calendar"></i>
            My Bookings
            {bookings.length > 0 && <span className="badge">{bookings.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <i className="fas fa-file-alt"></i>
            Documents
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <ProfileSettings 
                user={user} 
                onUpdate={(updatedUser) => {
                  setUser(updatedUser);
                  const savedUser = localStorage.getItem('carbnb_user');
                  if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    localStorage.setItem('carbnb_user', JSON.stringify({
                      ...userData,
                      ...updatedUser
                    }));
                    window.dispatchEvent(new Event('userUpdated'));
                  }
                }}
              />
              <div style={{ marginTop: '40px' }}>
                <EmailUsernameSettings 
                  user={user}
                  onUpdate={(updatedUser) => {
                    setUser(updatedUser);
                    const savedUser = localStorage.getItem('carbnb_user');
                    if (savedUser) {
                      const userData = JSON.parse(savedUser);
                      localStorage.setItem('carbnb_user', JSON.stringify({
                        ...userData,
                        ...updatedUser
                      }));
                      window.dispatchEvent(new Event('userUpdated'));
                    }
                  }}
                />
                <div style={{ marginTop: '40px' }}>
                  <PasswordSettings />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-tab">
              <div className="section-header">
                <h2>My Favorites</h2>
              </div>

              {favorites.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-heart"></i>
                  <h3>No favorites yet</h3>
                  <p>Start adding cars to your favorites!</p>
                  <Link to="/cars" className="primary-btn">
                    Browse Cars
                  </Link>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favorites.map(car => (
                    <Link key={car.id} to={`/car/${car.id}`} className="favorite-card">
                      <img src={car.image} alt={car.name} />
                      <div className="favorite-info">
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
                        <div className="favorite-footer">
                          <div className="car-rating">
                            <span className="star">★</span>
                            <span>{car.rating}</span>
                          </div>
                          <span className="car-price">${car.price}/day</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-tab">
              <div className="section-header">
                <h2>My Bookings</h2>
                <Link to="/cars" className="browse-btn">
                  <i className="fas fa-search"></i>
                  Browse Cars
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-calendar-times"></i>
                  <h3>No bookings yet</h3>
                  <p>Start exploring and book your first car!</p>
                  <Link to="/cars" className="primary-btn">
                    Browse Cars
                  </Link>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                      <img src={booking.car.image} alt={booking.car.name} />
                      <div className="booking-info">
                        <div className="booking-header">
                          <div>
                            <h3>{booking.car.name}</h3>
                            <p><i className="fas fa-map-marker-alt"></i> {booking.car.location}</p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="booking-dates">
                          <div className="date-item">
                            <label>Pickup</label>
                            <strong>{new Date(booking.start_date || booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                          </div>
                          <div className="date-item">
                            <label>Return</label>
                            <strong>{new Date(booking.end_date || booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                          </div>
                          <div className="date-item">
                            <label>Total</label>
                            <strong>${(booking.total_amount || booking.total_cost || booking.total || 0).toFixed(2)}</strong>
                          </div>
                        </div>
                        <div className="booking-actions">
                          <Link to={`/car/${booking.car.id}`} className="action-link">
                            View Car
                          </Link>
                          {(booking.status === 'upcoming' || booking.status === 'confirmed' || booking.status === 'pending') && booking.can_be_cancelled !== false && (
                            <button
                              className="cancel-btn"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="documents-tab">
              <DocumentManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

