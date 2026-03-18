import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Vehicle APIs
export const getVehicles = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const response = await api.get(`/vehicles?${params.toString()}`);
  return response.data;
};

export const getVehicle = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

// Financing Calculator
export const calculateFinancing = async (data) => {
  const response = await api.post('/calculate-financing', data);
  return response.data;
};

// Credit Application APIs
export const submitCreditApplication = async (applicationData) => {
  const response = await api.post('/credit-applications', applicationData);
  return response.data;
};

export const getCreditApplications = async () => {
  const response = await api.get('/credit-applications');
  return response.data;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await api.put(`/credit-applications/${id}/status?status=${status}`);
  return response.data;
};

// Reservation APIs
export const createReservation = async (reservationData) => {
  const response = await api.post('/reservations', reservationData);
  return response.data;
};

export const getReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};

export const getReservation = async (id) => {
  const response = await api.get(`/reservations/${id}`);
  return response.data;
};

// Checkout APIs
export const createCheckoutSession = async (reservationId) => {
  const originUrl = window.location.origin;
  const response = await api.post('/checkout/create-session', {
    reservation_id: reservationId,
    origin_url: originUrl,
  });
  return response.data;
};

export const getCheckoutStatus = async (sessionId) => {
  const response = await api.get(`/checkout/status/${sessionId}`);
  return response.data;
};

// Admin APIs
export const adminLogin = async (credentials) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const setupAdmin = async () => {
  const response = await api.post('/admin/setup');
  return response.data;
};

export const seedVehicles = async () => {
  const response = await api.post('/seed-vehicles');
  return response.data;
};

// Format currency in MXN
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default api;
