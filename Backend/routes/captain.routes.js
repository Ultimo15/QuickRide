const express = require("express");
const router = express.Router();
const captainController = require("../controllers/captain.controller");
const { body } = require("express-validator");
const { authCaptain } = require("../middlewares/auth.middleware");

// ✅ REGISTRO (con placa y marca/modelo del vehículo)
router.post("/register",
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("phone").isLength({ min: 10, max: 10 }).withMessage("Phone Number should be of 10 characters only"),
    body("fullname.firstname").isLength({ min: 3 }).withMessage("First name must be at least 3 characters long"),
    body("vehicle.color").isLength({ min: 3 }).withMessage("Vehicle color must be at least 3 characters long"),
    body("vehicle.plate").optional().isLength({ min: 6, max: 10 }).withMessage("Vehicle plate must be between 6 and 10 characters"),
    body("vehicle.number").optional().isLength({ min: 3 }).withMessage("Vehicle number/plate required"),
    body("vehicle.capacity").isInt({ min: 1 }).withMessage("Vehicle capacity must be at least 1"),
    body("vehicle.type").isIn(["car", "bike"]).withMessage("Invalid vehicle type (only car and bike allowed)"),
    body("vehicle.brand").optional().isString(),
    body("vehicle.model").optional().isString(),
    captainController.registerCaptain
);

// ✅ VERIFICAR EMAIL
router.post("/verify-email", captainController.verifyEmail);

// ✅ LOGIN
router.post("/login", 
    body("email").isEmail().withMessage("Invalid Email"),
    captainController.loginCaptain
);

// ✅ ACTUALIZAR PERFIL (con foto, placa, marca/modelo)
router.post("/update",
    authCaptain,
    body("phone").optional().isLength({ min: 10, max: 10 }).withMessage("Phone Number should be of 10 characters only"),
    body("fullname.firstname").optional().isLength({ min: 2 }).withMessage("First name must be at least 2 characters long"),
    body("profilePhoto").optional().isURL().withMessage("Invalid photo URL"),
    body("vehicle.plate").optional().isLength({ min: 6, max: 10 }).withMessage("Vehicle plate must be between 6 and 10 characters"),
    body("vehicle.brand").optional().isString(),
    body("vehicle.model").optional().isString(),
    captainController.updateCaptainProfile
);

// ✅ OBTENER PERFIL
router.get("/profile", authCaptain, captainController.captainProfile);

// ✅ SUBIR FOTO DE PERFIL
router.post("/upload-photo", authCaptain,
    body("photoUrl").notEmpty().withMessage("Photo URL is required"),
    captainController.uploadProfilePhoto
);

// ✅ NUEVO: TOGGLE ESTADO ONLINE/OFFLINE
router.post("/toggle-status", authCaptain, captainController.toggleOnlineStatus);

// ✅ NUEVO: ACTUALIZAR UBICACIÓN GPS
router.post("/update-location",
    authCaptain,
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
    captainController.updateLocation
);

// ✅ LOGOUT
router.get("/logout", authCaptain, captainController.logoutCaptain);

// ✅ RESET PASSWORD
router.post("/reset-password",
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    captainController.resetPassword
);

module.exports = router;