import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { vehiclesAPI, bookingsAPI, usersAPI, documentsAPI, isAdmin } from '../utils/api';

function Admin() {
  const toast = useToastContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateCarForm, setShowCreateCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeListings: 0
  });
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocuments, setUserDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    license_plate: '',
    vin: '',
    transmission: 'automatic',
    fuel_type: 'gasoline',
    category: 'economy',
    seats: 5,
    doors: 4,
    mileage: 0,
    daily_rate: 0,
    deposit_amount: 0,
    engine_size: '',
    horsepower: '',
    weekly_rate: '',
    monthly_rate: '',
    features: '',
    description: '',
    condition_notes: '',
    last_service_date: '',
    location: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      latitude: '',
      longitude: ''
    }
  });

  // Verify admin access (secondary check, route guard is primary)
  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [navigate, toast]);

  // Load dashboard stats
  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin()) {
      loadDashboardStats();
    }
  }, [activeTab]);

  // Load users
  useEffect(() => {
    if (activeTab === 'users' && isAdmin()) {
      loadUsers();
    }
  }, [activeTab, usersPage]);

  // Load cars
  useEffect(() => {
    if (activeTab === 'cars') {
      loadCars();
    }
  }, [activeTab]);

  // Load bookings
  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    if (!isAdmin()) {
      toast.error('Admin access required');
      return;
    }
    
    setLoadingDashboard(true);
    try {
      // Load user stats
      const userStats = await usersAPI.getStats();
      
      // Load vehicles count
      const vehiclesData = await vehiclesAPI.getAll({ limit: 1 });
      const totalCars = vehiclesData?.total || vehiclesData?.length || 0;
      const activeCars = vehiclesData?.filter?.(v => v.is_active)?.length || 0;
      
      // Load bookings count
      const bookingsData = await bookingsAPI.getAll({ page_size: 1 });
      const totalBookings = bookingsData?.total || bookingsData?.items?.length || bookingsData?.length || 0;
      
      setDashboardStats({
        totalUsers: userStats?.total_users || 0,
        totalCars: totalCars,
        totalBookings: totalBookings,
        totalRevenue: 0, // Calculate from bookings if needed
        pendingApprovals: 0, // Calculate if needed
        activeListings: activeCars
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoadingDashboard(false);
    }
  };

  const loadUsers = async () => {
    if (!isAdmin()) {
      toast.error('Admin access required');
      return;
    }
    
    setLoadingUsers(true);
    try {
      const response = await usersAPI.getAll(usersPage, usersPerPage);
      if (response?.users) {
        setUsers(response.users);
        setUsersTotal(response.total || response.users.length);
      } else if (Array.isArray(response)) {
        setUsers(response);
        setUsersTotal(response.length);
      } else {
        setUsers([]);
        setUsersTotal(0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCars = async () => {
    setLoadingCars(true);
    try {
      const response = await vehiclesAPI.getAll({ limit: 100 });
      if (Array.isArray(response)) {
        setCars(response);
      } else if (response?.items) {
        setCars(response.items);
      } else {
        setCars([]);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Failed to load vehicles');
      setCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await bookingsAPI.getAll({ page_size: 100 });
      if (Array.isArray(response)) {
        setBookings(response);
      } else if (response?.bookings) {
        setBookings(response.bookings);
      } else if (response?.items) {
        setBookings(response.items);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await vehiclesAPI.delete(carId);
      toast.success('Vehicle deleted successfully');
      loadCars(); // Reload the list
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error(error.message || 'Failed to delete vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCarStatus = async (car) => {
    const newStatus = !car.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    // If activating, check if vehicle can be activated (has required documents)
    if (newStatus && car.can_be_activated === false) {
      toast.error('Vehicle cannot be activated. It must have license and insurance documents uploaded first.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to ${action} this vehicle?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Use the dedicated activation endpoint as per backend requirements
      await vehiclesAPI.activate(car.id, newStatus);
      toast.success(`Vehicle ${action}d successfully`);
      loadCars();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      // Handle specific backend error messages
      if (error.message && error.message.includes('required documents')) {
        toast.error('Vehicle cannot be activated. It must have license and insurance documents uploaded first.');
      } else if (error.message && error.message.includes('administrator')) {
        toast.error('Only administrators can activate vehicles.');
      } else {
        toast.error(error.message || `Failed to ${action} vehicle`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    // Populate form with car data
    setVehicleForm({
      make: car.make || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      color: car.color || '',
      license_plate: car.license_plate || '',
      vin: car.vin || '',
      transmission: car.transmission || 'automatic',
      fuel_type: car.fuel_type || 'gasoline',
      category: car.category || 'economy',
      seats: car.seats || 5,
      doors: car.doors || 4,
      mileage: car.mileage || 0,
      daily_rate: car.daily_rate || 0,
      deposit_amount: car.deposit_amount || 0,
      engine_size: car.engine_size || '',
      horsepower: car.horsepower || '',
      weekly_rate: car.weekly_rate || '',
      monthly_rate: car.monthly_rate || '',
      features: car.features || '',
      description: car.description || '',
      condition_notes: car.condition_notes || '',
      last_service_date: car.last_service_date ? car.last_service_date.split('T')[0] : '',
      location: car.location ? {
        name: car.location.name || '',
        address: car.location.address || '',
        city: car.location.city || '',
        state: car.location.state || '',
        country: car.location.country || '',
        postal_code: car.location.postal_code || '',
        latitude: car.location.latitude || '',
        longitude: car.location.longitude || ''
      } : {
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        latitude: '',
        longitude: ''
      }
    });
    setShowCreateCarForm(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await bookingsAPI.cancel(bookingId);
      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUserDocuments = async (user) => {
    setSelectedUser(user);
    setShowDocumentsModal(true);
    setLoadingDocuments(true);
    try {
      const userData = await usersAPI.getById(user.id);
      setUserDocuments(userData.documents || []);
    } catch (error) {
      console.error('Error loading user documents:', error);
      toast.error('Failed to load user documents');
      setUserDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleVerifyDocument = async (documentId, verified) => {
    try {
      await documentsAPI.verify(documentId, verified);
      toast.success(`Document ${verified ? 'verified' : 'rejected'} successfully`);
      // Reload documents
      if (selectedUser) {
        const userData = await usersAPI.getById(selectedUser.id);
        setUserDocuments(userData.documents || []);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error(error.message || 'Failed to verify document');
    }
  };

  const handleVehicleFormChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setVehicleForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
      setVehicleForm(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
    
    // Clear error for this field
    if (formErrors[name] || formErrors[`location.${name.split('.')[1]}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors[`location.${name.split('.')[1]}`];
        return newErrors;
      });
    }
  };

  const validateVehicleForm = () => {
    const errors = {};
    
    // Required vehicle fields
    if (!vehicleForm.make.trim()) errors.make = 'Make is required';
    if (!vehicleForm.model.trim()) errors.model = 'Model is required';
    if (!vehicleForm.year || vehicleForm.year < 1900 || vehicleForm.year > 2030) {
      errors.year = 'Year must be between 1900 and 2030';
    }
    if (!vehicleForm.color.trim()) errors.color = 'Color is required';
    if (!vehicleForm.license_plate.trim()) errors.license_plate = 'License plate is required';
    if (!vehicleForm.vin || vehicleForm.vin.length !== 17) {
      errors.vin = 'VIN must be exactly 17 characters';
    }
    if (!vehicleForm.seats || vehicleForm.seats < 1 || vehicleForm.seats > 50) {
      errors.seats = 'Seats must be between 1 and 50';
    }
    if (!vehicleForm.doors || vehicleForm.doors < 2 || vehicleForm.doors > 6) {
      errors.doors = 'Doors must be between 2 and 6';
    }
    if (vehicleForm.mileage < 0) errors.mileage = 'Mileage must be 0 or greater';
    if (vehicleForm.daily_rate <= 0) errors.daily_rate = 'Daily rate must be greater than 0';
    if (vehicleForm.deposit_amount < 0) errors.deposit_amount = 'Deposit amount must be 0 or greater';
    
    // Required location fields (only for create, not edit)
    if (!editingCar) {
      if (!vehicleForm.location.name.trim()) errors['location.name'] = 'Location name is required';
      if (!vehicleForm.location.address.trim()) errors['location.address'] = 'Address is required';
      if (!vehicleForm.location.city.trim()) errors['location.city'] = 'City is required';
      if (!vehicleForm.location.state.trim()) errors['location.state'] = 'State is required';
      if (!vehicleForm.location.country.trim()) errors['location.country'] = 'Country is required';
      if (!vehicleForm.location.postal_code.trim()) errors['location.postal_code'] = 'Postal code is required';
    }
    
    // Optional numeric validations
    if (vehicleForm.engine_size && (vehicleForm.engine_size < 0.5 || vehicleForm.engine_size > 10.0)) {
      errors.engine_size = 'Engine size must be between 0.5 and 10.0 liters';
    }
    if (vehicleForm.horsepower && (vehicleForm.horsepower < 50 || vehicleForm.horsepower > 2000)) {
      errors.horsepower = 'Horsepower must be between 50 and 2000';
    }
    if (vehicleForm.weekly_rate && vehicleForm.weekly_rate < 0) {
      errors.weekly_rate = 'Weekly rate must be 0 or greater';
    }
    if (vehicleForm.monthly_rate && vehicleForm.monthly_rate < 0) {
      errors.monthly_rate = 'Monthly rate must be 0 or greater';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    
    if (!validateVehicleForm()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
        year: parseInt(vehicleForm.year),
        color: vehicleForm.color.trim(),
        license_plate: vehicleForm.license_plate.trim().toUpperCase(),
        vin: vehicleForm.vin.trim().toUpperCase(),
        transmission: vehicleForm.transmission,
        fuel_type: vehicleForm.fuel_type,
        category: vehicleForm.category,
        seats: parseInt(vehicleForm.seats),
        doors: parseInt(vehicleForm.doors),
        mileage: parseInt(vehicleForm.mileage),
        daily_rate: parseFloat(vehicleForm.daily_rate),
        deposit_amount: parseFloat(vehicleForm.deposit_amount),
        location: {
          name: vehicleForm.location.name.trim(),
          address: vehicleForm.location.address.trim(),
          city: vehicleForm.location.city.trim(),
          state: vehicleForm.location.state.trim(),
          country: vehicleForm.location.country.trim(),
          postal_code: vehicleForm.location.postal_code.trim(),
          latitude: vehicleForm.location.latitude ? parseFloat(vehicleForm.location.latitude) : null,
          longitude: vehicleForm.location.longitude ? parseFloat(vehicleForm.location.longitude) : null
        }
      };
      
      // Add optional fields if provided
      if (vehicleForm.engine_size) payload.engine_size = parseFloat(vehicleForm.engine_size);
      if (vehicleForm.horsepower) payload.horsepower = parseInt(vehicleForm.horsepower);
      if (vehicleForm.weekly_rate) payload.weekly_rate = parseFloat(vehicleForm.weekly_rate);
      if (vehicleForm.monthly_rate) payload.monthly_rate = parseFloat(vehicleForm.monthly_rate);
      if (vehicleForm.features) payload.features = vehicleForm.features;
      if (vehicleForm.description) payload.description = vehicleForm.description;
      if (vehicleForm.condition_notes) payload.condition_notes = vehicleForm.condition_notes;
      if (vehicleForm.last_service_date) payload.last_service_date = vehicleForm.last_service_date;
      
      const result = await vehiclesAPI.create(payload);
      
      toast.success(`Vehicle ${result.make} ${result.model} created successfully!`);
      
      // Reset form and close
      resetVehicleForm();
      setShowCreateCarForm(false);
      loadCars();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error(error.message || 'Failed to create vehicle. Please check all fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    
    if (!validateVehicleForm()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {};
      
      // Only include fields that have changed or are required
      if (vehicleForm.make) payload.make = vehicleForm.make.trim();
      if (vehicleForm.model) payload.model = vehicleForm.model.trim();
      if (vehicleForm.year) payload.year = parseInt(vehicleForm.year);
      if (vehicleForm.color) payload.color = vehicleForm.color.trim();
      if (vehicleForm.license_plate) payload.license_plate = vehicleForm.license_plate.trim().toUpperCase();
      if (vehicleForm.vin) payload.vin = vehicleForm.vin.trim().toUpperCase();
      if (vehicleForm.transmission) payload.transmission = vehicleForm.transmission;
      if (vehicleForm.fuel_type) payload.fuel_type = vehicleForm.fuel_type;
      if (vehicleForm.category) payload.category = vehicleForm.category;
      if (vehicleForm.seats) payload.seats = parseInt(vehicleForm.seats);
      if (vehicleForm.doors) payload.doors = parseInt(vehicleForm.doors);
      if (vehicleForm.mileage !== undefined) payload.mileage = parseInt(vehicleForm.mileage);
      if (vehicleForm.daily_rate) payload.daily_rate = parseFloat(vehicleForm.daily_rate);
      if (vehicleForm.deposit_amount !== undefined) payload.deposit_amount = parseFloat(vehicleForm.deposit_amount);
      
      if (vehicleForm.engine_size) payload.engine_size = parseFloat(vehicleForm.engine_size);
      if (vehicleForm.horsepower) payload.horsepower = parseInt(vehicleForm.horsepower);
      if (vehicleForm.weekly_rate) payload.weekly_rate = parseFloat(vehicleForm.weekly_rate);
      if (vehicleForm.monthly_rate) payload.monthly_rate = parseFloat(vehicleForm.monthly_rate);
      if (vehicleForm.features !== undefined) payload.features = vehicleForm.features;
      if (vehicleForm.description !== undefined) payload.description = vehicleForm.description;
      if (vehicleForm.condition_notes !== undefined) payload.condition_notes = vehicleForm.condition_notes;
      if (vehicleForm.last_service_date) payload.last_service_date = vehicleForm.last_service_date;
      
      const result = await vehiclesAPI.update(editingCar.id, payload);
      
      toast.success(`Vehicle ${result.make || editingCar.make} ${result.model || editingCar.model} updated successfully!`);
      
      resetVehicleForm();
      setEditingCar(null);
      loadCars();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error(error.message || 'Failed to update vehicle. Please check all fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      license_plate: '',
      vin: '',
      transmission: 'automatic',
      fuel_type: 'gasoline',
      category: 'economy',
      seats: 5,
      doors: 4,
      mileage: 0,
      daily_rate: 0,
      deposit_amount: 0,
      engine_size: '',
      horsepower: '',
      weekly_rate: '',
      monthly_rate: '',
      features: '',
      description: '',
      condition_notes: '',
      last_service_date: '',
      location: {
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        latitude: '',
        longitude: ''
      }
    });
    setFormErrors({});
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      
      {loadingDashboard ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading statistics...</div>
      ) : (
        <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{dashboardStats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{dashboardStats.totalCars}</h3>
            <p>Total Cars</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{dashboardStats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${dashboardStats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{dashboardStats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{dashboardStats.activeListings}</h3>
            <p>Active Listings</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
                <span className="activity-icon">ℹ️</span>
                <span className="activity-text">Dashboard statistics are updated in real-time</span>
                <span className="activity-time">Just now</span>
          </div>
          </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="users-section">
      <div className="section-header">
        <h2>User Management</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="add-btn" onClick={loadUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {loadingUsers ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading users...</div>
      ) : (
        <>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
                  <th>Role</th>
                  <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                      <td>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username || user.email?.split('@')[0] || 'N/A'}</td>
                <td>{user.email}</td>
                <td>
                        <span className={`status-badge ${user.is_active !== false ? 'active' : 'suspended'}`}>
                          {user.is_active !== false ? 'active' : 'suspended'}
                  </span>
                </td>
                      <td>{user.role || 'user'}</td>
                      <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            onClick={() => handleViewUserDocuments(user)}
                          >
                            View Documents
                    </button>
                  </div>
                </td>
              </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>
          
          {usersTotal > usersPerPage && (
            <div className="pagination" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                disabled={usersPage === 1 || loadingUsers}
              >
                Previous
              </button>
              <span>Page {usersPage} of {Math.ceil(usersTotal / usersPerPage)}</span>
              <button 
                onClick={() => setUsersPage(p => p + 1)}
                disabled={usersPage >= Math.ceil(usersTotal / usersPerPage) || loadingUsers}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderCars = () => (
    <div className="cars-section">
      <div className="section-header">
        <h2>Car Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="add-btn" onClick={loadCars} disabled={loadingCars}>
            {loadingCars ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="add-btn" onClick={() => {
            resetVehicleForm();
            setEditingCar(null);
            setShowCreateCarForm(true);
          }}>
            Add Car
          </button>
        </div>
      </div>
      
      {loadingCars ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading vehicles...</div>
      ) : (
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
                <th>Make/Model</th>
                <th>Year</th>
              <th>Status</th>
              <th>Price/Day</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No vehicles found
                  </td>
                </tr>
              ) : (
                cars.map(car => (
              <tr key={car.id}>
                <td>{car.id}</td>
                    <td>{car.make} {car.model}</td>
                    <td>{car.year}</td>
                <td>
                      <span className={`status-badge ${car.is_active ? 'active' : 'suspended'}`}>
                        {car.is_active ? 'active' : 'inactive'}
                  </span>
                </td>
                    <td>${car.daily_rate?.toFixed(2) || '0.00'}</td>
                    <td>
                      {(() => {
                        if (!car.location) return 'N/A';
                        const city = car.location.city || '';
                        const state = car.location.state || '';
                        let locationStr = '';
                        if (city && state) {
                          locationStr = `${city}, ${state}`;
                        } else if (city) {
                          locationStr = city;
                        } else if (state) {
                          locationStr = state;
                        } else if (car.location.name) {
                          locationStr = car.location.name;
                        } else if (car.location.address) {
                          locationStr = car.location.address;
                        } else {
                          locationStr = 'N/A';
                        }
                        return locationStr;
                      })()}
                    </td>
                <td>
                  <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEditCar(car)}
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn view"
                          onClick={() => {
                            const carInfo = JSON.stringify(car, null, 2);
                            alert(`Vehicle Details:\n\n${carInfo}`);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className={`action-btn ${car.is_active ? 'suspend' : 'approve'}`}
                          onClick={() => handleToggleCarStatus(car)}
                          disabled={isLoading || (!car.is_active && car.can_be_activated === false)}
                          title={!car.is_active && car.can_be_activated === false ? 'Vehicle needs license and insurance documents before activation' : ''}
                        >
                          {car.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteCar(car.id)}
                          disabled={isLoading}
                        >
                          Delete
                    </button>
                  </div>
                </td>
              </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="bookings-section">
      <div className="section-header">
        <h2>Booking Management</h2>
        <button className="add-btn" onClick={loadBookings} disabled={loadingBookings}>
          {loadingBookings ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loadingBookings ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading bookings...</div>
      ) : (
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
                <th>Vehicle</th>
                <th>User ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total</th>
                <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                    <td>Vehicle #{booking.vehicle_id || 'N/A'}</td>
                    <td>{booking.user_id || 'N/A'}</td>
                    <td>{booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}</td>
                    <td>${booking.total_cost?.toFixed(2) || booking.total_amount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status-badge ${booking.status || 'pending'}`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                <td>
                  <div className="action-buttons">
                        <button 
                          className="action-btn view"
                          onClick={() => {
                            const bookingInfo = JSON.stringify(booking, null, 2);
                            alert(`Booking Details:\n\n${bookingInfo}`);
                          }}
                        >
                          View
                        </button>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                        )}
                  </div>
                </td>
              </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <h2>Admin Settings</h2>
      <p style={{ color: '#717171', marginBottom: '24px' }}>
        Settings functionality coming soon.
      </p>
    </div>
  );

  const getDocTypeLabel = (type) => {
    const labels = {
      'id': 'ID Card',
      'driver_license': 'Driver License',
      'passport': 'Passport',
    };
    return labels[type] || type;
  };

  const renderDocumentsModal = () => {
    if (!showDocumentsModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowDocumentsModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
          <div className="modal-header">
            <h2>
              Documents for {selectedUser?.first_name && selectedUser?.last_name 
                ? `${selectedUser.first_name} ${selectedUser.last_name}`
                : selectedUser?.username || selectedUser?.email || 'User'}
            </h2>
            <button className="modal-close" onClick={() => setShowDocumentsModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            {loadingDocuments ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading documents...</div>
            ) : userDocuments.length === 0 ? (
              <div style={{ textAlign: 'center' }}>
                <p>No documents uploaded</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px', width: '100%' }}>
                {userDocuments.map((doc) => (
                  <div key={doc.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h4>{getDocTypeLabel(doc.doc_type)}</h4>
                        <p style={{ color: '#717171', fontSize: '14px' }}>
                          {doc.file_name || 'Document'}
                          {doc.uploaded_at && ` • Uploaded ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className={`status-badge ${doc.is_verified ? 'verified' : 'pending'}`}>
                        {doc.is_verified ? 'Verified' : 'Pending Review'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="action-btn view"
                        onClick={async () => {
                          try {
                            const response = await documentsAPI.getDownloadUrl(doc.id);
                            if (response.download_url) {
                              window.open(response.download_url, '_blank');
                            }
                          } catch (error) {
                            toast.error('Failed to download document');
                          }
                        }}
                      >
                        <i className="fas fa-download"></i> View
                      </button>
                      {!doc.is_verified && (
                        <>
                          <button 
                            className="action-btn"
                            style={{ backgroundColor: '#4CAF50', color: 'white' }}
                            onClick={() => handleVerifyDocument(doc.id, true)}
                          >
                            <i className="fas fa-check"></i> Approve
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleVerifyDocument(doc.id, false)}
                          >
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCreateCarForm = () => {
    if (!showCreateCarForm && !editingCar) return null;
    
    return (
      <div className="create-vehicle-form-container">
        <div className="create-vehicle-form">
          <button
            onClick={() => {
              setShowCreateCarForm(false);
              setEditingCar(null);
              setFormErrors({});
              resetVehicleForm();
            }}
            className="close-btn"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#717171',
              zIndex: 1
            }}
          >
            ×
          </button>
          
          <h2 style={{ marginBottom: '24px' }}>
            {editingCar ? 'Edit Vehicle' : 'Create New Vehicle'}
          </h2>
          
          <form onSubmit={editingCar ? handleUpdateVehicle : handleCreateVehicle}>
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Make *</label>
                  <input
                    type="text"
                    name="make"
                    value={vehicleForm.make}
                    onChange={handleVehicleFormChange}
                    required
                    className={formErrors.make ? 'error' : ''}
                  />
                  {formErrors.make && <span className="error-text">{formErrors.make}</span>}
          </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    name="model"
                    value={vehicleForm.model}
                    onChange={handleVehicleFormChange}
                    required
                    className={formErrors.model ? 'error' : ''}
                  />
                  {formErrors.model && <span className="error-text">{formErrors.model}</span>}
          </div>
              </div>
              
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={vehicleForm.year}
                    onChange={handleVehicleFormChange}
                    min="1900"
                    max="2030"
                    required
                    className={formErrors.year ? 'error' : ''}
                  />
                  {formErrors.year && <span className="error-text">{formErrors.year}</span>}
                </div>
                <div className="form-group">
                  <label>Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={vehicleForm.color}
                    onChange={handleVehicleFormChange}
                    required
                    className={formErrors.color ? 'error' : ''}
                  />
                  {formErrors.color && <span className="error-text">{formErrors.color}</span>}
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={vehicleForm.category}
                    onChange={handleVehicleFormChange}
                    required
                  >
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
          </div>
        </div>
        
              <div className="form-row">
                <div className="form-group">
                  <label>License Plate *</label>
                  <input
                    type="text"
                    name="license_plate"
                    value={vehicleForm.license_plate}
                    onChange={handleVehicleFormChange}
                    required
                    className={formErrors.license_plate ? 'error' : ''}
                  />
                  {formErrors.license_plate && <span className="error-text">{formErrors.license_plate}</span>}
          </div>
                <div className="form-group">
                  <label>VIN (17 characters) *</label>
                  <input
                    type="text"
                    name="vin"
                    value={vehicleForm.vin}
                    onChange={handleVehicleFormChange}
                    maxLength="17"
                    required
                    className={formErrors.vin ? 'error' : ''}
                  />
                  {formErrors.vin && <span className="error-text">{formErrors.vin}</span>}
          </div>
          </div>
        </div>
        
            {/* Specifications */}
            <div className="form-section">
              <h3>Specifications</h3>
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label>Transmission *</label>
                  <select
                    name="transmission"
                    value={vehicleForm.transmission}
                    onChange={handleVehicleFormChange}
                    required
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="semi_automatic">Semi-Automatic</option>
                  </select>
          </div>
                <div className="form-group">
                  <label>Fuel Type *</label>
                  <select
                    name="fuel_type"
                    value={vehicleForm.fuel_type}
                    onChange={handleVehicleFormChange}
                    required
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="plugin_hybrid">Plugin Hybrid</option>
                  </select>
          </div>
                <div className="form-group">
                  <label>Mileage *</label>
                  <input
                    type="number"
                    name="mileage"
                    value={vehicleForm.mileage}
                    onChange={handleVehicleFormChange}
                    min="0"
                    required
                    className={formErrors.mileage ? 'error' : ''}
                  />
                  {formErrors.mileage && <span className="error-text">{formErrors.mileage}</span>}
                </div>
              </div>
              
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label>Seats *</label>
                  <input
                    type="number"
                    name="seats"
                    value={vehicleForm.seats}
                    onChange={handleVehicleFormChange}
                    min="1"
                    max="50"
                    required
                    className={formErrors.seats ? 'error' : ''}
                  />
                  {formErrors.seats && <span className="error-text">{formErrors.seats}</span>}
                </div>
                <div className="form-group">
                  <label>Doors *</label>
                  <input
                    type="number"
                    name="doors"
                    value={vehicleForm.doors}
                    onChange={handleVehicleFormChange}
                    min="2"
                    max="6"
                    required
                    className={formErrors.doors ? 'error' : ''}
                  />
                  {formErrors.doors && <span className="error-text">{formErrors.doors}</span>}
                </div>
                <div className="form-group">
                  <label>Engine Size (L)</label>
                  <input
                    type="number"
                    name="engine_size"
                    value={vehicleForm.engine_size}
                    onChange={handleVehicleFormChange}
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    className={formErrors.engine_size ? 'error' : ''}
                  />
                  {formErrors.engine_size && <span className="error-text">{formErrors.engine_size}</span>}
                </div>
                <div className="form-group">
                  <label>Horsepower</label>
                  <input
                    type="number"
                    name="horsepower"
                    value={vehicleForm.horsepower}
                    onChange={handleVehicleFormChange}
                    min="50"
                    max="2000"
                    className={formErrors.horsepower ? 'error' : ''}
                  />
                  {formErrors.horsepower && <span className="error-text">{formErrors.horsepower}</span>}
          </div>
        </div>
      </div>
      
            {/* Pricing */}
            <div className="form-section">
              <h3>Pricing</h3>
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label>Daily Rate ($) *</label>
                  <input
                    type="number"
                    name="daily_rate"
                    value={vehicleForm.daily_rate}
                    onChange={handleVehicleFormChange}
                    min="0"
                    step="0.01"
                    required
                    className={formErrors.daily_rate ? 'error' : ''}
                  />
                  {formErrors.daily_rate && <span className="error-text">{formErrors.daily_rate}</span>}
                </div>
                <div className="form-group">
                  <label>Weekly Rate ($)</label>
                  <input
                    type="number"
                    name="weekly_rate"
                    value={vehicleForm.weekly_rate}
                    onChange={handleVehicleFormChange}
                    min="0"
                    step="0.01"
                    className={formErrors.weekly_rate ? 'error' : ''}
                  />
                  {formErrors.weekly_rate && <span className="error-text">{formErrors.weekly_rate}</span>}
                </div>
                <div className="form-group">
                  <label>Monthly Rate ($)</label>
                  <input
                    type="number"
                    name="monthly_rate"
                    value={vehicleForm.monthly_rate}
                    onChange={handleVehicleFormChange}
                    min="0"
                    step="0.01"
                    className={formErrors.monthly_rate ? 'error' : ''}
                  />
                  {formErrors.monthly_rate && <span className="error-text">{formErrors.monthly_rate}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Deposit Amount ($) *</label>
                <input
                  type="number"
                  name="deposit_amount"
                  value={vehicleForm.deposit_amount}
                  onChange={handleVehicleFormChange}
                  min="0"
                  step="0.01"
                  required
                  className={formErrors.deposit_amount ? 'error' : ''}
                />
                {formErrors.deposit_amount && <span className="error-text">{formErrors.deposit_amount}</span>}
              </div>
            </div>
            
            {/* Location - Only required for create */}
            {!editingCar && (
              <div className="form-section">
                <h3>Location</h3>
                <div className="form-group">
                  <label>Location Name *</label>
                  <input
                    type="text"
                    name="location.name"
                    value={vehicleForm.location.name}
                    onChange={handleVehicleFormChange}
                    required
                    className={formErrors['location.name'] ? 'error' : ''}
                  />
                  {formErrors['location.name'] && <span className="error-text">{formErrors['location.name']}</span>}
                </div>
                
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="location.address"
                    value={vehicleForm.location.address}
                    onChange={handleVehicleFormChange}
                    required
                    className={formErrors['location.address'] ? 'error' : ''}
                  />
                  {formErrors['location.address'] && <span className="error-text">{formErrors['location.address']}</span>}
                </div>
                
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="location.city"
                      value={vehicleForm.location.city}
                      onChange={handleVehicleFormChange}
                      required
                      className={formErrors['location.city'] ? 'error' : ''}
                    />
                    {formErrors['location.city'] && <span className="error-text">{formErrors['location.city']}</span>}
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="location.state"
                      value={vehicleForm.location.state}
                      onChange={handleVehicleFormChange}
                      required
                      className={formErrors['location.state'] ? 'error' : ''}
                    />
                    {formErrors['location.state'] && <span className="error-text">{formErrors['location.state']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      name="location.postal_code"
                      value={vehicleForm.location.postal_code}
                      onChange={handleVehicleFormChange}
                      required
                      className={formErrors['location.postal_code'] ? 'error' : ''}
                    />
                    {formErrors['location.postal_code'] && <span className="error-text">{formErrors['location.postal_code']}</span>}
                  </div>
                </div>
                
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="form-group">
                    <label>Country *</label>
                    <input
                      type="text"
                      name="location.country"
                      value={vehicleForm.location.country}
                      onChange={handleVehicleFormChange}
                      required
                      className={formErrors['location.country'] ? 'error' : ''}
                    />
                    {formErrors['location.country'] && <span className="error-text">{formErrors['location.country']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      name="location.latitude"
                      value={vehicleForm.location.latitude}
                      onChange={handleVehicleFormChange}
                      step="0.000001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      name="location.longitude"
                      value={vehicleForm.location.longitude}
                      onChange={handleVehicleFormChange}
                      step="0.000001"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional Information */}
            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label>Features (JSON string)</label>
                <input
                  type="text"
                  name="features"
                  value={vehicleForm.features}
                  onChange={handleVehicleFormChange}
                  placeholder='e.g., ["GPS", "Bluetooth", "Backup Camera"]'
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={vehicleForm.description}
                  onChange={handleVehicleFormChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Condition Notes</label>
                <textarea
                  name="condition_notes"
                  value={vehicleForm.condition_notes}
                  onChange={handleVehicleFormChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Last Service Date</label>
                <input
                  type="date"
                  name="last_service_date"
                  value={vehicleForm.last_service_date}
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowCreateCarForm(false);
                  setEditingCar(null);
                  setFormErrors({});
                  resetVehicleForm();
                }}
                className="secondary-btn"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (editingCar ? 'Updating...' : 'Creating...') : (editingCar ? 'Update Vehicle' : 'Create Vehicle')}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="admin-header">
            <h1>Admin Panel</h1>
            <p>Carbnb Management</p>
          </div>
          
          <nav className="admin-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button 
              className={`nav-item ${activeTab === 'cars' ? 'active' : ''}`}
              onClick={() => setActiveTab('cars')}
            >
              🚗 Cars
            </button>
            <button 
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              📅 Bookings
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>
          
          <div className="admin-footer">
            <Link to="/" className="back-link">
              ← Back to Site
            </Link>
          </div>
        </div>
        
        <div className="admin-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'cars' && renderCars()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'settings' && renderSettings()}
        </div>
        
        {renderCreateCarForm()}
        {renderDocumentsModal()}
      </div>
    </div>
  );
}

export default Admin; 
