const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const { sendMail } = require("../services/mail.service");
let { fillTemplate } = require("../templates/mail.template");

const captainModel = require("../models/captain.model");
const userModel = require("../models/user.model");

// Enviar correo de verificación
module.exports.sendVerificationEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  let user;

  if (req.userType === "user") {
    user = req.user;
  } else if (req.userType === "captain") {
    user = req.captain;
  } else {
    return res.status(400).json({ 
      message: "The email verification link is invalid because of incorrect user type" 
    });
  }

  // Si ya está verificado
  if (user.emailVerified) {
    return res.status(200).json({ 
      message: "Your email is already verified. You may continue using the application.",
      alreadyVerified: true
    });
  }

  // Generar token JWT
  const token = jwt.sign(
    { id: user._id, userType: req.userType, purpose: "email-verification" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  try {
    // Construir link de verificación
    const verification_link = `${process.env.CLIENT_URL}/${req.userType}/verify-email?token=${token}`;
    
    console.log("🔗 Link de verificación generado:", verification_link);

    // Llenar el template del correo
    const emailHtml = fillTemplate({
      name: user.fullname.firstname || user.fullname,
      link: verification_link,
      type: "verification"
    });

    // 📧 ENVIAR EL CORREO
    await sendMail(
      user.email,
      "Verify Your Email - QuickRide",
      emailHtml
    );

    console.log("✅ Correo de verificación enviado exitosamente a:", user.email);

    return res.status(200).json({
      message: "Verification email sent successfully. Please check your inbox.",
      user: {
        email: user.email,
        fullname: user.fullname,
      },
    });

  } catch (error) {
    console.error("❌ Error enviando correo de verificación:", error.message);
    
    return res.status(500).json({ 
      message: "Failed to send verification email. Please try again later.",
      error: process.env.ENVIRONMENT === 'development' ? error.message : undefined
    });
  }
});

// Forgot Password
module.exports.forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email } = req.body;
  const { userType } = req.params;

  let user = null;
  if (userType === "user") {
    user = await userModel.findOne({ email });
  } else if (userType === "captain") {
    user = await captainModel.findOne({ email });
  }
  
  if (!user) {
    return res.status(404).json({ 
      message: "User not found. Please check your credentials and try again" 
    });
  }

  const token = jwt.sign(
    { id: user._id, userType: userType },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.CLIENT_URL}/${userType}/reset-password?token=${token}`;

  try {
    console.log("🔗 Link de reset password generado:", resetLink);

    // Llenar template
    const emailHtml = fillTemplate({
      name: user.fullname.firstname || user.fullname,
      link: resetLink,
      type: "reset-password"
    });

    // 📧 ENVIAR EL CORREO
    await sendMail(
      user.email,
      "Reset Your Password - QuickRide",
      emailHtml
    );

    console.log("✅ Correo de reset password enviado a:", email);

    res.status(200).json({ 
      message: "Password reset email sent successfully. Please check your inbox." 
    });

  } catch (error) {
    console.error("❌ Error enviando correo de reset:", error.message);
    
    return res.status(500).json({ 
      message: "Failed to send reset password email. Please try again later.",
      error: process.env.ENVIRONMENT === 'development' ? error.message : undefined
    });
  }
});

// Reset Password
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { token, password } = req.body;
  const { userType } = req.params;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(400).json({ 
      message: "Invalid or expired token. Please request a new password reset." 
    });
  }

  let user;
  let Model = userType === "user" ? userModel : captainModel;
  user = await Model.findById(payload.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.password = await Model.hashPassword(password);
  await user.save();

  console.log("✅ Password actualizada para:", user.email);

  res.status(200).json({ 
    message: "Password reset successfully. You can now login with your new password." 
  });
});