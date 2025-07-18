import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function CarRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userChoice, setUserChoice] = useState(null); // 'login', 'guest', or null
  const [isLoading, setIsLoading] = useState(false);
  
  const [carData, setCarData] = useState({
    title: '',
    description: '',
    make: '',
    model: '',
    year: '',
    vehicle_type: '',
    license_plate: '',
    use: '',
    color: '',
    seats: '',
    doors: '',
    transmission: '',
    fuel_type: '',
    mileage: '',
    price_per_day: '',
    dynamic_price_enabled: false,
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      latitude: '',
      longitude: ''
    },
    media: [
      {
        media_url: '',
        media_type: 'image'
      }
    ],
    availabilities: [
      {
        start_date: '',
        end_date: '',
        is_available: true
      }
    ]
  });

  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    profile_picture: ''
  });

  const handleCarDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCarData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setCarData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMediaField = () => {
    setCarData(prev => ({
      ...prev,
      media: [...prev.media, { media_url: '', media_type: 'image' }]
    }));
  };

  const addAvailabilityField = () => {
    setCarData(prev => ({
      ...prev,
      availabilities: [...prev.availabilities, { start_date: '', end_date: '', is_available: true }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // If user chose guest mode, create user first
      if (userChoice === 'guest') {
        const userResponse = await fetch(`${baseUrl}/api/v1/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });

        if (!userResponse.ok) {
          throw new Error('Failed to create user');
        }

        const userResult = await userResponse.json();
        console.log('User created:', userResult);
      }

      // Create vehicle
      const vehicleResponse = await fetch(`${baseUrl}/api/v1/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData)
      });

      if (!vehicleResponse.ok) {
        throw new Error('Failed to create vehicle');
      }

      const vehicleResult = await vehicleResponse.json();
      console.log('Vehicle created:', vehicleResult);
      
      // If user chose guest mode, redirect to login
      if (userChoice === 'guest') {
        navigate('/login');
      } else {
        navigate('/cars');
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Error creating vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-container">
      <h2>How would you like to proceed?</h2>
      <p>Choose how you'd like to register your car</p>
      
      <div className="choice-cards">
        <div 
          className={`choice-card ${userChoice === 'login' ? 'selected' : ''}`}
          onClick={() => setUserChoice('login')}
        >
          <div className="choice-icon">👤</div>
          <h3>I have an account</h3>
          <p>Log in to your existing Carbnb account</p>
        </div>
        
        <div 
          className={`choice-card ${userChoice === 'guest' ? 'selected' : ''}`}
          onClick={() => setUserChoice('guest')}
        >
          <div className="choice-icon">🚗</div>
          <h3>Continue as guest</h3>
          <p>Register your car first, then create an account</p>
        </div>
      </div>
      
      <button 
        className="next-btn"
        onClick={() => setCurrentStep(2)}
        disabled={!userChoice}
      >
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-container">
      <h2>Car Information</h2>
      <p>Tell us about your car</p>
      
      <form onSubmit={handleSubmit} className="car-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Car Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={carData.title}
                onChange={handleCarDataChange}
                placeholder="e.g., Tesla Model 3"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={carData.description}
                onChange={handleCarDataChange}
                placeholder="Describe your car..."
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="make">Make *</label>
              <input
                type="text"
                id="make"
                name="make"
                value={carData.make}
                onChange={handleCarDataChange}
                placeholder="e.g., Tesla"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={carData.model}
                onChange={handleCarDataChange}
                placeholder="e.g., Model 3"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={carData.year}
                onChange={handleCarDataChange}
                placeholder="2022"
                min="1900"
                max="2024"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle_type">Vehicle Type *</label>
              <select
                id="vehicle_type"
                name="vehicle_type"
                value={carData.vehicle_type}
                onChange={handleCarDataChange}
                required
              >
                <option value="">Select vehicle type</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="convertible">Convertible</option>
                <option value="hatchback">Hatchback</option>
                <option value="wagon">Wagon</option>
                <option value="van">Van</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="license_plate">License Plate *</label>
              <input
                type="text"
                id="license_plate"
                name="license_plate"
                value={carData.license_plate}
                onChange={handleCarDataChange}
                placeholder="ABC123"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="color">Color *</label>
              <input
                type="text"
                id="color"
                name="color"
                value={carData.color}
                onChange={handleCarDataChange}
                placeholder="e.g., Red"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seats">Number of Seats *</label>
              <input
                type="number"
                id="seats"
                name="seats"
                value={carData.seats}
                onChange={handleCarDataChange}
                placeholder="5"
                min="1"
                max="15"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="doors">Number of Doors *</label>
              <input
                type="number"
                id="doors"
                name="doors"
                value={carData.doors}
                onChange={handleCarDataChange}
                placeholder="4"
                min="2"
                max="6"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mileage">Mileage *</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={carData.mileage}
                onChange={handleCarDataChange}
                placeholder="50000"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="transmission">Transmission *</label>
              <select
                id="transmission"
                name="transmission"
                value={carData.transmission}
                onChange={handleCarDataChange}
                required
              >
                <option value="">Select transmission</option>
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
                value={carData.fuel_type}
                onChange={handleCarDataChange}
                required
              >
                <option value="">Select fuel type</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="plug-in_hybrid">Plug-in Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="use">Primary Use *</label>
              <select
                id="use"
                name="use"
                value={carData.use}
                onChange={handleCarDataChange}
                required
              >
                <option value="">Select primary use</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Pricing</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price_per_day">Price per Day ($) *</label>
              <input
                type="number"
                id="price_per_day"
                name="price_per_day"
                value={carData.price_per_day}
                onChange={handleCarDataChange}
                placeholder="100"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="dynamic_price_enabled"
                  checked={carData.dynamic_price_enabled}
                  onChange={handleCarDataChange}
                />
                <span className="checkmark"></span>
                Enable dynamic pricing
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          
          <div className="form-group">
            <label htmlFor="location.address">Address *</label>
            <input
              type="text"
              id="location.address"
              name="location.address"
              value={carData.location.address}
              onChange={handleCarDataChange}
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.city">City *</label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={carData.location.city}
                onChange={handleCarDataChange}
                placeholder="San Francisco"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location.state">State *</label>
              <input
                type="text"
                id="location.state"
                name="location.state"
                value={carData.location.state}
                onChange={handleCarDataChange}
                placeholder="CA"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location.country">Country *</label>
              <input
                type="text"
                id="location.country"
                name="location.country"
                value={carData.location.country}
                onChange={handleCarDataChange}
                placeholder="USA"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.postal_code">Postal Code *</label>
              <input
                type="text"
                id="location.postal_code"
                name="location.postal_code"
                value={carData.location.postal_code}
                onChange={handleCarDataChange}
                placeholder="94102"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location.latitude">Latitude</label>
              <input
                type="number"
                id="location.latitude"
                name="location.latitude"
                value={carData.location.latitude}
                onChange={handleCarDataChange}
                placeholder="37.7749"
                step="any"
              />
            </div>
            <div className="form-group">
              <label htmlFor="location.longitude">Longitude</label>
              <input
                type="number"
                id="location.longitude"
                name="location.longitude"
                value={carData.location.longitude}
                onChange={handleCarDataChange}
                placeholder="-122.4194"
                step="any"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Media</h3>
          <p>Add photos of your car</p>
          
          {carData.media.map((media, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <label htmlFor={`media_url_${index}`}>Media URL {index + 1}</label>
                <input
                  type="url"
                  id={`media_url_${index}`}
                  name={`media_url_${index}`}
                  value={media.media_url}
                  onChange={(e) => {
                    const newMedia = [...carData.media];
                    newMedia[index].media_url = e.target.value;
                    setCarData(prev => ({ ...prev, media: newMedia }));
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`media_type_${index}`}>Media Type</label>
                <select
                  id={`media_type_${index}`}
                  name={`media_type_${index}`}
                  value={media.media_type}
                  onChange={(e) => {
                    const newMedia = [...carData.media];
                    newMedia[index].media_type = e.target.value;
                    setCarData(prev => ({ ...prev, media: newMedia }));
                  }}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
          ))}
          
          <button type="button" className="add-btn" onClick={addMediaField}>
            + Add More Media
          </button>
        </div>

        <div className="form-section">
          <h3>Availability</h3>
          <p>Set when your car is available for rent</p>
          
          {carData.availabilities.map((availability, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <label htmlFor={`start_date_${index}`}>Start Date</label>
                <input
                  type="date"
                  id={`start_date_${index}`}
                  name={`start_date_${index}`}
                  value={availability.start_date}
                  onChange={(e) => {
                    const newAvailabilities = [...carData.availabilities];
                    newAvailabilities[index].start_date = e.target.value;
                    setCarData(prev => ({ ...prev, availabilities: newAvailabilities }));
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`end_date_${index}`}>End Date</label>
                <input
                  type="date"
                  id={`end_date_${index}`}
                  name={`end_date_${index}`}
                  value={availability.end_date}
                  onChange={(e) => {
                    const newAvailabilities = [...carData.availabilities];
                    newAvailabilities[index].end_date = e.target.value;
                    setCarData(prev => ({ ...prev, availabilities: newAvailabilities }));
                  }}
                />
              </div>
            </div>
          ))}
          
          <button type="button" className="add-btn" onClick={addAvailabilityField}>
            + Add More Availability
          </button>
        </div>

        {userChoice === 'guest' && (
          <div className="form-section">
            <h3>Your Information</h3>
            <p>Please provide your details to complete the registration</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handleUserDataChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handleUserDataChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number *</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={userData.phone_number}
                onChange={handleUserDataChange}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={userData.bio}
                onChange={handleUserDataChange}
                placeholder="Tell us about yourself..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={userData.address}
                onChange={handleUserDataChange}
                placeholder="123 Main St"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={userData.city}
                  onChange={handleUserDataChange}
                  placeholder="San Francisco"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={userData.country}
                  onChange={handleUserDataChange}
                  placeholder="USA"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="postal_code">Postal Code *</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={userData.postal_code}
                onChange={handleUserDataChange}
                placeholder="94102"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile_picture">Profile Picture URL</label>
              <input
                type="url"
                id="profile_picture"
                name="profile_picture"
                value={userData.profile_picture}
                onChange={handleUserDataChange}
                placeholder="https://example.com/profile.jpg"
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register Car'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="car-registration-page">
      <div className="registration-container">
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
}

export default CarRegistration; 