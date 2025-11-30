import axios from 'axios';

// Configuración base de la API
const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró o no es válido
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('captain');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;