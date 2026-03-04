// API configuration and utility functions

// Base URL for API calls
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Get image URL for uploaded files
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

// Get auth token from storage
export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Admin API: fetch with base URL + Bearer token
export const adminFetch = (path, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { ...options.headers, Authorization: token ? `Bearer ${token}` : '' };
  return fetch(url, { ...options, headers });
};

// Make authenticated API call
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Clear auth data on authentication failure
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userData');
      
      // Redirect to login
      window.location.href = '/';
    }
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Specific API functions
export const api = {
  // Auth endpoints
  login: (endpoint, credentials) => 
    apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (endpoint, userData) => 
    apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Event endpoints
  getEvents: () => apiCall('/api/events'),
  getEvent: (id) => apiCall(`/api/events/${id}`),
  createEvent: (eventData) => 
    apiCall('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
  updateEvent: (id, eventData) => 
    apiCall(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),
  deleteEvent: (id) => 
    apiCall(`/api/events/${id}`, {
      method: 'DELETE',
    }),
  registerForEvent: (id) => 
    apiCall(`/api/events/${id}/register`, {
      method: 'POST',
    }),

  // Profile endpoints
  getAttendeeProfile: () => apiCall('/api/attendees/profile'),
  updateAttendeeProfile: (profileData) => 
    apiCall('/api/attendees/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),
}; 