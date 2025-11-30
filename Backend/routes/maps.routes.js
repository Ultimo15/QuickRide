const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');

/**
 * 🗺️ RUTAS DE MAPAS - COMPLETAS
 * Ubicación: Backend/routes/maps.routes.js
 * 
 * ⚠️ ESTE ES EL ARCHIVO COMPLETO
 * Reemplaza todo el contenido del archivo maps.routes.js con este código
 */

// ==========================================
// RUTAS EXISTENTES
// ==========================================

// Obtener sugerencias de lugares
router.get(
  '/get-suggestions',
  authMiddleware,
  mapController.getAutoCompleteSuggestions
);

// Obtener distancia y tiempo entre dos puntos
router.get(
  '/get-distance-time',
  authMiddleware,
  mapController.getDistanceTime
);

// ==========================================
// 🆕 NUEVAS RUTAS NECESARIAS
// ==========================================

// Obtener coordenadas desde dirección (para crear viajes)
router.get(
  '/get-coordinates',
  authMiddleware,
  mapController.getCoordinatesFromAddress
);

// Obtener dirección desde coordenadas (para botón "Mi ubicación")
router.get(
  '/get-address-from-coordinates',
  authMiddleware,
  mapController.getAddressFromCoordinates
);

module.exports = router;