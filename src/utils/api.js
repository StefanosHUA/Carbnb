/**
 * Centralized API Service for Carbnb Frontend
 * Handles all API communication with the backend microservices
 */

// Microservice URLs
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8002';
const VEHICLE_SERVICE_URL = process.env.REACT_APP_VEHICLE_SERVICE_URL || 'http://localhost:3003';
const BOOKING_SERVICE_URL = process.env.REACT_APP_BOOKING_SERVICE_URL || 'http://localhost:8003';
const API_BASE_URL = process.env.REACT_APP_API_URL || USER_SERVICE_URL;

/**
 * Get the appropriate base URL for a given service
 * @param {string} service - Service name: 'auth', 'vehicles', 'bookings', 'payments', 'upload', 'sales'
 * @returns {string} Base URL for the service
 */
const getServiceUrl = (service) => {
  switch (service) {
    case 'vehicles':
      return VEHICLE_SERVICE_URL;
    case 'auth':
    case 'users':
      return USER_SERVICE_URL;
    case 'bookings':
      return BOOKING_SERVICE_URL;
    default:
      // For other services, use API_BASE_URL (could be API Gateway)
      return API_BASE_URL;
  }
};

/**
 * Get authentication token from localStorage
 * Checks both carbnb_token and carbnb_user.token
 */
const getAuthToken = () => {
  // First check for dedicated token storage
  const token = localStorage.getItem('carbnb_token');
  if (token) {
    return token;
  }
  
  // Fallback to user object token
  const user = localStorage.getItem('carbnb_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Get user data from localStorage
 * Returns user object with id, role, etc.
 */
export const getUserData = () => {
  const user = localStorage.getItem('carbnb_user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Get default headers for API requests
 */
const getHeaders = (includeAuth = true, contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] Authorization header set with token (length:', token.length, ')');
    } else {
      console.warn('[API] includeAuth is true but no token found in localStorage');
    }
    
    // Add X-User-Id and X-User-Role headers required by backend services
    const userData = getUserData();
    if (userData) {
      // Use id, user_id, or userId field (whichever is available)
      const userId = userData.id || userData.user_id || userData.userId;
      if (userId) {
        headers['X-User-Id'] = String(userId);
      } else {
        // Log warning if user ID is not found
        console.warn('[API] User data found but no ID field available. User data:', userData);
      }
      
      // Add role if available
      if (userData.role) {
        headers['X-User-Role'] = String(userData.role);
        console.log('[API] User role:', userData.role);
      } else {
        // Default role if not specified
        headers['X-User-Role'] = 'user';
        console.warn('[API] User role not found, defaulting to "user"');
      }
    } else {
      // Log warning if no user data found but auth is requested
      console.warn('[API] includeAuth is true but no user data found in localStorage');
    }
  }

  return headers;
};

/**
 * Handle API response
 */
/**
 * Extract error message from FastAPI/Pydantic validation errors
 * Handles both single string errors and array of validation error objects
 */
const extractErrorMessage = (errorData) => {
  if (!errorData) return 'An error occurred';
  
  // If detail is a string, use it directly
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }
  
  // If detail is an array (FastAPI validation errors), format them
  if (Array.isArray(errorData.detail)) {
    return errorData.detail
      .map(err => {
        // Handle validation error objects: {type, loc, msg, input, url}
        if (typeof err === 'object' && err.msg) {
          const field = Array.isArray(err.loc) && err.loc.length > 1 
            ? err.loc.slice(1).join('.') 
            : Array.isArray(err.loc) && err.loc.length > 0
            ? err.loc[0]
            : 'field';
          return `${field}: ${err.msg}`;
        }
        // If it's already a string
        return String(err);
      })
      .join(', ');
  }
  
  // Fallback to other error fields
  return errorData.message || errorData.error || JSON.stringify(errorData);
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorData = null;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        errorData = await response.json();
        errorMessage = extractErrorMessage(errorData);
        console.error(`[API] Error response:`, errorData);
        
        // Provide more helpful error messages for common issues
        if (response.status === 401) {
          const userData = getUserData();
          if (!userData) {
            errorMessage = 'Authentication required. Please log in.';
          } else if (!userData.token && !getAuthToken()) {
            errorMessage = 'Session expired. Please log in again.';
          } else {
            errorMessage = errorMessage || 'Unauthorized. Please check your credentials.';
          }
        } else if (response.status === 403) {
          const userData = getUserData();
          if (userData && userData.role && !['admin', 'super_admin'].includes(userData.role)) {
            errorMessage = 'Admin access required. Your current role: ' + (userData.role || 'user');
          } else {
            errorMessage = errorMessage || 'Access forbidden. Insufficient permissions.';
          }
        }
      } catch (e) {
        // If JSON parsing fails, try text
        const textError = await response.text();
        errorMessage = textError || errorMessage;
        console.error(`[API] Error response (text):`, textError);
      }
    } else {
      errorMessage = await response.text() || errorMessage;
      console.error(`[API] Error response (non-JSON):`, errorMessage);
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (contentType && contentType.includes('application/json')) {
    const jsonData = await response.json();
    console.log(`[API] Success response for ${response.url}:`, jsonData);
    return jsonData;
  }
  
  return await response.text();
};

/**
 * Make API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    includeAuth = true,
    contentType = 'application/json',
    headers: customHeaders = {},
    service = null, // Service name to determine which base URL to use
  } = options;

  // Determine base URL based on service or endpoint
  let baseUrl = API_BASE_URL;
  if (service) {
    baseUrl = getServiceUrl(service);
  } else if (endpoint.includes('/vehicles')) {
    baseUrl = getServiceUrl('vehicles');
  } else if (endpoint.includes('/bookings') || endpoint.includes('/sales')) {
    baseUrl = getServiceUrl('bookings');
  } else if (endpoint.includes('/auth') || endpoint.includes('/users') || endpoint.includes('/documents')) {
    baseUrl = getServiceUrl('users');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  const headers = contentType === null 
    ? getHeaders(includeAuth, 'application/json') // Get auth headers but don't set Content-Type for FormData
    : getHeaders(includeAuth, contentType);
  
  // Remove Content-Type header if contentType is null (for FormData)
  if (contentType === null) {
    delete headers['Content-Type'];
  }
  
  const config = {
    method,
    headers: {
      ...headers,
      ...customHeaders,
    },
  };

  if (body && method !== 'GET') {
    if (contentType === 'application/json') {
      config.body = JSON.stringify(body);
    } else {
      config.body = body;
    }
  }

  try {
    console.log(`[API] ${method} ${url}`, body ? { body } : '');
    const response = await fetch(url, config);
    console.log(`[API] Response status: ${response.status} for ${method} ${url}`);
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && includeAuth && !endpoint.includes('/auth/refresh-token') && !endpoint.includes('/auth/logout')) {
      try {
        // Try to refresh token
        const refreshUrl = `${getServiceUrl('users')}/api/v1/auth/refresh-token`;
        const refreshHeaders = getHeaders(true, 'application/json');
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: refreshHeaders,
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData && refreshData.access_token) {
            localStorage.setItem('carbnb_token', refreshData.access_token);
            // Retry the original request with new token
            const newHeaders = getHeaders(true, contentType);
            if (contentType === null) {
              delete newHeaders['Content-Type'];
            }
            const retryConfig = {
              ...config,
              headers: {
                ...newHeaders,
                ...customHeaders,
              },
            };
            const retryResponse = await fetch(url, retryConfig);
            return await handleResponse(retryResponse);
          }
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        // If refresh fails, clear auth and let the error propagate
        localStorage.removeItem('carbnb_token');
        localStorage.removeItem('carbnb_user');
      }
    }
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`[API] Request Error for ${method} ${url}:`, error);
    // If it's a network error (CORS, connection refused, etc.)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const networkError = new Error(`Cannot connect to backend at ${url}. Is the backend running?`);
      networkError.status = 0;
      networkError.data = { detail: 'Network error - backend may not be running or CORS is blocking the request' };
      throw networkError;
    }
    throw error;
  }
};

/**
 * Test backend connection
 * GET /health
 */
export const testConnection = async () => {
  try {
    const response = await apiRequest('/health', {
      method: 'GET',
      includeAuth: false,
      service: 'auth',
    });
    console.log('[API] Backend connection test successful:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('[API] Backend connection test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register: async (userData) => {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: userData,
      includeAuth: false,
      service: 'auth',
    });
  },

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login: async (credentials) => {
    return apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: credentials,
      includeAuth: false,
      service: 'auth',
    });
  },

  /**
   * Register/Login with Google OAuth
   * POST /api/v1/auth/google
   */
  registerGoogle: async (googleData) => {
    return apiRequest('/api/v1/auth/google', {
      method: 'POST',
      body: googleData,
      includeAuth: false,
      service: 'auth',
    });
  },

  /**
   * Login with Google OAuth (same endpoint as register)
   * POST /api/v1/auth/google
   */
  loginGoogle: async (googleData) => {
    return apiRequest('/api/v1/auth/google', {
      method: 'POST',
      body: googleData,
      includeAuth: false,
      service: 'auth',
    });
  },

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getProfile: async () => {
    return apiRequest('/api/v1/auth/me', { service: 'auth' });
  },

  /**
   * Get current user profile with documents
   * GET /api/v1/users/me
   */
  getMyProfile: async () => {
    return apiRequest('/api/v1/users/me', { service: 'users' });
  },

  /**
   * Update user profile
   * PUT /api/v1/users/me
   */
  updateProfile: async (userData) => {
    return apiRequest('/api/v1/users/me', {
      method: 'PUT',
      body: userData,
      service: 'users',
    });
  },

  /**
   * Update user email
   * PUT /api/v1/users/me/email
   */
  updateEmail: async (newEmail, password = null) => {
    return apiRequest('/api/v1/users/me/email', {
      method: 'PUT',
      body: { new_email: newEmail, password },
      service: 'users',
    });
  },

  /**
   * Update username
   * PUT /api/v1/users/me/username
   */
  updateUsername: async (newUsername, password = null) => {
    return apiRequest('/api/v1/users/me/username', {
      method: 'PUT',
      body: { new_username: newUsername, password },
      service: 'users',
    });
  },

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/api/v1/auth/change-password', {
      method: 'POST',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
      },
      service: 'auth',
    });
  },

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (email) => {
    return apiRequest('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: { email },
      includeAuth: false,
      service: 'auth',
    });
  },

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  resetPassword: async (token, newPassword) => {
    return apiRequest('/api/v1/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        new_password: newPassword,
      },
      includeAuth: false,
      service: 'auth',
    });
  },

  /**
   * Refresh JWT token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken: async () => {
    return apiRequest('/api/v1/auth/refresh-token', {
      method: 'POST',
      service: 'auth',
    });
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout: async () => {
    try {
      // Backend expects LogoutRequest with optional revoke_all_tokens
      await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
        body: { revoke_all_tokens: false },
        service: 'auth',
      });
    } catch (error) {
      // Even if logout fails on backend, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('carbnb_user');
      localStorage.removeItem('carbnb_token');
    }
  },
};

/**
 * Users API (Admin functions)
 * All user management requests go to the User Service (port 8002)
 */
export const usersAPI = {
  /**
   * Get all users (admin only)
   * GET /api/v1/users?page=1&per_page=20
   */
  getAll: async (page = 1, perPage = 20) => {
    // Verify user has admin role before making request
    const userData = getUserData();
    if (userData && userData.role && !['admin', 'super_admin'].includes(userData.role)) {
      throw new Error('Admin access required. Your current role: ' + (userData.role || 'user'));
    }
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    return apiRequest(`/api/v1/users?page=${page}&per_page=${perPage}`, {
      service: 'users',
      includeAuth: true,
    });
  },

  /**
   * Get user by ID (admin only)
   * GET /api/v1/users/:id
   */
  getById: async (id) => {
    // Verify user has admin role before making request
    const userData = getUserData();
    if (userData && userData.role && !['admin', 'super_admin'].includes(userData.role)) {
      throw new Error('Admin access required. Your current role: ' + (userData.role || 'user'));
    }
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    return apiRequest(`/api/v1/users/${id}`, { 
      service: 'users',
      includeAuth: true,
    });
  },

  /**
   * Get user statistics (admin only)
   * GET /api/v1/users/stats
   */
  getStats: async () => {
    // Verify user has admin role before making request
    const userData = getUserData();
    if (userData && userData.role && !['admin', 'super_admin'].includes(userData.role)) {
      throw new Error('Admin access required. Your current role: ' + (userData.role || 'user'));
    }
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    return apiRequest('/api/v1/users/stats', { 
      service: 'users',
      includeAuth: true,
    });
  },
};

/**
 * Check if current user has admin role
 * @returns {boolean} True if user has admin or super_admin role
 */
export const isAdmin = () => {
  const userData = getUserData();
  if (!userData) return false;
  const role = userData.role || 'user';
  return ['admin', 'super_admin'].includes(role);
};

/**
 * Vehicles API
 * All vehicle requests go to the Vehicle Service (port 3003)
 */
export const vehiclesAPI = {
  /**
   * Get all vehicles
   * GET /api/v1/vehicles
   */
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/vehicles${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, { service: 'vehicles' });
  },

  /**
   * Get vehicle by ID
   * GET /api/v1/vehicles/:id
   */
  getById: async (id) => {
    return apiRequest(`/api/v1/vehicles/${id}`, { service: 'vehicles' });
  },

  /**
   * Create new vehicle
   * POST /api/v1/vehicles
   */
  create: async (vehicleData) => {
    return apiRequest('/api/v1/vehicles', {
      method: 'POST',
      body: vehicleData,
      service: 'vehicles',
    });
  },

  /**
   * Update vehicle
   * PUT /api/v1/vehicles/:id
   */
  update: async (id, vehicleData) => {
    return apiRequest(`/api/v1/vehicles/${id}`, {
      method: 'PUT',
      body: vehicleData,
      service: 'vehicles',
    });
  },

  /**
   * Delete vehicle
   * DELETE /api/v1/vehicles/:id
   */
  delete: async (id) => {
    return apiRequest(`/api/v1/vehicles/${id}`, {
      method: 'DELETE',
      service: 'vehicles',
    });
  },

  /**
   * Get vehicles by owner
   * GET /api/v1/vehicles?owner_id=:ownerId
   * Note: 
   * - For regular users: Backend automatically filters by authenticated user's ID from token (ignores owner_id param)
   * - For admins: If owner_id is provided, filters by that. If not, returns all vehicles.
   * - We don't filter by is_active, so all vehicles (active and inactive) are returned
   */
  getByOwner: async (ownerId) => {
    // Pass owner_id as query parameter
    // For regular users, backend will ignore this and use authenticated user ID from token
    // For admins, this will filter by the specified owner_id
    // We don't pass is_active, so all vehicles regardless of status are returned
    return apiRequest(`/api/v1/vehicles?owner_id=${ownerId}`, { service: 'vehicles' });
  },

  /**
   * Activate or deactivate vehicle (admin only)
   * PATCH /api/v1/vehicles/:id/activate
   * Requires: Vehicle must have license and insurance documents to be activated
   */
  activate: async (id, isActive) => {
    return apiRequest(`/api/v1/vehicles/${id}/activate`, {
      method: 'PATCH',
      body: { is_active: isActive },
      service: 'vehicles',
    });
  },

  /**
   * Get vehicle status
   * GET /api/v1/vehicles/:id/status
   */
  getStatus: async (id) => {
    return apiRequest(`/api/v1/vehicles/${id}/status`, { service: 'vehicles' });
  },

  /**
   * Create vehicle availability period
   * POST /api/v1/vehicles/:id/availability
   */
  createAvailability: async (vehicleId, availabilityData) => {
    return apiRequest(`/api/v1/vehicles/${vehicleId}/availability`, {
      method: 'POST',
      body: availabilityData,
      service: 'vehicles',
    });
  },

  /**
   * List vehicle availability periods
   * GET /api/v1/vehicles/:id/availability
   */
  listAvailability: async (vehicleId) => {
    return apiRequest(`/api/v1/vehicles/${vehicleId}/availability`, {
      service: 'vehicles',
    });
  },

  /**
   * Update vehicle availability period
   * PUT /api/v1/vehicles/availability/:id
   */
  updateAvailability: async (availabilityId, availabilityData) => {
    return apiRequest(`/api/v1/vehicles/availability/${availabilityId}`, {
      method: 'PUT',
      body: availabilityData,
      service: 'vehicles',
    });
  },

  /**
   * Delete vehicle availability period
   * DELETE /api/v1/vehicles/availability/:id
   */
  deleteAvailability: async (availabilityId) => {
    return apiRequest(`/api/v1/vehicles/availability/${availabilityId}`, {
      method: 'DELETE',
      service: 'vehicles',
    });
  },

  /**
   * Check vehicle availability
   * POST /api/v1/vehicles/:id/check-availability
   */
  checkAvailability: async (vehicleId, startDate, endDate) => {
    return apiRequest(`/api/v1/vehicles/${vehicleId}/check-availability`, {
      method: 'POST',
      body: {
        start_date: startDate,
        end_date: endDate,
      },
      service: 'vehicles',
    });
  },

  /**
   * Get vehicle documents
   * GET /api/v1/documents/:vehicle_id/documents
   */
  getDocuments: async (vehicleId) => {
    return apiRequest(`/api/v1/documents/${vehicleId}/documents`, {
      service: 'vehicles',
    });
  },

  /**
   * Upload vehicle document
   * POST /api/v1/documents/upload/:vehicle_id
   */
  uploadDocument: async (vehicleId, file, docType) => {
    // Ensure file has correct MIME type if it's missing or incorrect
    let fileToUpload = file;
    
    // If file type is missing or is application/octet-stream, try to detect it from extension
    if (!file.type || file.type === 'application/octet-stream') {
      const fileName = file.name.toLowerCase();
      let detectedType = file.type;
      
      if (fileName.endsWith('.pdf')) {
        detectedType = 'application/pdf';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        detectedType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        detectedType = 'image/png';
      }
      
      // Create a new File object with the correct MIME type
      if (detectedType && detectedType !== file.type) {
        fileToUpload = new File([file], file.name, { type: detectedType });
      }
    }
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('doc_type', docType);
    
    return apiRequest(`/api/v1/documents/upload/${vehicleId}`, {
      method: 'POST',
      body: formData,
      contentType: null,
      service: 'vehicles',
    });
  },


  /**
   * Delete vehicle document
   * DELETE /api/v1/documents/:doc_id
   */
  deleteDocument: async (docId) => {
    return apiRequest(`/api/v1/documents/${docId}`, {
      method: 'DELETE',
      service: 'vehicles',
    });
  },

  /**
   * Upload vehicle media (photo)
   * POST /api/v1/media/upload/:vehicle_id
   */
  uploadMedia: async (vehicleId, file, isPrimary = false) => {
    // Ensure file has correct MIME type if it's missing or incorrect
    // Use the same logic as uploadDocument
    let fileToUpload = file;
    
    // If file type is missing or is application/octet-stream, try to detect it from extension
    if (!file.type || file.type === 'application/octet-stream') {
      const fileName = file.name.toLowerCase();
      let detectedType = file.type;
      
      if (fileName.endsWith('.pdf')) {
        detectedType = 'application/pdf';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        detectedType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        detectedType = 'image/png';
      } else if (fileName.endsWith('.webp')) {
        detectedType = 'image/webp';
      }
      
      // Create a new File object with the correct MIME type
      if (detectedType && detectedType !== file.type) {
        fileToUpload = new File([file], file.name, { type: detectedType });
      }
    }
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('media_type', 'image');
    formData.append('is_primary', isPrimary.toString());
    
    return apiRequest(`/api/v1/media/upload/${vehicleId}`, {
      method: 'POST',
      body: formData,
      contentType: null,
      service: 'vehicles',
    });
  },

  /**
   * Get vehicle media
   * GET /api/v1/media/:vehicle_id/media
   */
  getMedia: async (vehicleId) => {
    return apiRequest(`/api/v1/media/${vehicleId}/media`, {
      service: 'vehicles',
    });
  },

  /**
   * Delete vehicle media
   * DELETE /api/v1/media/:media_id
   */
  deleteMedia: async (mediaId) => {
    return apiRequest(`/api/v1/media/${mediaId}`, {
      method: 'DELETE',
      service: 'vehicles',
    });
  },
};

/**
 * Bookings API
 * All booking requests go to the Booking Service (port 8003)
 */
export const bookingsAPI = {
  /**
   * Get current user's bookings
   * GET /api/v1/bookings/me
   */
  getMyBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.page_size) queryParams.append('page_size', filters.page_size);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/bookings/me${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, { service: 'bookings' });
  },

  /**
   * Get all bookings (admin only)
   * GET /api/v1/bookings/admin/all
   */
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.vehicle_id) queryParams.append('vehicle_id', filters.vehicle_id);
    if (filters.user_id) queryParams.append('user_id', filters.user_id);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.page_size) queryParams.append('page_size', filters.page_size);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/bookings/admin/all${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, { service: 'bookings' });
  },

  /**
   * Get booking by ID
   * GET /api/v1/bookings/:id
   */
  getById: async (id) => {
    return apiRequest(`/api/v1/bookings/${id}`, { service: 'bookings' });
  },

  /**
   * Create new booking
   * POST /api/v1/bookings
   */
  create: async (bookingData) => {
    return apiRequest('/api/v1/bookings', {
      method: 'POST',
      body: bookingData,
      service: 'bookings',
    });
  },

  /**
   * Update booking
   * PUT /api/v1/bookings/:id
   */
  update: async (id, bookingData) => {
    return apiRequest(`/api/v1/bookings/${id}`, {
      method: 'PUT',
      body: bookingData,
      service: 'bookings',
    });
  },

  /**
   * Cancel booking
   * POST /api/v1/bookings/:id/cancel
   */
  cancel: async (id, reason = null) => {
    const queryParams = new URLSearchParams();
    if (reason) queryParams.append('reason', reason);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/bookings/${id}/cancel${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, {
      method: 'POST',
      service: 'bookings',
    });
  },

  /**
   * Check booking availability
   * POST /api/v1/bookings/check-availability
   */
  checkAvailability: async (availabilityData) => {
    return apiRequest('/api/v1/bookings/check-availability', {
      method: 'POST',
      body: availabilityData,
      service: 'bookings',
    });
  },

  /**
   * Get bookings by user (alias for getMyBookings)
   * GET /api/v1/bookings/me
   */
  getByUser: async (userId, filters = {}) => {
    // Backend uses /me endpoint which automatically uses current user from X-User-Id header
    // If userId is provided, it should match the authenticated user
    return bookingsAPI.getMyBookings(filters);
  },
};

/**
 * Payments API
 */
export const paymentsAPI = {
  /**
   * Process payment
   * POST /api/v1/payments
   */
  process: async (paymentData) => {
    return apiRequest('/api/v1/payments', {
      method: 'POST',
      body: paymentData,
    });
  },

  /**
   * Get payment by ID
   * GET /api/v1/payments/:id
   */
  getById: async (id) => {
    return apiRequest(`/api/v1/payments/${id}`);
  },

  /**
   * Get payments by booking
   * GET /api/v1/payments?booking_id=:bookingId
   */
  getByBooking: async (bookingId) => {
    return apiRequest(`/api/v1/payments?booking_id=${bookingId}`);
  },
};

/**
 * File Upload API
 */
export const uploadAPI = {
  /**
   * Upload file
   * POST /api/v1/upload or /api/upload
   */
  upload: async (file, type = 'car_image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return apiRequest('/api/v1/upload', {
      method: 'POST',
      body: formData,
      contentType: null, // Let browser set Content-Type with boundary
    });
  },
};

/**
 * Sales API (for owner dashboard)
 */
export const salesAPI = {
  /**
   * Get sales
   * GET /api/v1/sales
   */
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/sales${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, {
      service: 'bookings'
    });
  },

  /**
   * Get sales by owner
   * GET /api/v1/sales?owner_id=:ownerId
   */
  getByOwner: async (ownerId) => {
    return apiRequest(`/api/v1/sales?owner_id=${ownerId}`, {
      service: 'bookings'
    });
  },
};

/**
 * Documents API
 * Document management for user verification
 */
export const documentsAPI = {
  /**
   * Get user documents
   * GET /api/v1/users/me/documents
   */
  getMyDocuments: async () => {
    return apiRequest('/api/v1/users/me/documents', { service: 'users' });
  },

  /**
   * Upload document
   * POST /api/v1/documents/upload
   */
  upload: async (file, docType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    
    return apiRequest('/api/v1/documents/upload', {
      method: 'POST',
      body: formData,
      contentType: null, // Let browser set Content-Type for FormData
      service: 'users',
    });
  },

  /**
   * Delete document
   * DELETE /api/v1/users/me/documents/:id
   */
  delete: async (documentId) => {
    return apiRequest(`/api/v1/users/me/documents/${documentId}`, {
      method: 'DELETE',
      service: 'users',
    });
  },

  /**
   * Get document download URL
   * GET /api/v1/documents/:id/download
   */
  getDownloadUrl: async (documentId) => {
    return apiRequest(`/api/v1/documents/${documentId}/download`, {
      service: 'users',
    });
  },

  /**
   * Verify document (Admin only)
   * PATCH /api/v1/documents/:id/verify
   */
  verify: async (documentId, verified) => {
    const formData = new FormData();
    formData.append('verified', verified);
    
    return apiRequest(`/api/v1/documents/${documentId}/verify`, {
      method: 'PATCH',
      body: formData,
      contentType: null,
      service: 'users',
    });
  },
};

// Export default API object for convenience
export default {
  auth: authAPI,
  users: usersAPI,
  vehicles: vehiclesAPI,
  bookings: bookingsAPI,
  payments: paymentsAPI,
  upload: uploadAPI,
  sales: salesAPI,
  documents: documentsAPI,
};
