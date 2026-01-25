import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { CarCardSkeleton } from '../components/LoadingSkeleton';
import { vehiclesAPI } from '../utils/api';
import VehicleAvailabilityManager from '../components/VehicleAvailabilityManager';
import VehiclePhotoUpload from '../components/VehiclePhotoUpload';
import VehicleEditForm from '../components/VehicleEditForm';

function ListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [pricing, setPricing] = useState({
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    deposit_amount: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const vehicleData = await vehiclesAPI.getById(id);
      const vehicle = vehicleData.vehicle || vehicleData.data || vehicleData;
      setVehicle(vehicle);
      setPricing({
        daily_rate: vehicle.daily_rate || '',
        weekly_rate: vehicle.weekly_rate || '',
        monthly_rate: vehicle.monthly_rate || '',
        deposit_amount: vehicle.deposit_amount || ''
      });
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('Failed to load vehicle details');
      navigate('/owner/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setPricing(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePricing = () => {
    const newErrors = {};
    
    if (!pricing.daily_rate || parseFloat(pricing.daily_rate) <= 0) {
      newErrors.daily_rate = 'Daily rate must be greater than 0';
    }
    
    if (pricing.weekly_rate && parseFloat(pricing.weekly_rate) < 0) {
      newErrors.weekly_rate = 'Weekly rate must be 0 or greater';
    }
    
    if (pricing.monthly_rate && parseFloat(pricing.monthly_rate) < 0) {
      newErrors.monthly_rate = 'Monthly rate must be 0 or greater';
    }
    
    if (pricing.deposit_amount && parseFloat(pricing.deposit_amount) < 0) {
      newErrors.deposit_amount = 'Deposit amount must be 0 or greater';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    
    if (!validatePricing()) {
      toast.error('Please fix the pricing errors before submitting.');
      return;
    }

    setUpdating(true);
    
    try {
      const payload = {
        daily_rate: parseFloat(pricing.daily_rate),
        deposit_amount: pricing.deposit_amount ? parseFloat(pricing.deposit_amount) : 0
      };
      
      if (pricing.weekly_rate) payload.weekly_rate = parseFloat(pricing.weekly_rate);
      if (pricing.monthly_rate) payload.monthly_rate = parseFloat(pricing.monthly_rate);
      
      await vehiclesAPI.update(id, payload);
      toast.success('Pricing updated successfully!');
      
      // Refresh vehicle data
      fetchVehicleDetails();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error(error.message || 'Failed to update pricing');
    } finally {
      setUpdating(false);
    }
  };

  const getVehicleName = (vehicle) => {
    return vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || `Vehicle #${vehicle.id}`;
  };

  if (loading) {
    return (
      <div className="listing-edit-page">
        <div className="listing-edit-container">
          <CarCardSkeleton />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="listing-edit-page">
        <div className="listing-edit-container">
          <div className="error-state">
            <h2>Vehicle Not Found</h2>
            <p>The vehicle you're looking for doesn't exist or you don't have permission to access it.</p>
            <Link to="/owner/dashboard" className="primary-btn">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If no section is selected, show selection interface
  if (!selectedSection) {
    return (
      <div className="listing-edit-page">
        <div className="listing-edit-container">
          <div className="listing-edit-header">
            <div>
              <Link to="/owner/dashboard" className="back-link">
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </Link>
              <h1>{getVehicleName(vehicle)}</h1>
              <p className="vehicle-subtitle">Select what you'd like to edit</p>
            </div>
            <div className="vehicle-status-section">
              <span className={`status-badge ${vehicle.is_active ? 'active' : 'inactive'}`}>
                {vehicle.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="edit-options-grid">
            <div className="edit-option-card" onClick={() => setSelectedSection('details')}>
              <div className="edit-option-icon">
                <i className="fas fa-car"></i>
              </div>
              <h3>Edit Vehicle Details</h3>
              <p>Update make, model, year, color, and other vehicle specifications</p>
            </div>

            <div className="edit-option-card" onClick={() => setSelectedSection('pricing')}>
              <div className="edit-option-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h3>Edit Pricing</h3>
              <p>Update daily, weekly, monthly rates and deposit amount</p>
            </div>

            <div className="edit-option-card" onClick={() => setSelectedSection('availability')}>
              <div className="edit-option-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3>Manage Availability</h3>
              <p>Set when your vehicle is available for rent and manage date ranges</p>
            </div>

            <div className="edit-option-card" onClick={() => setSelectedSection('photos')}>
              <div className="edit-option-icon">
                <i className="fas fa-camera"></i>
              </div>
              <h3>Manage Photos</h3>
              <p>Upload, update, or remove vehicle photos</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render selected section
  return (
    <div className="listing-edit-page">
      <div className="listing-edit-container">
        <div className="listing-edit-header">
          <div>
            <button onClick={() => setSelectedSection(null)} className="back-link">
              <i className="fas fa-arrow-left"></i> Back to Options
            </button>
            <h1>
              {selectedSection === 'details' && 'Edit Vehicle Details'}
              {selectedSection === 'pricing' && 'Edit Pricing'}
              {selectedSection === 'availability' && 'Manage Availability'}
              {selectedSection === 'photos' && 'Manage Photos'}
            </h1>
            <p className="vehicle-subtitle">{getVehicleName(vehicle)}</p>
          </div>
          <div className="vehicle-status-section">
            <span className={`status-badge ${vehicle.is_active ? 'active' : 'inactive'}`}>
              {vehicle.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="listing-edit-content">
          {/* Vehicle Details Section */}
          {selectedSection === 'details' && (
            <div className="edit-section-card">
              <h2>Edit Vehicle Details</h2>
              <p className="section-description">Update vehicle specifications and information.</p>
              <VehicleEditForm
                vehicle={vehicle}
                onClose={() => {
                  setSelectedSection(null);
                }}
                onUpdate={() => {
                  fetchVehicleDetails();
                  setSelectedSection(null);
                }}
              />
            </div>
          )}

          {/* Pricing Section */}
          {selectedSection === 'pricing' && (
            <div className="pricing-section-card">
              <h2>Pricing</h2>
              <p className="section-description">Update your rental rates. Changes will apply to all future availability periods.</p>
              
              <form onSubmit={handleUpdatePricing} className="pricing-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="daily_rate">Daily Rate ($) *</label>
                    <input
                      type="number"
                      id="daily_rate"
                      name="daily_rate"
                      value={pricing.daily_rate}
                      onChange={handlePricingChange}
                      min="0"
                      step="0.01"
                      className={errors.daily_rate ? 'error' : ''}
                      required
                    />
                    {errors.daily_rate && <span className="error-text">{errors.daily_rate}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="weekly_rate">Weekly Rate ($)</label>
                    <input
                      type="number"
                      id="weekly_rate"
                      name="weekly_rate"
                      value={pricing.weekly_rate}
                      onChange={handlePricingChange}
                      min="0"
                      step="0.01"
                      className={errors.weekly_rate ? 'error' : ''}
                      placeholder="Optional"
                    />
                    {errors.weekly_rate && <span className="error-text">{errors.weekly_rate}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="monthly_rate">Monthly Rate ($)</label>
                    <input
                      type="number"
                      id="monthly_rate"
                      name="monthly_rate"
                      value={pricing.monthly_rate}
                      onChange={handlePricingChange}
                      min="0"
                      step="0.01"
                      className={errors.monthly_rate ? 'error' : ''}
                      placeholder="Optional"
                    />
                    {errors.monthly_rate && <span className="error-text">{errors.monthly_rate}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="deposit_amount">Deposit Amount ($)</label>
                    <input
                      type="number"
                      id="deposit_amount"
                      name="deposit_amount"
                      value={pricing.deposit_amount}
                      onChange={handlePricingChange}
                      min="0"
                      step="0.01"
                      className={errors.deposit_amount ? 'error' : ''}
                      placeholder="Optional"
                    />
                    {errors.deposit_amount && <span className="error-text">{errors.deposit_amount}</span>}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Pricing'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Availability Section */}
          {selectedSection === 'availability' && (
            <div className="availability-section-card">
              <h2>Availability</h2>
              <p className="section-description">Manage when your vehicle is available for rent. Add periods and set custom rates for specific dates.</p>
              <VehicleAvailabilityManager vehicleId={id} />
            </div>
          )}

          {/* Photos Section */}
          {selectedSection === 'photos' && (
            <div className="photos-section-card">
              <h2>Manage Photos</h2>
              <p className="section-description">Upload, update, or remove vehicle photos. The first photo will be used as the primary image.</p>
              <VehiclePhotoUpload 
                vehicleId={id}
                onPhotosUpdated={async () => {
                  // Refresh vehicle details to get updated primary_image_url
                  await fetchVehicleDetails();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingEdit;
