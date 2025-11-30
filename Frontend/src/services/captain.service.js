import api from './api.service';

const captainService = {
  // ✅ REGISTRO DE CAPITÁN
  register: async (captainData) => {
    try {
      const response = await api.post('/api/captains/register', captainData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('captain', JSON.stringify(response.data.captain));
      }
      return response.data;
    } catch (error) {
      console.error('Error registering captain:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ LOGIN DE CAPITÁN
  login: async (email, password) => {
    try {
      const response = await api.post('/api/captains/login', {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('captain', JSON.stringify(response.data.captain));
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in captain:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ OBTENER PERFIL
  getProfile: async () => {
    try {
      const response = await api.get('/api/captains/profile');
      return response.data.captain;
    } catch (error) {
      console.error('Error getting captain profile:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ ACTUALIZAR PERFIL
  updateProfile: async (updateData) => {
    try {
      const response = await api.post('/api/captains/update', updateData);
      if (response.data.captain) {
        localStorage.setItem('captain', JSON.stringify(response.data.captain));
      }
      return response.data;
    } catch (error) {
      console.error('Error updating captain profile:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ CAMBIAR ESTADO ONLINE/OFFLINE
  toggleOnlineStatus: async () => {
    try {
      const response = await api.post('/api/captains/toggle-status');
      if (response.data.captain) {
        localStorage.setItem('captain', JSON.stringify(response.data.captain));
      }
      return response.data;
    } catch (error) {
      console.error('Error toggling captain status:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ ACTUALIZAR UBICACIÓN GPS
  updateLocation: async (latitude, longitude) => {
    try {
      const response = await api.post('/api/captains/update-location', {
        latitude,
        longitude,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating captain location:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ LOGOUT
  logout: async () => {
    try {
      const response = await api.get('/api/captains/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('captain');
      return response.data;
    } catch (error) {
      console.error('Error logging out captain:', error);
      // Limpiar localStorage aunque falle
      localStorage.removeItem('token');
      localStorage.removeItem('captain');
      throw error.response?.data || error.message;
    }
  },

  // ✅ VERIFICAR EMAIL
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/api/captains/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ RESET PASSWORD
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/api/captains/reset-password', {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default captainService;
