import api from './api.service';

const rideService = {
  // ✅ CREAR VIAJE
  createRide: async (rideData) => {
    try {
      const response = await api.post('/api/rides/create', {
        pickup: rideData.pickup,
        destination: rideData.destination,
        vehicleType: rideData.vehicleType,
        pickupCoordinates: rideData.pickupCoordinates,
        destinationCoordinates: rideData.destinationCoordinates,
        offeredPrice: rideData.offeredPrice || null,
        paymentMethod: rideData.paymentMethod || 'cash',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating ride:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ OBTENER TARIFA
  getFare: async (pickup, destination) => {
    try {
      const response = await api.get('/api/rides/get-fare', {
        params: { pickup, destination },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting fare:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ CONFIRMAR VIAJE (capitán acepta)
  confirmRide: async (rideId) => {
    try {
      const response = await api.post('/api/rides/confirm', { rideId });
      return response.data;
    } catch (error) {
      console.error('Error confirming ride:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ CANCELAR VIAJE
  cancelRide: async (rideId, reason = null) => {
    try {
      const response = await api.post('/api/rides/cancel', {
        rideId,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling ride:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ INICIAR VIAJE
  startRide: async (rideId, otp) => {
    try {
      const response = await api.get('/api/rides/start-ride', {
        params: { rideId, otp },
      });
      return response.data;
    } catch (error) {
      console.error('Error starting ride:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ FINALIZAR VIAJE
  endRide: async (rideId) => {
    try {
      const response = await api.post('/api/rides/end-ride', { rideId });
      return response.data;
    } catch (error) {
      console.error('Error ending ride:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ CALIFICAR VIAJE
  rateRide: async (rideId, stars, comment = null) => {
    try {
      const response = await api.post('/api/rides/rate', {
        rideId,
        stars,
        comment,
      });
      return response.data;
    } catch (error) {
      console.error('Error rating ride:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ OBTENER HISTORIAL DE VIAJES
  getRideHistory: async () => {
    try {
      const response = await api.get('/api/rides/history');
      return response.data.rides;
    } catch (error) {
      console.error('Error getting ride history:', error);
      throw error.response?.data || error.message;
    }
  },

  // ✅ OBTENER DETALLES DEL CHAT
  getChatDetails: async (rideId) => {
    try {
      const response = await api.get(`/api/rides/chat-details/${rideId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat details:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default rideService;
