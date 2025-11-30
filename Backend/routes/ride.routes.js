const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// ✅ Detalles del chat
router.get('/chat-details/:id', rideController.chatDetails);

// ✅ CREAR VIAJE (con coordenadas, precio ofertado, método de pago)
router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn(['car', 'bike']).withMessage('Invalid vehicle type (only car and bike allowed)'),
    body('pickupCoordinates.lat').isFloat().withMessage('Invalid pickup latitude'),
    body('pickupCoordinates.lng').isFloat().withMessage('Invalid pickup longitude'),
    body('destinationCoordinates.lat').isFloat().withMessage('Invalid destination latitude'),
    body('destinationCoordinates.lng').isFloat().withMessage('Invalid destination longitude'),
    body('offeredPrice').optional().isFloat({ min: 0 }).withMessage('Offered price must be a positive number'),
    body('paymentMethod').optional().isIn(['cash', 'nequi']).withMessage('Invalid payment method'),
    rideController.createRide
);

// ✅ OBTENER TARIFA
router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
);

// ✅ CONFIRMAR VIAJE (capitán acepta)
router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
);

// ✅ CANCELAR VIAJE (mejorado con razón)
router.post('/cancel',
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('reason').optional().isString().isLength({ max: 500 }).withMessage('Cancellation reason too long'),
    rideController.cancelRide
);

// ✅ INICIAR VIAJE (con OTP)
router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
);

// ✅ FINALIZAR VIAJE
router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
);

// ✅ NUEVO: CALIFICAR VIAJE
router.post('/rate',
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('stars').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().isLength({ max: 500 }).withMessage('Comment too long'),
    rideController.rateRide
);

// ✅ NUEVO: HISTORIAL DE VIAJES
router.get('/history',
    rideController.getRideHistory
);

module.exports = router;