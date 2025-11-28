const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// const { sendMail } = require("../services/mail.service"); // YA NO LO NECESITAMOS
let { fillTemplate } = require("../templates/mail.template");

const captainModel = require("../models/captain.model");
const userModel = require("../models/user.model");

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
    return res.status(400).json({ message: "The email verification link is invalid because of incorrect user type" });
  }

  // Si ya está verificado, avisamos
  if (user.emailVerified) {
    return res.status(400).json({ message: "Your email is already verified. You may continue using the application." });
  }

  // Generamos el token igual (por si acaso el frontend lo espera)
  const token = jwt.sign(
    { id: user._id, userType: req.userType, purpose: "email-verification" },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  try {
    // Construimos el link solo para mostrarlo en consola (Logs de Render)
    const verification_link = `${process.env.CLIENT_URL}/${req.userType}/verify-email?token=${token}`;
    
    console.log("----------------------------------------------------");
    console.log("🚨 BYPASS ACTIVADO: Correo NO enviado para evitar error.");
    console.log("🔗 Link generado (copiar si es necesario):", verification_link);
    console.log("✅ ACCIÓN AUTOMÁTICA: Verificando usuario en Base de Datos...");
    console.log("----------------------------------------------------");

    // 🔥 LA MAGIA: AUTO-VERIFICAMOS AL USUARIO AQUÍ MISMO 🔥
    // Esto hace que no sea necesario que el usuario de click en ningún lado.
    if (req.userType === "user") {
        await userModel.findByIdAndUpdate(user._id, { emailVerified: true });
    } else if (req.userType === "captain") {
        await captainModel.findByIdAndUpdate(user._id, { emailVerified: true });
    }

    // Respondemos al frontend como si todo hubiera salido bien
    return res.status(200).json({
      message: "Verification bypassed successfully. Account is now active.",
      user: {
        email: user.email,
        fullname: user.fullname,
      },
    });

  } catch (error) {
    console.error("Error in bypass:", error);
    return res
      .status(500)
      .json({ message: "Failed to process verification bypass" });
  }
});

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
  if (!user) return res.status(404).json({ message: "User not found. Please check your credentials and try again" });

  const token = jwt.sign(
    { id: user._id, type: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.CLIENT_URL}/${userType}/reset-password?token=${token}`;

  // EN LUGAR DE ENVIAR EL CORREO, LO MOSTRAMOS EN LA CONSOLA DE RENDER
  console.log("----------------------------------------------------");
  console.log("🔑 PASSWORD RESET BYPASS");
  console.log("👤 Usuario:", email);
  console.log("🔗 USA ESTE LINK PARA CAMBIAR PASSWORD:", resetLink);
  console.log("----------------------------------------------------");

  // Respondemos éxito
  res.status(200).json({ message: "Reset password email sent successfully (Check server logs for link)" });
});

// Reset Password (Este se queda igual porque no envía correos, solo cambia la password)
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors.array());

  const { token, password } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const user = await userModel.findById(payload.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = await userModel.hashPassword(password);
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});
