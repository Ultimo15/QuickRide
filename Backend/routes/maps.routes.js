const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');

/**
 * 🗺️ RUTAS DE MAPAS - ACTUALIZADAS
 * Ubicación: Backend/routes/map.routes.js
 * 
 * AGREGAR ESTAS RUTAS AL ARCHIVO EXISTENTE
 */

// ==========================================
// RUTAS EXISTENTES (mantenerlas)
// ==========================================
// router.get('/get-suggestions', authMiddleware, mapController.getSuggestions);
// router.get('/get-distance-time', authMiddleware, mapController.getDistanceTime);
// ... otras rutas existentes

// ==========================================
// 🆕 NUEVAS RUTAS
// ==========================================

// Obtener coordenadas desde dirección
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