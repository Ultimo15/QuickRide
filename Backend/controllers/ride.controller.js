const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/map.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

module.exports.chatDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const ride = await rideModel
      .findOne({ _id: id })
      .populate("user", "socketId fullname phone profilePhoto")
      .populate("captain", "socketId fullname phone profilePhoto");

    if (!ride) {
      return res.status(400).json({ message: "Ride not found" });
    }

    const response = {
      user: {
        socketId: ride.user?.socketId,
        fullname: ride.user?.fullname,
        phone: ride.user?.phone,
        profilePhoto: ride.user?.profilePhoto,
        _id: ride.user?._id,
      },
      captain: {
        socketId: ride.captain?.socketId,
        fullname: ride.captain?.fullname,
        phone: ride.captain?.phone,
        profilePhoto: ride.captain?.profilePhoto,
        _id: ride.captain?._id,
      },
      messages: ride.messages,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREAR VIAJE CON MEJORAS
module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    pickup, 
    destination, 
    vehicleType, 
    pickupCoordinates, 
    destinationCoordinates,
    offeredPrice,
    paymentMethod 
  } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
      pickupCoordinates,
      destinationCoordinates,
      offeredPrice,
      paymentMethod: paymentMethod || "cash",
    });

    const user = await userModel.findOne({ _id: req.user._id });
    if (user) {
      user.rides.push(ride._id);
      await user.save();
    }

    // Respondemos al pasajero de inmediato
    res.status(201).json(ride);

    // Proceso en segundo plano para notificar conductores
    Promise.resolve().then(async () => {
      try {
        // Radio aumentado a 100km para asegurar que encuentre al conductor
        const searchRadius = 100;

        const captainsInRadius = await mapService.getCaptainsInTheRadius(
          pickupCoordinates.lat,
          pickupCoordinates.lng,
          searchRadius,
          vehicleType
        );

        const rideWithUser = await rideModel
          .findOne({ _id: ride._id })
          .populate("user");

        console.log(
          `🚗 Conductores encontrados en ${searchRadius}km: ${captainsInRadius.length}`
        );

        captainsInRadius.forEach((captain) => {
          console.log(
            `📢 Notificando a: ${captain.fullname.firstname} ${captain.fullname.lastname}`
          );
          
          sendMessageToSocketId(captain.socketId, {
            event: "new-ride",
            data: {
              ...rideWithUser.toObject(),
              otp: undefined, // No enviar OTP a los conductores
            },
          });
        });
      } catch (e) {
        console.error("❌ Background task failed:", e.message);
      }
    });
  } catch (err) {
    console.error("❌ Error en createRide:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ OBTENER TARIFA
module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const { fare, distanceTime } = await rideService.getFare(
      pickup,
      destination
    );
    return res.status(200).json({ fare, distanceTime });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ CONFIRMAR VIAJE (cuando capitán acepta)
module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const rideDetails = await rideModel.findOne({ _id: rideId });

    if (!rideDetails) {
      return res.status(404).json({ message: "Ride not found." });
    }

    // Validar estado del viaje
    switch (rideDetails.status) {
      case "accepted":
        return res.status(400).json({
          message:
            "The ride is accepted by another captain before you. Better luck next time.",
        });

      case "ongoing":
        return res.status(400).json({
          message: "The ride is currently ongoing with another captain.",
        });

      case "completed":
        return res
          .status(400)
          .json({ message: "The ride has already been completed." });

      case "cancelled":
        return res
          .status(400)
          .json({ message: "The ride has been cancelled." });

      default:
        break;
    }

    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    // Obtener el socketId del usuario
    const user = await userModel.findById(ride.user);

    if (!user || !user.socketId) {
      console.error(`❌ Usuario ${ride.user} no tiene socketId activo`);
      return res.status(200).json(ride);
    }

    console.log(`✅ Emitiendo ride-confirmed a usuario: ${user._id}`);

    // Emitir al usuario que su viaje fue aceptado
    sendMessageToSocketId(user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.error("❌ Error en confirmRide:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ INICIAR VIAJE
module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.error("❌ Error en startRide:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ FINALIZAR VIAJE
module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, captain: req.captain });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.error("❌ Error en endRide:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ CANCELAR VIAJE (MEJORADO)
module.exports.cancelRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, reason } = req.body;

  try {
    console.log(`🚫 Cancelando viaje: ${rideId}`);

    // Determinar quién cancela (user o captain)
    const cancelledBy = req.user ? "user" : req.captain ? "captain" : "system";

    const ride = await rideService.cancelRide({
      rideId,
      cancelledBy,
      reason,
    });

    // Notificar a la otra parte
    if (cancelledBy === "user" && ride.captain) {
      const captain = await captainModel.findById(ride.captain._id);
      if (captain && captain.socketId) {
        sendMessageToSocketId(captain.socketId, {
          event: "ride-cancelled",
          data: ride,
        });
      }
    } else if (cancelledBy === "captain" && ride.user) {
      const user = await userModel.findById(ride.user._id);
      if (user && user.socketId) {
        sendMessageToSocketId(user.socketId, {
          event: "ride-cancelled",
          data: ride,
        });
      }
    }

    return res.status(200).json(ride);
  } catch (err) {
    console.error("❌ Error en cancelRide:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ NUEVO: CALIFICAR VIAJE
module.exports.rateRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, stars, comment } = req.body;

  try {
    // Determinar quién califica (user o captain)
    const ratedBy = req.user ? "user" : req.captain ? "captain" : null;

    if (!ratedBy) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const ride = await rideService.rateRide({
      rideId,
      ratedBy,
      stars,
      comment,
    });

    console.log(`⭐ Viaje ${rideId} calificado por ${ratedBy}: ${stars} estrellas`);

    return res.status(200).json({
      message: "Rating submitted successfully",
      ride,
    });
  } catch (err) {
    console.error("❌ Error en rateRide:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ NUEVO: OBTENER HISTORIAL DE VIAJES
module.exports.getRideHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.captain._id;
    const userType = req.user ? "user" : "captain";

    const query = userType === "user" ? { user: userId } : { captain: userId };

    const rides = await rideModel
      .find(query)
      .populate("user", "fullname phone profilePhoto rating")
      .populate("captain", "fullname phone profilePhoto rating vehicle")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ rides });
  } catch (err) {
    console.error("❌ Error en getRideHistory:", err);
    return res.status(500).json({ message: err.message });
  }
};