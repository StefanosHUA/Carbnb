import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for admin dashboard
  const dashboardStats = {
    totalUsers: 1247,
    totalCars: 892,
    totalBookings: 3456,
    totalRevenue: 125000,
    pendingApprovals: 23,
    activeListings: 789
  };

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', cars: 3, joinDate: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', cars: 1, joinDate: '2023-02-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'suspended', cars: 0, joinDate: '2023-03-10' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'active', cars: 2, joinDate: '2023-01-30' }
  ];

  const mockCars = [
    { id: 1, title: 'Tesla Model 3', owner: 'John Doe', status: 'active', price: 120, location: 'San Francisco' },
    { id: 2, title: 'BMW 3 Series', owner: 'Jane Smith', status: 'pending', price: 90, location: 'Los Angeles' },
    { id: 3, title: 'Toyota Prius', owner: 'Sarah Wilson', status: 'active', price: 60, location: 'Seattle' },
    { id: 4, title: 'Ford Mustang', owner: 'John Doe', status: 'suspended', price: 110, location: 'Miami' }
  ];

  const mockBookings = [
    { id: 1, car: 'Tesla Model 3', renter: 'Alice Brown', startDate: '2024-01-15', endDate: '2024-01-18', total: 360 },
    { id: 2, car: 'BMW 3 Series', renter: 'Bob Green', startDate: '2024-01-20', endDate: '2024-01-22', total: 180 },
    { id: 3, car: 'Toyota Prius', renter: 'Carol White', startDate: '2024-01-25', endDate: '2024-01-27', total: 120 }
  ];

  const renderDashboard = () => (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      
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
            <span className="activity-icon">🚗</span>
            <span className="activity-text">New car registered: Tesla Model S</span>
            <span className="activity-time">2 hours ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">👤</span>
            <span className="activity-text">New user joined: mike@example.com</span>
            <span className="activity-time">4 hours ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📅</span>
            <span className="activity-text">Booking completed: BMW 3 Series</span>
            <span className="activity-time">6 hours ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">⚠️</span>
            <span className="activity-text">User suspended: john@example.com</span>
            <span className="activity-time">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-section">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="add-btn">Add User</button>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Cars</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.cars}</td>
                <td>{user.joinDate}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">Edit</button>
                    <button className="action-btn view">View</button>
                    <button className={`action-btn ${user.status === 'active' ? 'suspend' : 'activate'}`}>
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCars = () => (
    <div className="cars-section">
      <div className="section-header">
        <h2>Car Management</h2>
        <button className="add-btn">Add Car</button>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Price/Day</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockCars.map(car => (
              <tr key={car.id}>
                <td>{car.id}</td>
                <td>{car.title}</td>
                <td>{car.owner}</td>
                <td>
                  <span className={`status-badge ${car.status}`}>
                    {car.status}
                  </span>
                </td>
                <td>${car.price}</td>
                <td>{car.location}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">Edit</button>
                    <button className="action-btn view">View</button>
                    <button className={`action-btn ${car.status === 'active' ? 'suspend' : 'approve'}`}>
                      {car.status === 'active' ? 'Suspend' : 'Approve'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bookings-section">
      <div className="section-header">
        <h2>Booking Management</h2>
        <button className="add-btn">Add Booking</button>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Car</th>
              <th>Renter</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockBookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.car}</td>
                <td>{booking.renter}</td>
                <td>{booking.startDate}</td>
                <td>{booking.endDate}</td>
                <td>${booking.total}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view">View</button>
                    <button className="action-btn edit">Edit</button>
                    <button className="action-btn delete">Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <h2>Admin Settings</h2>
      
      <div className="settings-grid">
        <div className="setting-card">
          <h3>Platform Settings</h3>
          <div className="setting-item">
            <label>Commission Rate (%)</label>
            <input type="number" defaultValue="10" min="0" max="50" />
          </div>
          <div className="setting-item">
            <label>Minimum Booking Duration (days)</label>
            <input type="number" defaultValue="1" min="1" />
          </div>
          <div className="setting-item">
            <label>Maximum Booking Duration (days)</label>
            <input type="number" defaultValue="30" min="1" />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>Security Settings</h3>
          <div className="setting-item">
            <label>Require ID Verification</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Require Insurance</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Auto-approve Listings</label>
            <input type="checkbox" />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>Notification Settings</h3>
          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>SMS Notifications</label>
            <input type="checkbox" />
          </div>
          <div className="setting-item">
            <label>Push Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="save-btn">Save Settings</button>
        <button className="reset-btn">Reset to Default</button>
      </div>
    </div>
  );

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
      </div>
    </div>
  );
}

export default Admin; 