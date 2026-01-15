import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { CarCardSkeleton } from '../components/LoadingSkeleton';
import { vehiclesAPI, salesAPI } from '../utils/api';
import VehicleAvailabilityManager from '../components/VehicleAvailabilityManager';
import VehicleDocuments from '../components/VehicleDocuments';
import CarRegistrationModal from '../components/CarRegistrationModal';
import VehiclePhotoUpload from '../components/VehiclePhotoUpload';

function OwnerDashboard() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleStatus, setVehicleStatus] = useState(null);
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedListingForPhotos, setSelectedListingForPhotos] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('carbnb_user');
    if (!savedUser) {
      toast.warning('Please log in to access your dashboard');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    // Fetch data after user is set
    fetchOwnerData(userData);
  }, []);

  const fetchOwnerData = async (userData = null) => {
    let currentUser = null;
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('carbnb_user');
      currentUser = userData || (savedUser ? JSON.parse(savedUser) : user);
      // Check for both 'id' and 'user_id' as the user object might have either
      const userId = currentUser?.id || currentUser?.user_id;
      
      if (!userId) {
        console.error('User ID not found in user object:', currentUser);
        toast.error('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Fetch owner's vehicles - don't filter by is_active, show all
      console.log('Fetching vehicles for user ID:', userId);
      console.log('User data:', currentUser);
      const vehiclesData = await vehiclesAPI.getByOwner(userId);
      console.log('Raw vehicles data:', vehiclesData);
      console.log('Raw vehicles data type:', typeof vehiclesData, Array.isArray(vehiclesData));
      
      // Handle different response formats
      let listings = [];
      if (Array.isArray(vehiclesData)) {
        listings = vehiclesData;
      } else if (vehiclesData && vehiclesData.data) {
        listings = Array.isArray(vehiclesData.data) ? vehiclesData.data : [];
      } else if (vehiclesData && vehiclesData.vehicles) {
        listings = Array.isArray(vehiclesData.vehicles) ? vehiclesData.vehicles : [];
      } else if (vehiclesData && typeof vehiclesData === 'object') {
        // If it's an object but not an array, try to extract vehicles
        listings = [];
      }
      
      console.log('Processed listings:', listings);
      console.log('Number of listings:', listings.length);
      setListings(listings);
      
      // Fetch sales separately - don't let sales errors affect listings display
      try {
        const salesData = await salesAPI.getByOwner(userId);
        const sales = Array.isArray(salesData) ? salesData : (salesData.data || salesData.sales || []);
        setSales(sales);
      } catch (salesError) {
        // Sales API errors (like 404) shouldn't prevent listings from showing
        console.log('Sales API error (non-critical):', salesError);
        setSales([]);
      }
    } catch (error) {
      console.error('Error fetching owner data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response,
        userId: currentUser?.id || currentUser?.user_id
      });
      
      // Handle specific error cases
      if (error.status === 404 || error.message?.includes('not found') || error.message?.includes('Resource not found')) {
        // 404 means no vehicles found for this owner, which is fine - just show empty state
        console.log('No vehicles found for owner (404) - this is normal for new users');
        console.log('Full error object:', error);
        setListings([]);
        setSales([]);
      } else if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
        toast.error(error.message || 'Failed to load dashboard data.');
        setListings([]);
        setSales([]);
      } else if (error.status === 0) {
        toast.error('Cannot connect to backend services. Please ensure the backend is running.');
        setListings([]);
        setSales([]);
      } else {
        toast.error('Failed to load dashboard data.');
        setListings([]);
        setSales([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await vehiclesAPI.delete(listingId);
      setListings(listings.filter(l => l.id !== listingId));
      toast.success('Listing deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  const handleViewStatus = async (vehicleId) => {
    try {
      setLoadingStatus(true);
      const status = await vehiclesAPI.getStatus(vehicleId);
      setVehicleStatus(status);
      setSelectedVehicle(vehicleId);
    } catch (error) {
      console.error('Error fetching vehicle status:', error);
      toast.error('Failed to load vehicle status');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleCloseStatus = () => {
    setSelectedVehicle(null);
    setVehicleStatus(null);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
    // Refresh listings after closing modal in case a new car was added
    const savedUser = localStorage.getItem('carbnb_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      fetchOwnerData(userData);
    }
  };

  if (loading) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-dashboard-container">
          <CarCardSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="owner-dashboard-page">
      <div className="owner-dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Owner Dashboard</h1>
            <p>Manage your listings and earnings</p>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <i className="fas fa-car"></i>
            My Listings
            {listings.length > 0 && <span className="badge">{listings.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <i className="fas fa-wallet"></i>
            Earnings
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <i className="fas fa-file-alt"></i>
            Car Documents
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'listings' && (
            <div className="listings-tab">
              {listings.length > 0 && (
                <div className="listings-summary">
                  <p>You have <strong>{listings.length}</strong> {listings.length === 1 ? 'listing' : 'listings'}</p>
                </div>
              )}

              {listings.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-car"></i>
                  <h3>No listings yet</h3>
                  <p>Start earning by listing your first car!</p>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="primary-btn"
                  >
                    List Your Car
                  </button>
                </div>
              ) : (
                <div className="listings-grid">
                  {listings.map(listing => {
                    // Use same naming logic as VehicleDocuments
                    const getVehicleName = (vehicle) => {
                      return vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || `Vehicle #${vehicle.id}`;
                    };
                    
                    return (
                    <div key={listing.id} className="listing-card">
                      <img src={listing.primary_image_url || listing.image || '/default-car.png'} alt={getVehicleName(listing)} />
                      <div className="listing-info">
                        <div className="listing-header">
                          <div>
                            <h3>{getVehicleName(listing)}</h3>
                            <p><i className="fas fa-map-marker-alt"></i> {(() => {
                              if (!listing.location) return 'Location not available';
                              if (typeof listing.location === 'string') return listing.location;
                              const loc = listing.location;
                              if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
                              if (loc.city) return loc.city;
                              if (loc.state) return loc.state;
                              if (loc.name) return loc.name;
                              if (loc.address) return loc.address;
                              return 'Location not available';
                            })()}</p>
                          </div>
                          <span className={`status-badge ${listing.is_active ? 'active' : 'inactive'}`}>
                            {listing.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="listing-stats">
                          <div className="stat-item">
                            <i className="fas fa-tag"></i>
                            <span>${listing.daily_rate}/day</span>
                          </div>
                        </div>
                        <div className="listing-actions">
                          <Link to={`/car/${listing.id}`} className="action-link">
                            View
                          </Link>
                          <button 
                            className="status-btn"
                            onClick={() => handleViewStatus(listing.id)}
                            title="View vehicle status"
                          >
                            <i className="fas fa-info-circle"></i> Status
                          </button>
                          <button 
                            className="photo-btn"
                            onClick={() => setSelectedListingForPhotos(listing.id)}
                            title="Manage photos"
                          >
                            <i className="fas fa-camera"></i> Photos
                          </button>
                          <button className="edit-btn">Edit</button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="earnings-tab">
              <div className="earnings-overview">
                <div className="earnings-card">
                  <h3>Total Earnings</h3>
                  <div className="earnings-amount">${sales.reduce((sum, sale) => sum + (sale.amount || 0), 0).toLocaleString()}</div>
                  <p className="earnings-period">All time</p>
                </div>
                <div className="earnings-breakdown">
                  <h3>Earnings Breakdown</h3>
                  <div className="breakdown-item">
                    <span>Rentals</span>
                    <span>${sales.reduce((sum, sale) => sum + (sale.amount || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span>Total</span>
                    <span>${sales.reduce((sum, sale) => sum + (sale.amount || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="earnings-chart-placeholder">
                <i className="fas fa-chart-line"></i>
                <p>Earnings chart would be displayed here</p>
                <p className="chart-note">Integration with charting library (e.g., Chart.js) would go here</p>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="documents-tab">
              <VehicleDocuments />
            </div>
          )}
        </div>

        {/* Vehicle Status Modal */}
        {selectedVehicle && (
          <div className="vehicle-status-modal">
            <div className="modal-overlay" onClick={handleCloseStatus}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h2>Vehicle Status & Management</h2>
                <button className="close-btn" onClick={handleCloseStatus}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {loadingStatus ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading status...</p>
                  </div>
                ) : vehicleStatus ? (
                  <div className="vehicle-status-info">
                    <div className="status-section">
                      <h3>Activation Status</h3>
                      <div className="status-grid">
                        <div className="status-item">
                          <span className="status-label">Is Active:</span>
                          <span className={`status-value ${vehicleStatus.is_active ? 'active' : 'inactive'}`}>
                            {vehicleStatus.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="status-item">
                          <span className="status-label">Has License:</span>
                          <span className={`status-value ${vehicleStatus.has_license ? 'yes' : 'no'}`}>
                            {vehicleStatus.has_license ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="status-item">
                          <span className="status-label">Has Insurance:</span>
                          <span className={`status-value ${vehicleStatus.has_insurance ? 'yes' : 'no'}`}>
                            {vehicleStatus.has_insurance ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {vehicleStatus.missing_documents && vehicleStatus.missing_documents.length > 0 && (
                          <div className="status-item full-width">
                            <span className="status-label">Missing Documents:</span>
                            <div className="missing-docs">
                              {vehicleStatus.missing_documents.map((doc, idx) => (
                                <span key={idx} className="doc-badge">{doc}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="availability-section">
                      <VehicleAvailabilityManager vehicleId={selectedVehicle} />
                    </div>
                  </div>
                ) : (
                  <div className="error-state">
                    <p>Failed to load vehicle status</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Car Registration Modal */}
        {showRegisterModal && (
          <CarRegistrationModal onClose={handleCloseRegisterModal} />
        )}

        {/* Photo Upload Modal */}
        {selectedListingForPhotos && (
          <div className="photo-upload-modal">
            <div className="modal-overlay" onClick={() => setSelectedListingForPhotos(null)}></div>
            <div className="modal-content photo-modal-content">
              <div className="modal-header">
                <h2>Manage Car Photos</h2>
                <button className="close-btn" onClick={() => setSelectedListingForPhotos(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <VehiclePhotoUpload 
                  vehicleId={selectedListingForPhotos}
                  onPhotosUpdated={() => {
                    // Refresh listings
                    const savedUser = localStorage.getItem('carbnb_user');
                    if (savedUser) {
                      const userData = JSON.parse(savedUser);
                      fetchOwnerData(userData);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;

