import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { CarCardSkeleton } from '../components/LoadingSkeleton';
import { authAPI, bookingsAPI, vehiclesAPI, searchAPI } from '../utils/api';
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
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Define loadFavorites function before useEffect hooks
  // Optimized: Fetch favorite cars directly by ID in parallel for faster loading
  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      // Fetch favorite car IDs from localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('carbnb_favorites') || '[]');
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoadingFavorites(false);
        return;
      }
      
      console.log(`[UserDashboard] Loading ${favoriteIds.length} favorite cars directly from database`);
      
      // Strategy: Fetch all active cars once, then filter by favorite IDs
      // This is faster than individual requests and works for all users (not just owners)
      // Using database query (not Elasticsearch) for faster response
      try {
        const filters = { is_active: true, limit: 500 }; // Reduced limit for faster query
        const vehicles = await vehiclesAPI.getAll(filters);
        const carsData = Array.isArray(vehicles) ? vehicles : (vehicles.data || vehicles.vehicles || []);
        
      console.log(`[UserDashboard] Retrieved ${carsData.length} active vehicles from database`);
      
      // Use Set for O(1) lookup instead of O(n) array.includes() - much faster for large datasets
      const favoriteIdsSet = new Set(favoriteIds.map(id => parseInt(id)));
      
      // Filter to only include favorites - using Set for O(1) lookup
      const favoriteCars = carsData.filter(car => {
        const carId = parseInt(car.id || car.vehicle_id);
        return favoriteIdsSet.has(carId);
      });
        
        console.log(`[UserDashboard] Found ${favoriteCars.length} favorite cars in database`);
        
        // Normalize favorite cars
        const normalizedCars = favoriteCars.map(car => {
          const carId = parseInt(car.id || car.vehicle_id);
          
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
          
          // Get images using utility function
          const images = getAllCarImages(car);
          
          return {
            id: carId,
            name: carName,
            price: carPrice,
            image: images[0] || car.primary_image_url || car.image || 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
            location: locationStr,
            rating: car.rating || 0
          };
        });
        
        setFavorites(normalizedCars);
      } catch (error) {
        console.error('[UserDashboard] Error fetching favorites from database:', error);
        toast.error('Failed to load favorites. Please try again.');
        setFavorites([]);
      }
      
    } catch (error) {
      console.error('[UserDashboard] Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('carbnb_user');
    if (!savedUser) {
      toast.warning('Please log in to access your dashboard');
      navigate('/login');
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchUserData();
    // Preload favorites and bookings immediately when user enters dashboard for faster tab switching
    loadFavorites();
    loadBookings();
  }, []);

  // Handle tab state from navigation
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // Refresh data when respective tab is active (data is preloaded on mount, this refreshes for latest data)
  useEffect(() => {
    if (activeTab === 'favorites') {
      // Refresh favorites when favorites tab is clicked (data already preloaded on mount)
      loadFavorites();
    } else if (activeTab === 'bookings') {
      // Refresh bookings when bookings tab is clicked (data already preloaded on mount)
      loadBookings();
    }
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      console.log('[UserDashboard] Loading bookings...');
      // Fetch user bookings
      const bookingsData = await bookingsAPI.getMyBookings();
      // Backend returns BookingListResponse with { bookings: [...], pagination: {...} }
      let bookings = bookingsData.bookings || (Array.isArray(bookingsData) ? bookingsData : []);
      
      // Fetch vehicle details for each booking if vehicle_id is present
      // Optimized: Batch fetch all vehicles at once, then create a Map for O(1) lookup
      if (bookings.length > 0) {
        // Collect all unique vehicle IDs from bookings
        const vehicleIds = [...new Set(bookings
          .map(b => b.vehicle_id || (b.vehicle?.id) || (b.car?.id))
          .filter(id => id !== null && id !== undefined)
        )];
        
        console.log(`[UserDashboard] Loading ${vehicleIds.length} unique vehicles for ${bookings.length} bookings`);
        
        // Batch fetch all vehicles at once (much faster than individual requests)
        let vehiclesMap = new Map();
        if (vehicleIds.length > 0) {
          try {
            // Fetch all active vehicles, then filter by vehicle IDs
            const filters = { is_active: true, limit: 500 };
            const vehicles = await vehiclesAPI.getAll(filters);
            const carsData = Array.isArray(vehicles) ? vehicles : (vehicles.data || vehicles.vehicles || []);
            
            // Create a Map for O(1) lookup by vehicle ID
            carsData.forEach(car => {
              const carId = parseInt(car.id || car.vehicle_id);
              if (carId && vehicleIds.includes(carId)) {
                vehiclesMap.set(carId, car);
              }
            });
            
            console.log(`[UserDashboard] Loaded ${vehiclesMap.size} vehicles into map`);
          } catch (error) {
            console.warn('[UserDashboard] Batch fetch failed, falling back to individual requests:', error);
          }
        }
        
        // Process bookings with optimized vehicle lookup
        const bookingsWithCars = bookings.map(booking => {
          try {
            let vehicle = null;
            const vehicleId = booking.vehicle_id || booking.vehicle?.id || booking.car?.id;
            
            // Try to get vehicle from map first (O(1) lookup)
            if (vehicleId && vehiclesMap.has(parseInt(vehicleId))) {
              vehicle = vehiclesMap.get(parseInt(vehicleId));
            } else if (booking.vehicle || booking.car) {
              // Fallback to booking's vehicle/car object
              vehicle = booking.vehicle || booking.car;
            }
            
            if (vehicle) {
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
              const images = getAllCarImages(vehicle);
              
              const vehicleName = vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Car';
              
              return {
                ...booking,
                car: {
                  id: parseInt(vehicle.id || vehicle.vehicle_id || vehicleId),
                  vehicle_id: parseInt(vehicle.id || vehicle.vehicle_id || vehicleId),
                  name: vehicleName,
                  make: vehicle.make || '',
                  model: vehicle.model || '',
                  brand: vehicle.make || vehicle.brand || '',
                  category: vehicle.category || vehicle.vehicle_type || '',
                  vehicle_type: vehicle.category || vehicle.vehicle_type || '',
                  price: vehicle.price || vehicle.daily_rate || 0,
                  daily_rate: vehicle.daily_rate || vehicle.price || 0,
                  image: images[0] || vehicle.primary_image_url || vehicle.image || 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
                  location: locationStr, // Always a string for display
                  locationString: locationStr,
                  // Keep original location object for navigation state if needed
                  locationObject: vehicle.location
                },
                total: booking.total_cost || booking.total_amount || booking.total || 0
              };
            } else {
              // Booking without vehicle info - still include vehicle_id for "View Car" link
              return {
                ...booking,
                car: {
                  id: vehicleId ? parseInt(vehicleId) : null,
                  name: 'Vehicle',
                  image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
                  location: 'Location not available'
                },
                total: booking.total_cost || booking.total_amount || booking.total || 0
              };
            }
          } catch (error) {
            console.error(`Error processing booking ${booking.id}:`, error);
            return {
              ...booking,
              car: {
                id: booking.vehicle_id ? parseInt(booking.vehicle_id) : null,
                name: 'Vehicle',
                image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
                location: 'Location not available'
              },
              total: booking.total_cost || booking.total_amount || booking.total || 0
            };
          }
        });
        
        setBookings(bookingsWithCars);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('[UserDashboard] Error loading bookings:', error);
      setBookings([]);
      if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
        toast.error(error.message || 'Failed to load bookings.');
      } else if (error.status === 0) {
        toast.error('Cannot connect to booking service. Bookings may be temporarily unavailable.');
      } else {
        toast.error('Failed to load bookings.');
      }
    } finally {
      setLoadingBookings(false);
    }
  };

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
      
      // Load data for the active tab (favorites are loaded immediately on mount)
      if (activeTab === 'bookings') {
        loadBookings();
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
              {/* Profile Information Display */}
              {user && (
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '20px', color: '#222', fontSize: '18px', fontWeight: '600' }}>
                    <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                    Profile Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {user.first_name && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>First Name</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.first_name}</span>
                      </div>
                    )}
                    {user.last_name && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Last Name</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.last_name}</span>
                      </div>
                    )}
                    {user.email && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Email</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.email}</span>
                      </div>
                    )}
                    {user.phone_number && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Phone Number</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.phone_number}</span>
                      </div>
                    )}
                    {user.date_of_birth && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Date of Birth</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>
                          {(() => {
                            try {
                              const date = new Date(user.date_of_birth);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                });
                              }
                            } catch (e) {}
                            return user.date_of_birth;
                          })()}
                        </span>
                      </div>
                    )}
                    {user.address && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Address</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.address}</span>
                      </div>
                    )}
                    {user.city && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>City</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.city}</span>
                      </div>
                    )}
                    {user.country && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Country</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.country}</span>
                      </div>
                    )}
                    {user.postal_code && (
                      <div>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Postal Code</strong>
                        <span style={{ color: '#222', fontSize: '15px' }}>{user.postal_code}</span>
                      </div>
                    )}
                    {user.bio && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong style={{ color: '#717171', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Bio</strong>
                        <span style={{ color: '#222', fontSize: '15px', lineHeight: '1.6' }}>{user.bio}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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

              {loadingFavorites ? (
                <div className="empty-state">
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                </div>
              ) : favorites.length === 0 ? (
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
                  {favorites.map(car => {
                    // Ensure car has a valid ID before rendering
                    if (!car || !car.id) {
                      console.error('[UserDashboard] Favorite car missing ID:', car);
                      return null;
                    }
                    
                    return (
                      <Link 
                        key={car.id} 
                        to={`/car/${car.id}`} 
                        className="favorite-card"
                        onClick={() => console.log('[UserDashboard] Navigating to car:', car.id)}
                      >
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
                    );
                  })}
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

              {loadingBookings ? (
                <div className="empty-state">
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                </div>
              ) : bookings.length === 0 ? (
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
                            <p><i className="fas fa-map-marker-alt"></i> {(() => {
                              if (!booking.car.location) return 'Location not available';
                              if (typeof booking.car.location === 'string') return booking.car.location;
                              const loc = booking.car.location;
                              if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
                              if (loc.city) return loc.city;
                              if (loc.state) return loc.state;
                              if (loc.name) return loc.name;
                              if (loc.address) return loc.address;
                              return 'Location not available';
                            })()}</p>
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
                          <Link 
                            to={`/car/${booking.car?.id || booking.vehicle_id || booking.id}`} 
                            state={{ 
                              car: booking.car, 
                              city: booking.car?.location?.city || (typeof booking.car?.location === 'object' && booking.car?.location?.city) || null 
                            }}
                            className="action-link"
                          >
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

