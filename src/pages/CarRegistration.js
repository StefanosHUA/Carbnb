import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sanitizeFormData, validateFileUpload, validateUrl } from '../utils/security';
import { useToastContext } from '../context/ToastContext';
import { vehiclesAPI, authAPI, getUserData } from '../utils/api';
import VehiclePhotoUpload from '../components/VehiclePhotoUpload';

function CarRegistration({ onClose: externalOnClose }) {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [userChoice, setUserChoice] = useState(null); // 'login', 'guest', or null
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [createdVehicleId, setCreatedVehicleId] = useState(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  const [carData, setCarData] = useState({
    description: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    license_plate: '',
    color: '',
    seats: '',
    doors: '',
    transmission: '',
    fuel_type: '',
    category: '',
    mileage: '',
    daily_rate: '',
    deposit_amount: '',
    location: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      latitude: null,
      longitude: null
    }
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

  // Check if user is logged in on component mount
  useEffect(() => {
    const user = getUserData();
    if (user) {
      // User is logged in, skip step 1 and go directly to step 2
      setCurrentStep(2);
      setUserChoice('login');
    }
  }, []);

  const handleCarDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate Step 2: Basic Car Info
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!carData.make.trim()) {
      newErrors.make = 'Car make is required';
    }
    
    if (!carData.model.trim()) {
      newErrors.model = 'Car model is required';
    }
    
    if (!carData.year) {
      newErrors.year = 'Car year is required';
    } else if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    
    if (!carData.vin.trim()) {
      newErrors.vin = 'VIN is required';
    } else if (carData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters';
    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(carData.vin)) {
      newErrors.vin = 'VIN must contain only alphanumeric characters (no I, O, or Q)';
    }
    
    if (!carData.license_plate.trim()) {
      newErrors.license_plate = 'License plate is required';
    }
    
    if (!carData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 3: Car Specifications
  const validateStep3 = () => {
    const newErrors = {};
    
    if (!carData.seats) {
      newErrors.seats = 'Number of seats is required';
    } else if (parseInt(carData.seats) < 1 || parseInt(carData.seats) > 50) {
      newErrors.seats = 'Seats must be between 1 and 50';
    }
    
    if (!carData.doors) {
      newErrors.doors = 'Number of doors is required';
    } else if (parseInt(carData.doors) < 2 || parseInt(carData.doors) > 6) {
      newErrors.doors = 'Doors must be between 2 and 6';
    }
    
    if (!carData.transmission) {
      newErrors.transmission = 'Transmission type is required';
    }
    
    if (!carData.fuel_type) {
      newErrors.fuel_type = 'Fuel type is required';
    }
    
    if (!carData.category) {
      newErrors.category = 'Vehicle category is required';
    }
    
    if (!carData.mileage) {
      newErrors.mileage = 'Mileage is required';
    } else if (parseInt(carData.mileage) < 0) {
      newErrors.mileage = 'Mileage must be 0 or greater';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 4: Pricing & Location
  const validateStep4 = () => {
    const newErrors = {};
    
    if (!carData.daily_rate) {
      newErrors.daily_rate = 'Daily rate is required';
    } else if (parseFloat(carData.daily_rate) <= 0) {
      newErrors.daily_rate = 'Daily rate must be greater than 0';
    }
    
    if (!carData.deposit_amount) {
      newErrors.deposit_amount = 'Deposit amount is required';
    } else if (parseFloat(carData.deposit_amount) < 0) {
      newErrors.deposit_amount = 'Deposit amount must be 0 or greater';
    }
    
    if (!carData.location.name.trim()) {
      newErrors['location.name'] = 'Location name is required';
    }
    
    if (!carData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }
    
    if (!carData.location.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }
    
    if (!carData.location.state.trim()) {
      newErrors['location.state'] = 'State is required';
    }
    
    if (!carData.location.country.trim()) {
      newErrors['location.country'] = 'Country is required';
    }
    
    if (!carData.location.postal_code.trim()) {
      newErrors['location.postal_code'] = 'Postal code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 5: User Info (only if guest mode)
  const validateStep5 = () => {
    if (userChoice !== 'guest') {
      return true; // Skip validation if not guest mode
    }
    
    const newErrors = {};
    
    if (!userData.first_name.trim()) {
      newErrors['user.first_name'] = 'First name is required';
    }
    
    if (!userData.last_name.trim()) {
      newErrors['user.last_name'] = 'Last name is required';
    }
    
    if (!userData.phone_number.trim()) {
      newErrors['user.phone_number'] = 'Phone number is required';
    }
    
    if (!userData.address.trim()) {
      newErrors['user.address'] = 'Address is required';
    }
    
    if (!userData.city.trim()) {
      newErrors['user.city'] = 'City is required';
    }
    
    if (!userData.country.trim()) {
      newErrors['user.country'] = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (userChoice === 'login') {
        toast.info('Please log in to continue');
        navigate('/login');
        return;
      } else if (userChoice === 'guest') {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      if (validateStep4()) {
        if (userChoice === 'guest') {
          setCurrentStep(5);
        } else {
          // Skip to submit if logged in
          handleSubmit();
        }
      }
    }
  };

  const handleBack = () => {
    // Only allow going back if there's a previous step
    // For logged-in users: can't go back from step 2 (their first step)
    // For guest users: can go back from step 2 to step 1
    if ((userChoice === 'login' && currentStep > 2) || (userChoice !== 'login' && currentStep > 1)) {
      setCurrentStep(currentStep - 1);
      // Clear errors when going back
      setErrors({});
    }
  };

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate all steps before submitting
    if (!validateStep2() || !validateStep3() || !validateStep4() || !validateStep5()) {
      // Go to the first step with errors
      if (!validateStep2()) {
        setCurrentStep(2);
      } else if (!validateStep3()) {
        setCurrentStep(3);
      } else if (!validateStep4()) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sanitize user data if guest mode
      const sanitizedUserData = userChoice === 'guest' ? sanitizeFormData(userData) : null;
      
      // If user chose guest mode, create user first
      if (userChoice === 'guest') {
        await authAPI.register(sanitizedUserData);
      }

      // Transform car data to match backend schema
      const vehiclePayload = {
        make: carData.make.trim(),
        model: carData.model.trim(),
        year: parseInt(carData.year),
        color: carData.color.trim(),
        license_plate: carData.license_plate.trim().toUpperCase(),
        vin: carData.vin.trim().toUpperCase().replace(/-/g, ''),
        transmission: carData.transmission,
        fuel_type: carData.fuel_type,
        category: carData.category,
        seats: parseInt(carData.seats),
        doors: parseInt(carData.doors),
        mileage: parseInt(carData.mileage),
        daily_rate: parseFloat(carData.daily_rate),
        deposit_amount: parseFloat(carData.deposit_amount),
        description: carData.description.trim() || null,
        location: {
          name: carData.location.name.trim(),
          address: carData.location.address.trim(),
          city: carData.location.city.trim(),
          state: carData.location.state.trim(),
          country: carData.location.country.trim(),
          postal_code: carData.location.postal_code.trim(),
          latitude: carData.location.latitude ? parseFloat(carData.location.latitude) : null,
          longitude: carData.location.longitude ? parseFloat(carData.location.longitude) : null
        }
      };

      // Create vehicle (will be created in inactive status by backend)
      const vehicleResult = await vehiclesAPI.create(vehiclePayload);
      console.log('Vehicle created:', vehicleResult);
      
      // Extract vehicle ID from response
      const vehicleId = vehicleResult?.id || vehicleResult?.vehicle?.id || vehicleResult?.data?.id;
      setCreatedVehicleId(vehicleId);
      
      toast.success('Car registered successfully! You can now add photos (optional).');
      setIsLoading(false);
      
      // Show photo upload step
      setShowPhotoUpload(true);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      setIsLoading(false);
      let errorMessage = 'Error creating vehicle. Please try again.';
      
      if (error.data && error.data.detail) {
        if (Array.isArray(error.data.detail)) {
          // Handle validation errors from backend
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
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Render Step 1: User Choice
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
    </div>
  );

  // Render Step 2: Basic Car Info
  const renderStep2 = () => (
    <>
      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={carData.description}
          onChange={handleCarDataChange}
          placeholder="Describe your car..."
          rows="3"
        />
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
            value={carData.model}
            onChange={handleCarDataChange}
            placeholder="e.g., Model 3"
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
            value={carData.year}
            onChange={handleCarDataChange}
            placeholder="2022"
            min="1900"
            max={new Date().getFullYear() + 1}
            className={errors.year ? 'error' : ''}
            required
          />
          {errors.year && <span className="error-text">{errors.year}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vin">VIN (Vehicle Identification Number) *</label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={carData.vin}
            onChange={handleCarDataChange}
            placeholder="17 characters (e.g., 1HGBH41JXMN109186)"
            maxLength="17"
            className={errors.vin ? 'error' : ''}
            required
          />
          {errors.vin && <span className="error-text">{errors.vin}</span>}
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
            className={errors.license_plate ? 'error' : ''}
            required
          />
          {errors.license_plate && <span className="error-text">{errors.license_plate}</span>}
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
            className={errors.color ? 'error' : ''}
            required
          />
          {errors.color && <span className="error-text">{errors.color}</span>}
        </div>
      </div>
    </>
  );

  // Render Step 3: Car Specifications
  const renderStep3 = () => (
    <>
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
            max="50"
            className={errors.seats ? 'error' : ''}
            required
          />
          {errors.seats && <span className="error-text">{errors.seats}</span>}
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
            className={errors.doors ? 'error' : ''}
            required
          />
          {errors.doors && <span className="error-text">{errors.doors}</span>}
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
            className={errors.mileage ? 'error' : ''}
            required
          />
          {errors.mileage && <span className="error-text">{errors.mileage}</span>}
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
            className={errors.transmission ? 'error' : ''}
            required
          >
            <option value="">Select transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
            <option value="semi_automatic">Semi-Automatic</option>
          </select>
          {errors.transmission && <span className="error-text">{errors.transmission}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="fuel_type">Fuel Type *</label>
          <select
            id="fuel_type"
            name="fuel_type"
            value={carData.fuel_type}
            onChange={handleCarDataChange}
            className={errors.fuel_type ? 'error' : ''}
            required
          >
            <option value="">Select fuel type</option>
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
            <option value="plugin_hybrid">Plug-in Hybrid</option>
          </select>
          {errors.fuel_type && <span className="error-text">{errors.fuel_type}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="category">Vehicle Category *</label>
          <select
            id="category"
            name="category"
            value={carData.category}
            onChange={handleCarDataChange}
            className={errors.category ? 'error' : ''}
            required
          >
            <option value="">Select category</option>
            <option value="economy">Economy</option>
            <option value="compact">Compact</option>
            <option value="intermediate">Intermediate</option>
            <option value="standard">Standard</option>
            <option value="full_size">Full Size</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
            <option value="suv">SUV</option>
            <option value="convertible">Convertible</option>
            <option value="van">Van</option>
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>
      </div>
    </>
  );

  // Render Step 4: Pricing & Location
  const renderStep4 = () => (
    <>
      <div className="form-section">
        <h3>Pricing</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="daily_rate">Daily Rate ($) *</label>
            <input
              type="number"
              id="daily_rate"
              name="daily_rate"
              value={carData.daily_rate}
              onChange={handleCarDataChange}
              placeholder="100.00"
              min="0"
              step="0.01"
              className={errors.daily_rate ? 'error' : ''}
              required
            />
            {errors.daily_rate && <span className="error-text">{errors.daily_rate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="deposit_amount">Deposit Amount ($) *</label>
            <input
              type="number"
              id="deposit_amount"
              name="deposit_amount"
              value={carData.deposit_amount}
              onChange={handleCarDataChange}
              placeholder="200.00"
              min="0"
              step="0.01"
              className={errors.deposit_amount ? 'error' : ''}
              required
            />
            {errors.deposit_amount && <span className="error-text">{errors.deposit_amount}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Location</h3>
        
        <div className="form-group">
          <label htmlFor="location.name">Location Name *</label>
          <input
            type="text"
            id="location.name"
            name="location.name"
            value={carData.location.name}
            onChange={handleCarDataChange}
            placeholder="e.g., Downtown LA, My Home, Airport Parking"
            className={errors['location.name'] ? 'error' : ''}
            required
          />
          {errors['location.name'] && <span className="error-text">{errors['location.name']}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="location.address">Address *</label>
          <input
            type="text"
            id="location.address"
            name="location.address"
            value={carData.location.address}
            onChange={handleCarDataChange}
            placeholder="123 Main St"
            className={errors['location.address'] ? 'error' : ''}
            required
          />
          {errors['location.address'] && <span className="error-text">{errors['location.address']}</span>}
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
              className={errors['location.city'] ? 'error' : ''}
              required
            />
            {errors['location.city'] && <span className="error-text">{errors['location.city']}</span>}
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
              className={errors['location.state'] ? 'error' : ''}
              required
            />
            {errors['location.state'] && <span className="error-text">{errors['location.state']}</span>}
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
              className={errors['location.country'] ? 'error' : ''}
              required
            />
            {errors['location.country'] && <span className="error-text">{errors['location.country']}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location.postal_code">Postal Code *</label>
          <input
            type="text"
            id="location.postal_code"
            name="location.postal_code"
            value={carData.location.postal_code}
            onChange={handleCarDataChange}
            placeholder="94102"
            className={errors['location.postal_code'] ? 'error' : ''}
            required
          />
          {errors['location.postal_code'] && <span className="error-text">{errors['location.postal_code']}</span>}
        </div>
      </div>
    </>
  );

  // Render Step 5: User Info (only if guest mode)
  const renderStep5 = () => (
    <>
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
              className={errors['user.first_name'] ? 'error' : ''}
              required
            />
            {errors['user.first_name'] && <span className="error-text">{errors['user.first_name']}</span>}
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
              className={errors['user.last_name'] ? 'error' : ''}
              required
            />
            {errors['user.last_name'] && <span className="error-text">{errors['user.last_name']}</span>}
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
            className={errors['user.phone_number'] ? 'error' : ''}
            required
          />
          {errors['user.phone_number'] && <span className="error-text">{errors['user.phone_number']}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio (Optional)</label>
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
            className={errors['user.address'] ? 'error' : ''}
            required
          />
          {errors['user.address'] && <span className="error-text">{errors['user.address']}</span>}
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
              className={errors['user.city'] ? 'error' : ''}
              required
            />
            {errors['user.city'] && <span className="error-text">{errors['user.city']}</span>}
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
              className={errors['user.country'] ? 'error' : ''}
              required
            />
            {errors['user.country'] && <span className="error-text">{errors['user.country']}</span>}
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
            className={errors['user.postal_code'] ? 'error' : ''}
            required
          />
          {errors['user.postal_code'] && <span className="error-text">{errors['user.postal_code']}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="profile_picture">Profile Picture URL (Optional)</label>
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
    </>
  );

  // Calculate total steps (5 if guest, 4 if logged in)
  const totalSteps = userChoice === 'guest' ? 5 : 4;
  const currentStepForProgress = userChoice === 'guest' ? currentStep : currentStep - 1; // Adjust for logged in users

  return (
    <div 
      className="car-registration-page" 
      onMouseDown={(e) => {
        // Track where mouse was pressed
        if (e.target === e.currentTarget) {
          // Pressed on background
          e.currentTarget._mouseDown = { 
            x: e.clientX, 
            y: e.clientY,
            target: e.target,
            currentTarget: e.currentTarget,
            pressedOnContent: false
          };
          e.currentTarget._isDragging = false;
        } else {
          // Pressed on content - don't close even if released outside
          e.currentTarget._mouseDown = {
            x: e.clientX,
            y: e.clientY,
            target: e.target,
            currentTarget: e.currentTarget,
            pressedOnContent: true
          };
          e.currentTarget._isDragging = false;
        }
      }}
      onMouseMove={(e) => {
        if (e.currentTarget._mouseDown) {
          const deltaX = Math.abs(e.clientX - e.currentTarget._mouseDown.x);
          const deltaY = Math.abs(e.clientY - e.currentTarget._mouseDown.y);
          if (deltaX > 5 || deltaY > 5) {
            e.currentTarget._isDragging = true;
          }
        }
      }}
      onMouseUp={(e) => {
        // Reset on mouse up
        if (e.currentTarget._mouseDown) {
          e.currentTarget._mouseDown = null;
          e.currentTarget._isDragging = false;
        }
      }}
      onClick={(e) => {
        // Only close if:
        // 1. Clicking directly on the page background
        // 2. Mouse was pressed on background (not on content)
        // 3. Not dragging
        if (
          e.target === e.currentTarget && 
          e.currentTarget._mouseDown &&
          e.currentTarget._mouseDown.target === e.currentTarget._mouseDown.currentTarget &&
          !e.currentTarget._mouseDown.pressedOnContent &&
          !e.currentTarget._isDragging
        ) {
          handleClose();
        }
        // Reset
        e.currentTarget._mouseDown = null;
        e.currentTarget._isDragging = false;
      }}
    >
      <div 
        className="registration-container" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          // Track that mouse was pressed on content
          if (e.currentTarget.parentElement) {
            e.currentTarget.parentElement._mouseDown = {
              x: e.clientX,
              y: e.clientY,
              target: e.target,
              currentTarget: e.currentTarget.parentElement,
              pressedOnContent: true
            };
            e.currentTarget.parentElement._isDragging = false;
          }
        }}
      >
        <button className="close-btn" onClick={handleClose} aria-label="Close" title="Close">
          <i className="fas fa-times"></i>
        </button>
        
        <div className="registration-header">
          <h1>Register Your Car</h1>
          <p>List your vehicle and start earning</p>
        </div>

        {/* Progress Bar - only show if past step 1 */}
        {currentStep > 1 && (
          <div className="car-registration-progress">
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="progress-icon">
                {currentStep > 2 ? <i className="fas fa-check"></i> : <i className="fas fa-car"></i>}
              </div>
              <span className="progress-label">Basic Info</span>
            </div>
            <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className="progress-icon">
                {currentStep > 3 ? <i className="fas fa-check"></i> : <i className="fas fa-cog"></i>}
              </div>
              <span className="progress-label">Specs</span>
            </div>
            <div className={`progress-line ${currentStep >= 4 ? 'active' : ''}`}></div>
            <div className={`progress-step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
              <div className="progress-icon">
                {currentStep > 4 ? <i className="fas fa-check"></i> : <i className="fas fa-map-marker-alt"></i>}
              </div>
              <span className="progress-label">Location</span>
            </div>
            {userChoice === 'guest' && (
              <>
                <div className={`progress-line ${currentStep >= 5 ? 'active' : ''}`}></div>
                <div className={`progress-step ${currentStep >= 5 ? 'active' : ''}`}>
                  <div className="progress-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  <span className="progress-label">Your Info</span>
                </div>
              </>
            )}
          </div>
        )}

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="car-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {currentStep === 1 && (
            <div className="form-navigation">
              <button 
                type="button" 
                className="nav-btn next-btn"
                onClick={handleNext}
                disabled={!userChoice}
              >
                Continue <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}

          {currentStep >= 2 && (
            <>
              <div className="form-section">
                <p className="info-message">
                  <i className="fas fa-info-circle"></i>
                  Your vehicle will be created in inactive status. After registration, you can upload required documents (license and insurance) in your dashboard. Once documents are verified, your vehicle can be activated.
                </p>
              </div>

              <div className="form-navigation">
                {/* Only show back button if there's a previous step to go back to */}
                {/* For logged-in users: step 2 is their first step, so no back button on step 2 */}
                {/* For guest users: step 1 is their first step, so back button appears from step 2 onwards */}
                {((userChoice === 'login' && currentStep > 2) || (userChoice !== 'login' && currentStep > 1)) && (
                  <button 
                    type="button" 
                    className="nav-btn back-btn"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button 
                    type="button" 
                    className="nav-btn next-btn"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className={`nav-btn submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registering...' : 'Register Car'}
                  </button>
                )}
              </div>
            </>
          )}
        </form>

        {/* Photo Upload Step (after successful registration) */}
        {showPhotoUpload && createdVehicleId && (
          <div className="photo-upload-step">
            <div className="photo-upload-step-header">
              <h2>Add Photos (Optional)</h2>
              <p>Upload photos of your car to make it more attractive to renters</p>
            </div>
            <VehiclePhotoUpload 
              vehicleId={createdVehicleId}
              onPhotosUpdated={() => {
                // Photos updated, can continue
              }}
            />
            <div className="photo-upload-actions">
              <button
                type="button"
                className="nav-btn skip-btn"
                onClick={() => {
                  setShowPhotoUpload(false);
                  if (userChoice === 'guest') {
                    setTimeout(() => {
                      if (externalOnClose) {
                        externalOnClose();
                        navigate('/login');
                      } else {
                        navigate('/login');
                      }
                    }, 500);
                  } else {
                    if (externalOnClose) {
                      externalOnClose();
                    } else {
                      navigate('/owner/dashboard');
                    }
                  }
                }}
              >
                Skip for Now
              </button>
              <button
                type="button"
                className="nav-btn next-btn"
                onClick={() => {
                  setShowPhotoUpload(false);
                  if (userChoice === 'guest') {
                    setTimeout(() => {
                      if (externalOnClose) {
                        externalOnClose();
                        navigate('/login');
                      } else {
                        navigate('/login');
                      }
                    }, 500);
                  } else {
                    if (externalOnClose) {
                      externalOnClose();
                    } else {
                      navigate('/owner/dashboard');
                    }
                  }
                }}
              >
                Continue <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarRegistration;
