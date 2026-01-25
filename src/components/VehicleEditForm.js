import React, { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import { vehiclesAPI } from '../utils/api';

function VehicleEditForm({ vehicle, onClose, onUpdate }) {
  const toast = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    license_plate: '',
    vin: '',
    transmission: '',
    fuel_type: '',
    category: '',
    seats: '',
    doors: '',
    mileage: '',
    description: '',
    features: '',
    condition_notes: ''
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        color: vehicle.color || '',
        license_plate: vehicle.license_plate || '',
        vin: vehicle.vin || '',
        transmission: vehicle.transmission || 'automatic',
        fuel_type: vehicle.fuel_type || 'gasoline',
        category: vehicle.category || 'economy',
        seats: vehicle.seats || '',
        doors: vehicle.doors || '',
        mileage: vehicle.mileage || '',
        description: vehicle.description || '',
        features: vehicle.features || '',
        condition_notes: vehicle.condition_notes || ''
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > 2030) {
      newErrors.year = 'Year must be between 1900 and 2030';
    }
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.license_plate.trim()) newErrors.license_plate = 'License plate is required';
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters';
    }
    if (!formData.seats || formData.seats < 1 || formData.seats > 50) {
      newErrors.seats = 'Seats must be between 1 and 50';
    }
    if (!formData.doors || formData.doors < 2 || formData.doors > 6) {
      newErrors.doors = 'Doors must be between 2 and 6';
    }
    if (formData.mileage && formData.mileage < 0) {
      newErrors.mileage = 'Mileage must be 0 or greater';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        color: formData.color.trim(),
        license_plate: formData.license_plate.trim().toUpperCase(),
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        category: formData.category,
        seats: parseInt(formData.seats),
        doors: parseInt(formData.doors),
        mileage: parseInt(formData.mileage) || 0
      };

      if (formData.vin) payload.vin = formData.vin.trim().toUpperCase();
      if (formData.description) payload.description = formData.description.trim();
      if (formData.features) payload.features = formData.features.trim();
      if (formData.condition_notes) payload.condition_notes = formData.condition_notes.trim();

      await vehiclesAPI.update(vehicle.id, payload);
      toast.success('Vehicle updated successfully!');
      
      if (onUpdate) {
        onUpdate();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      let errorMessage = 'Failed to update vehicle. Please try again.';
      
      if (error.data && error.data.detail) {
        if (Array.isArray(error.data.detail)) {
          const validationErrors = error.data.detail.map(err => {
            const field = err.loc ? err.loc.join('.') : 'unknown';
            return `${field}: ${err.msg}`;
          }).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else {
          errorMessage = error.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) return null;

  return (
    <div className="vehicle-edit-form-section">
      <form onSubmit={handleSubmit} className="create-vehicle-form">
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="make">Make *</label>
            <input
              type="text"
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              className={errors.make ? 'error' : ''}
              required
            />
            {errors.make && <span className="error-text">{errors.make}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="model">Model *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={errors.model ? 'error' : ''}
              required
            />
            {errors.model && <span className="error-text">{errors.model}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="year">Year *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="1900"
              max="2030"
              className={errors.year ? 'error' : ''}
              required
            />
            {errors.year && <span className="error-text">{errors.year}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="color">Color *</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={errors.color ? 'error' : ''}
              required
            />
            {errors.color && <span className="error-text">{errors.color}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="license_plate">License Plate *</label>
            <input
              type="text"
              id="license_plate"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleChange}
              className={errors.license_plate ? 'error' : ''}
              required
            />
            {errors.license_plate && <span className="error-text">{errors.license_plate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="vin">VIN</label>
            <input
              type="text"
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              maxLength="17"
              className={errors.vin ? 'error' : ''}
              placeholder="17 characters"
            />
            {errors.vin && <span className="error-text">{errors.vin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="transmission">Transmission *</label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="cvt">CVT</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fuel_type">Fuel Type *</label>
            <select
              id="fuel_type"
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              required
            >
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="plug-in_hybrid">Plug-in Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="economy">Economy</option>
              <option value="compact">Compact</option>
              <option value="midsize">Midsize</option>
              <option value="full-size">Full-Size</option>
              <option value="luxury">Luxury</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="seats">Seats *</label>
            <input
              type="number"
              id="seats"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              min="1"
              max="50"
              className={errors.seats ? 'error' : ''}
              required
            />
            {errors.seats && <span className="error-text">{errors.seats}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="doors">Doors *</label>
            <input
              type="number"
              id="doors"
              name="doors"
              value={formData.doors}
              onChange={handleChange}
              min="2"
              max="6"
              className={errors.doors ? 'error' : ''}
              required
            />
            {errors.doors && <span className="error-text">{errors.doors}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mileage">Mileage</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              min="0"
              className={errors.mileage ? 'error' : ''}
            />
            {errors.mileage && <span className="error-text">{errors.mileage}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe your vehicle..."
            style={{ minHeight: '80px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="features">Features</label>
          <textarea
            id="features"
            name="features"
            value={formData.features}
            onChange={handleChange}
            rows="3"
            placeholder="List key features (e.g., GPS, Bluetooth, USB ports)..."
            style={{ minHeight: '80px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="condition_notes">Condition Notes</label>
          <textarea
            id="condition_notes"
            name="condition_notes"
            value={formData.condition_notes}
            onChange={handleChange}
            rows="3"
            placeholder="Any notes about the vehicle's condition..."
            style={{ minHeight: '80px' }}
          />
        </div>

        <div className="form-actions">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="secondary-btn"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="primary-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VehicleEditForm;

