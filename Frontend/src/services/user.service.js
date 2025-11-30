import api from './api.service';

const userService = {
  // ✅ REGISTRO DE USUARIO
  register: async (userData) => {
    try {
      const response = await api.post('/api/users/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ LOGIN DE USUARIO
  login: async (email, password) => {
    try {
      const response = await api.post('/api/users/login', {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ OBTENER PERFIL
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data.user;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ ACTUALIZAR PERFIL
  updateProfile: async (updateData) => {
    try {
      const response = await api.post('/api/users/update', updateData);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ SUBIR FOTO DE PERFIL
  uploadProfilePhoto: async (photoUrl) => {
    try {
      const response = await api.post('/api/users/upload-photo', {
        photoUrl,
      });
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      updatedUser.profilePhoto = response.data.profilePhoto;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ LOGOUT
  logout: async () => {
    try {
      const response = await api.get('/api/users/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      console.error('Error logging out user:', error);
      // Limpiar localStorage aunque falle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error.response?.data || error.message;
    }
  },

  // ✅ VERIFICAR EMAIL
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/api/users/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ RESET PASSWORD
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/api/users/reset-password', {
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

export default userService;
