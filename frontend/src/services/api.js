import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de Autenticación
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  verifyToken: () => api.post('/auth/verify-token'),
};

// API de Trabajos
export const jobsAPI = {
  getJobs: (params = {}) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params = {}) => api.get('/jobs/my-jobs', { params }),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getCategories: () => api.get('/jobs/categories'),
};

// API de Aplicaciones
export const applicationsAPI = {
  apply: (jobId, coverLetter = '') => 
    api.post('/applications', { jobId, coverLetter }),
  getMyApplications: (params = {}) => 
    api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params = {}) => 
    api.get(`/applications/job/${jobId}`, { params }),
  getAllApplications: (params = {}) => 
    api.get('/applications/all', { params }),
  updateApplicationStatus: (id, status, notes = '') => 
    api.put(`/applications/${id}/status`, { status, notes }),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats'),
};

// API de Usuarios
export const usersAPI = {
  uploadCV: (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api.post('/users/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  downloadCV: (filename) => api.get(`/users/cv/${filename}`, {
    responseType: 'blob',
  }),
  deleteCV: () => api.delete('/users/cv'),
  getPublicProfile: (id) => api.get(`/users/profile/${id}`),
  updateSettings: (settings) => api.put('/users/settings', settings),
  deactivateAccount: () => api.post('/users/deactivate'),
  searchUsers: (params = {}) => api.get('/users/search', { params }),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
};

// API de Exportación
export const exportAPI = {
  exportUsers: () => api.get('/export/users', { responseType: 'blob' }),
  exportJobs: () => api.get('/export/jobs', { responseType: 'blob' }),
  exportApplications: () => api.get('/export/applications', { responseType: 'blob' }),
  exportAll: () => api.get('/export/all', { responseType: 'blob' }),
};

// API de utilidades
export const utilsAPI = {
  health: () => api.get('/health'),
};

// Funciones de utilidad para manejo de errores
export const handleAPIError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de error
    return {
      message: error.response.data.message || 'Error del servidor',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // La request fue hecha pero no se recibió respuesta
    return {
      message: 'No se pudo conectar con el servidor',
      status: 0,
    };
  } else {
    // Algo más pasó al configurar la request
    return {
      message: error.message || 'Error desconocido',
      status: 0,
    };
  }
};

// Función para construir query strings
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      if (Array.isArray(params[key])) {
        params[key].forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, params[key]);
      }
    }
  });
  
  return queryParams.toString();
};

// Función para formatear fechas
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Función para formatear fechas relativas
export const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Hace un momento';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  } else {
    return formatDate(dateString);
  }
};

// Función para truncar texto
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Función para capitalizar texto
export const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default api;
