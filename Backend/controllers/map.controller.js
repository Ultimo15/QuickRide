const axios = require('axios');

/**
 * 🗺️ CONTROLADOR DE MAPAS - ACTUALIZADO
 * Ubicación: Backend/controllers/map.controller.js
 * 
 * AGREGAR ESTA FUNCIÓN AL ARCHIVO EXISTENTE
 */

// ==========================================
// 🆕 OBTENER COORDENADAS DESDE DIRECCIÓN
// ==========================================
exports.getCoordinatesFromAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'La dirección es requerida',
      });
    }

    console.log('📍 Obteniendo coordenadas para:', address);

    // Llamar a Google Geocoding API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API,
        },
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      
      console.log('✅ Coordenadas encontradas:', location);

      return res.status(200).json({
        success: true,
        lat: location.lat,
        lng: location.lng,
        formatted_address: response.data.results[0].formatted_address,
      });
    } else if (response.data.status === 'ZERO_RESULTS') {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron coordenadas para esta dirección',
      });
    } else {
      console.error('❌ Error de Google Maps API:', response.data.status);
      return res.status(500).json({
        success: false,
        message: `Error de Google Maps: ${response.data.status}`,
      });
    }
  } catch (error) {
    console.error('❌ Error obteniendo coordenadas:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 🆕 OBTENER DIRECCIÓN DESDE COORDENADAS
// ==========================================
exports.getAddressFromCoordinates = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitud y longitud son requeridas',
      });
    }

    console.log('🗺️ Obteniendo dirección para:', lat, lng);

    // Llamar a Google Reverse Geocoding API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${lat},${lng}`,
          key: process.env.GOOGLE_MAPS_API,
        },
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      
      console.log('✅ Dirección encontrada:', address);

      return res.status(200).json({
        success: true,
        address: address,
        components: response.data.results[0].address_components,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No se encontró dirección para estas coordenadas',
      });
    }
  } catch (error) {
    console.error('❌ Error obteniendo dirección:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};