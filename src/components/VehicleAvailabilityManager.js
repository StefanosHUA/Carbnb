import React, { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import { vehiclesAPI } from '../utils/api';

function VehicleAvailabilityManager({ vehicleId }) {
  const toast = useToastContext();
  const [availabilities, setAvailabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    is_available: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicleId) {
      fetchAvailabilities();
    }
  }, [vehicleId]);

  const fetchAvailabilities = async () => {
    try {
      setIsLoading(true);
      const data = await vehiclesAPI.listAvailability(vehicleId);
      setAvailabilities(data || []);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      toast.error('Failed to load availability periods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.start_date = 'Start date cannot be in the past';
      }

      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await vehiclesAPI.updateAvailability(editingId, formData);
        toast.success('Availability period updated successfully!');
      } else {
        await vehiclesAPI.createAvailability(vehicleId, formData);
        toast.success('Availability period created successfully!');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ start_date: '', end_date: '', is_available: true });
      fetchAvailabilities();
    } catch (error) {
      console.error('Availability error:', error);
      const errorMessage = error.message || 'Failed to save availability period. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleEdit = (availability) => {
    setFormData({
      start_date: availability.start_date,
      end_date: availability.end_date,
      is_available: availability.is_available,
    });
    setEditingId(availability.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (availabilityId) => {
    if (!window.confirm('Are you sure you want to delete this availability period?')) {
      return;
    }

    try {
      await vehiclesAPI.deleteAvailability(availabilityId);
      toast.success('Availability period deleted successfully!');
      fetchAvailabilities();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete availability period');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ start_date: '', end_date: '', is_available: true });
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="availability-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading availability periods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="availability-manager">
      <div className="availability-header">
        <h3>Availability Periods</h3>
        <button
          className="add-btn"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          <i className="fas fa-plus"></i> Add Period
        </button>
      </div>

      {showForm && (
        <div className="availability-form-card">
          <h4>{editingId ? 'Edit' : 'Add'} Availability Period</h4>
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          <form onSubmit={handleSubmit} className="availability-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={errors.start_date ? 'error' : ''}
                  required
                />
                {errors.start_date && (
                  <span className="error-text">{errors.start_date}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={errors.end_date ? 'error' : ''}
                  required
                />
                {errors.end_date && (
                  <span className="error-text">{errors.end_date}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                />
                <span>Available for rent during this period</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                {editingId ? 'Update' : 'Create'} Period
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="availability-list">
        {availabilities.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-times"></i>
            <p>No availability periods set</p>
            <p className="empty-state-hint">Add availability periods to make your vehicle rentable</p>
          </div>
        ) : (
          <div className="availability-items">
            {availabilities.map((availability) => (
              <div key={availability.id} className="availability-item">
                <div className="availability-info">
                  <div className="availability-dates">
                    <i className="fas fa-calendar-alt"></i>
                    <span>
                      {new Date(availability.start_date).toLocaleDateString()} - {new Date(availability.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="availability-status">
                    {availability.is_available ? (
                      <span className="status-badge available">
                        <i className="fas fa-check-circle"></i> Available
                      </span>
                    ) : (
                      <span className="status-badge unavailable">
                        <i className="fas fa-times-circle"></i> Unavailable
                      </span>
                    )}
                  </div>
                </div>
                <div className="availability-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(availability)}
                    title="Edit period"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(availability.id)}
                    title="Delete period"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleAvailabilityManager;

