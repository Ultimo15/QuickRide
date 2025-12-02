const express = require('express');
const router = express.Router();
const { authUser, authCaptain } = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');

/**
 * 🗺️ RUTAS DE MAPAS - COMPLETAS
 * Ubicación: Backend/routes/maps.routes.js
 */

// Middleware que acepta tanto users como captains
const authAny = async (req, res, next) => {
  const token = req.cookies.token || req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Intentar autenticar como user
  try {
    await new Promise((resolve, reject) => {
      authUser(req, res, (err) => {
        if (err) reject(err);
        else if (req.user) resolve();
        else reject(new Error('Not a user'));
      });
    });
    return next();
  } catch (userErr) {
    // Si falla como user, intentar como captain
    try {
      await new Promise((resolve, reject) => {
        authCaptain(req, res, (err) => {
          if (err) reject(err);
          else if (req.captain) resolve();
          else reject(new Error('Not a captain'));
        });
      });
      return next();
    } catch (captainErr) {
      // Si ambos fallan, denegar acceso
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
};

// ==========================================
// RUTAS EXISTENTES
// ==========================================

// Obtener sugerencias de lugares
router.get(
  '/get-suggestions',
  authAny,
  mapController.getAutoCompleteSuggestions
);

// Obtener distancia y tiempo entre dos puntos
router.get(
  '/get-distance-time',
  authAny,
  mapController.getDistanceTime
);

// ==========================================
// NUEVAS RUTAS NECESARIAS
// ==========================================

// Obtener coordenadas desde dirección (para crear viajes)
router.get(
  '/get-coordinates',
  authAny,
  mapController.getCoordinatesFromAddress
);

// Obtener dirección desde coordenadas (para botón "Mi ubicación")
router.get(
  '/get-address-from-coordinates',
  authAny,
  mapController.getAddressFromCoordinates
);

module.exports = router;
