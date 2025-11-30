const asyncHandler = require("express-async-handler");
const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");

// ✅ REGISTRO DE CAPITÁN (con placa en lugar de número)
module.exports.registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password, phone, vehicle } = req.body;

  const alreadyExists = await captainModel.findOne({ email });

  if (alreadyExists) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  const captain = await captainService.createCaptain(
    fullname.firstname,
    fullname.lastname,
    email,
    password,
    phone,
    vehicle.color,
    vehicle.plate || vehicle.number, // ✅ Soporte para "plate" o "number"
    vehicle.capacity,
    vehicle.type,
    vehicle.brand,
    vehicle.model
  );

  const token = captain.generateAuthToken();
  res
    .status(201)
    .json({ message: "Captain registered successfully", token, captain });
});

module.exports.verifyEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ 
      message: "Invalid verification link", 
      error: "Token is required" 
    });
  }

  let decodedTokenData = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedTokenData || decodedTokenData.purpose !== "email-verification") {
    return res.status(400).json({ 
      message: "You're trying to use an invalid or expired verification link", 
      error: "Invalid token" 
    });
  }

  let captain = await captainModel.findOne({ _id: decodedTokenData.id });

  if (!captain) {
    return res.status(404).json({ 
      message: "User not found. Please ask for another verification link." 
    });
  }

  if (captain.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  captain.emailVerified = true;
  await captain.save();

  res.status(200).json({
    message: "Email verified successfully",
  });
});

module.exports.loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    res.status(404).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  const token = captain.generateAuthToken();
  res.cookie("token", token);
  res.json({ message: "Logged in successfully", token, captain });
});

module.exports.captainProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ captain: req.captain });
});

// ✅ ACTUALIZAR PERFIL DE CAPITÁN (con foto y placa)
module.exports.updateCaptainProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, phone, profilePhoto, vehicle } = req.body;

  const updateData = {};
  
  if (fullname) updateData.fullname = fullname;
  if (phone) updateData.phone = phone;
  if (profilePhoto) updateData.profilePhoto = profilePhoto;
  
  // ✅ Actualizar datos del vehículo si se proporcionan
  if (vehicle) {
    updateData.vehicle = {
      ...req.captain.vehicle,
      ...vehicle,
    };
    
    // Si se envía "number", convertirlo a "plate"
    if (vehicle.number && !vehicle.plate) {
      updateData.vehicle.plate = vehicle.number;
      delete updateData.vehicle.number;
    }
  }

  const updatedCaptainData = await captainModel.findOneAndUpdate(
    { _id: req.captain._id },
    updateData,
    { new: true }
  );

  res.status(200).json({
    message: "Profile updated successfully",
    captain: updatedCaptainData,
  });
});

// ✅ NUEVO: CAMBIAR ESTADO ONLINE/OFFLINE
module.exports.toggleOnlineStatus = asyncHandler(async (req, res) => {
  try {
    const captain = await captainModel.findById(req.captain._id);

    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    // No permitir cambiar si está ocupado (busy)
    if (captain.status === "busy") {
      return res.status(400).json({ 
        message: "Cannot change status while on an active ride" 
      });
    }

    await captain.toggleOnlineStatus();

    console.log(`🔄 Captain ${captain._id} status: ${captain.status}`);

    res.status(200).json({
      message: `Status changed to ${captain.status}`,
      status: captain.status,
      captain,
    });
  } catch (error) {
    console.error("Error en toggleOnlineStatus:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ NUEVO: ACTUALIZAR UBICACIÓN DEL CAPITÁN
module.exports.updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ 
      message: "Latitude and longitude are required" 
    });
  }

  const captain = await captainModel.findByIdAndUpdate(
    req.captain._id,
    {
      location: {
        ltd: latitude,
        lng: longitude,
      },
    },
    { new: true }
  );

  res.status(200).json({
    message: "Location updated successfully",
    location: captain.location,
  });
});

module.exports.logoutCaptain = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.token;

  await blacklistTokenModel.create({ token });

  // ✅ Marcar como offline al cerrar sesión
  try {
    await captainModel.findByIdAndUpdate(req.captain._id, {
      status: "offline",
      lastOnline: new Date(),
    });
  } catch (error) {
    console.error("Error updating captain status on logout:", error);
  }

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { token, password } = req.body;
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ 
        message: "This password reset link has expired or is no longer valid. Please request a new one to continue" 
      });
    } else {
      return res.status(400).json({ 
        message: "The password reset link is invalid or has already been used. Please request a new one to proceed", 
        error: err 
      });
    }
  }

  const captain = await captainModel.findById(payload.id);
  if (!captain) {
    return res.status(404).json({ 
      message: "User not found. Please check your credentials and try again" 
    });
  }

  captain.password = await captainModel.hashPassword(password);
  await captain.save();

  res.status(200).json({ 
    message: "Your password has been successfully reset. You can now log in with your new credentials" 
  });
});