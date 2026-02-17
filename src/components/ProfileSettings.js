import React, { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import { authAPI } from '../utils/api';

function ProfileSettings({ user, onUpdate }) {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    date_of_birth: '',
  });
  const [dateParts, setDateParts] = useState({
    month: '',
    day: '',
    year: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      const dob = user.date_of_birth || '';
      let month = '', day = '', year = '';
      
      // Parse date_of_birth if it exists (format: YYYY-MM-DD or similar)
      if (dob) {
        try {
          const date = new Date(dob);
          if (!isNaN(date.getTime())) {
            month = String(date.getMonth() + 1).padStart(2, '0');
            day = String(date.getDate()).padStart(2, '0');
            year = String(date.getFullYear());
          } else if (dob.includes('-')) {
            // Try parsing YYYY-MM-DD format
            const parts = dob.split('-');
            if (parts.length === 3) {
              year = parts[0];
              month = parts[1];
              day = parts[2];
            }
          }
        } catch (e) {
          console.error('Error parsing date_of_birth:', e);
        }
      }
      
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
        date_of_birth: dob,
      });
      
      setDateParts({ month, day, year });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (part, value) => {
    setDateParts(prev => {
      const newParts = { ...prev, [part]: value };
      
      // Construct date string in YYYY-MM-DD format when all parts are filled
      if (newParts.month && newParts.day && newParts.year) {
        const month = newParts.month.padStart(2, '0');
        const day = newParts.day.padStart(2, '0');
        const year = newParts.year;
        const dateString = `${year}-${month}-${day}`;
        setFormData(prev => ({
          ...prev,
          date_of_birth: dateString
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          date_of_birth: ''
        }));
      }
      
      return newParts;
    });
    
    // Clear error when user starts typing
    if (errors.date_of_birth) {
      setErrors(prev => ({
        ...prev,
        date_of_birth: ''
      }));
    }
  };

  // Generate arrays for date dropdowns
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
  }));

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1)
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const updatedUser = await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      if (onUpdate) {
        onUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <h2>Profile Settings</h2>
      <p className="section-description">Update your personal information</p>

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
              className={errors.first_name ? 'error' : ''}
            />
            {errors.first_name && (
              <span className="error-text">{errors.first_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
              className={errors.last_name ? 'error' : ''}
            />
            {errors.last_name && (
              <span className="error-text">{errors.last_name}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className={errors.phone_number ? 'error' : ''}
          />
          {errors.phone_number && (
            <span className="error-text">{errors.phone_number}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself (max 500 characters)"
            rows="4"
            maxLength="500"
            className={errors.bio ? 'error' : ''}
          />
          <div className="char-count">{formData.bio.length}/500</div>
          {errors.bio && (
            <span className="error-text">{errors.bio}</span>
          )}
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={dateParts.month}
              onChange={(e) => handleDateChange('month', e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: errors.date_of_birth ? '1px solid #e74c3c' : '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">Month</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <select
              value={dateParts.day}
              onChange={(e) => handleDateChange('day', e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: errors.date_of_birth ? '1px solid #e74c3c' : '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">Day</option>
              {days.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
            <select
              value={dateParts.year}
              onChange={(e) => handleDateChange('year', e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: errors.date_of_birth ? '1px solid #e74c3c' : '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">Year</option>
              {years.map(year => (
                <option key={year.value} value={year.value}>{year.label}</option>
              ))}
            </select>
          </div>
          {errors.date_of_birth && (
            <span className="error-text">{errors.date_of_birth}</span>
          )}
          {formData.date_of_birth && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#717171' }}>
              Selected: {new Date(formData.date_of_birth).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            className={errors.address ? 'error' : ''}
          />
          {errors.address && (
            <span className="error-text">{errors.address}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              className={errors.city ? 'error' : ''}
            />
            {errors.city && (
              <span className="error-text">{errors.city}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter your country"
              className={errors.country ? 'error' : ''}
            />
            {errors.country && (
              <span className="error-text">{errors.country}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="postal_code">Postal Code</label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            placeholder="Enter your postal code"
            className={errors.postal_code ? 'error' : ''}
          />
          {errors.postal_code && (
            <span className="error-text">{errors.postal_code}</span>
          )}
        </div>

        <button
          type="submit"
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default ProfileSettings;

