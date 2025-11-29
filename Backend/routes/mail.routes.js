const express = require("express");
const router = express.Router();
const mailController = require("../controllers/mail.controller");
const { body } = require("express-validator");
const { authUser, authCaptain } = require("../middlewares/auth.middleware");

// Rutas de verificación de email
router.get("/verify-user-email", authUser, mailController.sendVerificationEmail);
router.get("/verify-captain-email", authCaptain, mailController.sendVerificationEmail);

// Ruta de forgot password
router.post(
  "/:userType/forgot-password",
  [
    body("email").isEmail().withMessage("Please provide a valid email address")
  ],
  mailController.forgotPassword
);

// Ruta de reset password
router.post(
  "/:userType/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
  ],
  mailController.resetPassword
);

module.exports = router;